import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WeeklyReviewScreen from '../WeeklyReviewScreen';
import { usePlanner } from '../../store/PlannerContext';
import { usePeaks } from '../../store/PeaksContext';
import { useThemeColors } from '../../utils/useThemeColors';
import { useLocale } from '../../store/LocaleContext';
import { Colors } from '../../utils/theme';
import { t } from '../../utils/i18n';
import type { Category, BlockTemplate, ScheduledBlock, WeeklyPlan, Peak } from '../../types';

jest.mock('../../store/PlannerContext', () => ({
  usePlanner: jest.fn(),
}));

jest.mock('../../store/PeaksContext', () => ({
  usePeaks: jest.fn(),
}));

jest.mock('../../utils/useThemeColors', () => ({
  useThemeColors: jest.fn(),
}));

jest.mock('../../store/LocaleContext', () => ({
  useLocale: jest.fn(),
}));

const mockUsePlanner = usePlanner as jest.Mock;
const mockUsePeaks = usePeaks as jest.Mock;
const mockUseThemeColors = useThemeColors as jest.Mock;
const mockUseLocale = useLocale as jest.Mock;

describe('WeeklyReviewScreen', () => {
  const mockNavigation = {
    setOptions: jest.fn(),
  } as unknown as Parameters<typeof WeeklyReviewScreen>[0]['navigation'];

  const defaultCategory: Category = {
    id: 'cat1',
    name: 'Work',
    color: '#3B82F6',
    emoji: 'briefcase',
    targetHoursPerWeek: 10,
  };

  const secondaryCategory: Category = {
    id: 'cat2',
    name: 'Exercise',
    color: '#10B981',
    emoji: 'run',
    targetHoursPerWeek: 5,
  };

  const defaultTemplate: BlockTemplate = {
    id: 'tpl1',
    name: 'Focus Block',
    categoryId: 'cat1',
    durationHours: 2,
  };

  const secondaryTemplate: BlockTemplate = {
    id: 'tpl2',
    name: 'Workout Block',
    categoryId: 'cat2',
    durationHours: 1,
  };

  const mockChangeWeek = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-08T12:00:00Z'));

    mockUseThemeColors.mockReturnValue({
      colors: Colors.light,
      isDark: false,
    });

    mockUseLocale.mockReturnValue({
      locale: 'en',
      isReloading: false,
      changeLocale: jest.fn(),
    });

    mockUsePlanner.mockReturnValue({
      currentPlan: {
        weekId: '2026-10-05',
        blocks: [],
      } as WeeklyPlan,
      currentWeekId: '2026-10-05',
      changeWeek: mockChangeWeek,
      isLoading: false,
      categories: [defaultCategory, secondaryCategory],
      templates: [defaultTemplate, secondaryTemplate],
    });

    mockUsePeaks.mockReturnValue({
      peaks: [] as Peak[],
      streak: 3,
      lastActiveDate: '2026-10-08',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('header and options', () => {
    it('sets navigation header style with light colors', async () => {
      await render(<WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />);

      expect(mockNavigation.setOptions).toHaveBeenCalledWith({
        headerStyle: { backgroundColor: Colors.light.surface },
        headerTintColor: Colors.light.text,
      });
    });

    it('sets navigation header style with dark colors when theme is dark', async () => {
      mockUseThemeColors.mockReturnValue({
        colors: Colors.dark,
        isDark: true,
      });

      await render(<WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />);

      expect(mockNavigation.setOptions).toHaveBeenCalledWith({
        headerStyle: { backgroundColor: Colors.dark.surface },
        headerTintColor: Colors.dark.text,
      });
    });
  });

  describe('week navigation', () => {
    it('calls changeWeek with previous week when previous button is pressed', async () => {
      const { getByLabelText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      await fireEvent.press(getByLabelText(t('review.prevWeek')));

      expect(mockChangeWeek).toHaveBeenCalledWith('2026-09-28');
    });

    it('calls changeWeek with next week when next button is pressed', async () => {
      const { getByLabelText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      await fireEvent.press(getByLabelText(t('review.nextWeek')));

      expect(mockChangeWeek).toHaveBeenCalledWith('2026-10-12');
    });

    it('does not trigger changeWeek when navigation buttons are disabled due to loading', async () => {
      mockUsePlanner.mockReturnValue({
        currentPlan: { weekId: '2026-10-05', blocks: [] },
        currentWeekId: '2026-10-05',
        changeWeek: mockChangeWeek,
        isLoading: true,
        categories: [defaultCategory],
        templates: [defaultTemplate],
      });

      const { getByLabelText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      await fireEvent.press(getByLabelText(t('review.prevWeek')));
      await fireEvent.press(getByLabelText(t('review.nextWeek')));

      expect(mockChangeWeek).not.toHaveBeenCalled();
    });

    it('displays the current week pill when viewing the current week', async () => {
      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.currentWeek'))).toBeTruthy();
    });

    it('does not display the current week pill when viewing a past week', async () => {
      mockUsePlanner.mockReturnValue({
        currentPlan: { weekId: '2026-09-28', blocks: [] },
        currentWeekId: '2026-09-28',
        changeWeek: mockChangeWeek,
        isLoading: false,
        categories: [defaultCategory],
        templates: [defaultTemplate],
      });

      const { queryByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(queryByText(t('review.currentWeek'))).toBeNull();
    });
  });

  describe('week restoration on unmount', () => {
    it('restores the initial week on unmount if current week was changed', async () => {
      const { rerender, unmount } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      mockUsePlanner.mockReturnValue({
        currentPlan: { weekId: '2026-09-28', blocks: [] },
        currentWeekId: '2026-09-28',
        changeWeek: mockChangeWeek,
        isLoading: false,
        categories: [defaultCategory],
        templates: [defaultTemplate],
      });

      await rerender(<WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />);
      await unmount();

      expect(mockChangeWeek).toHaveBeenCalledWith('2026-10-05');
    });

    it('does not call changeWeek on unmount if the week was not changed', async () => {
      const { unmount } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      await unmount();

      expect(mockChangeWeek).not.toHaveBeenCalled();
    });
  });

  describe('upcoming week view', () => {
    beforeEach(() => {
      mockUsePlanner.mockReturnValue({
        currentPlan: { weekId: '2026-10-12', blocks: [] },
        currentWeekId: '2026-10-12',
        changeWeek: mockChangeWeek,
        isLoading: false,
        categories: [defaultCategory],
        templates: [defaultTemplate],
      });
    });

    it('displays the upcoming week banner in the hero card', async () => {
      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.futureWeek'))).toBeTruthy();
    });

    it('does not render ReviewTiles or SkippedCard in upcoming week', async () => {
      const { queryByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(queryByText(t('review.skipped'))).toBeNull();
      expect(queryByText(t('review.campsCompleted'))).toBeNull();
    });

    it('renders categories card with scheduled targets in upcoming week', async () => {
      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.categories'))).toBeTruthy();
      expect(getByText('Work')).toBeTruthy();
    });
  });

  describe('empty week view', () => {
    it('displays empty week state in HeroCard when no blocks are scheduled', async () => {
      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.emptyWeek'))).toBeTruthy();
    });

    it('displays no skipped blocks placeholder in SkippedCard when no blocks are skipped', async () => {
      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.noSkipped'))).toBeTruthy();
    });
  });

  describe('active week with blocks', () => {
    const blocks: ScheduledBlock[] = [
      {
        id: 'b1',
        templateId: 'tpl1',
        day: 'lun',
        startTime: '09:00',
        done: true,
      },
      {
        id: 'b2',
        templateId: 'tpl1',
        day: 'mar',
        startTime: '09:00',
        done: false,
      },
      {
        id: 'b3',
        templateId: 'tpl2',
        day: 'mer',
        startTime: '10:00',
        done: true,
      },
    ];

    beforeEach(() => {
      mockUsePlanner.mockReturnValue({
        currentPlan: {
          weekId: '2026-10-05',
          blocks,
        },
        currentWeekId: '2026-10-05',
        changeWeek: mockChangeWeek,
        isLoading: false,
        categories: [defaultCategory, secondaryCategory],
        templates: [defaultTemplate, secondaryTemplate],
      });
    });

    it('renders stats, categories, review tiles and skipped blocks', async () => {
      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.categories'))).toBeTruthy();
      expect(getByText('Work')).toBeTruthy();
      expect(getByText('Exercise')).toBeTruthy();
      expect(getByText(t('review.hours'))).toBeTruthy();
      expect(getByText(t('review.blocks'))).toBeTruthy();
      expect(getByText(t('review.skipped'))).toBeTruthy();
      expect(getByText(t('review.campsCompleted'))).toBeTruthy();
    });

    it('renders streak days count in streak tile', async () => {
      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.streakDays', { count: 3 }))).toBeTruthy();
    });
  });

  describe('skipped blocks expansion', () => {
    it('shows and expands skipped blocks when count exceeds preview limit', async () => {
      const manySkippedBlocks: ScheduledBlock[] = Array.from({ length: 8 }, (_, idx) => ({
        id: `skip_${idx}`,
        templateId: 'tpl1',
        day: 'lun',
        startTime: `${String(8 + idx).padStart(2, '0')}:00`,
        done: false,
      }));

      mockUsePlanner.mockReturnValue({
        currentPlan: {
          weekId: '2026-09-28',
          blocks: manySkippedBlocks,
        },
        currentWeekId: '2026-09-28',
        changeWeek: mockChangeWeek,
        isLoading: false,
        categories: [defaultCategory],
        templates: [defaultTemplate],
      });

      const { getByText, queryByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      const showAllButton = getByText(t('review.showAll', { count: 8 }));
      expect(showAllButton).toBeTruthy();

      await fireEvent.press(showAllButton);

      expect(queryByText(t('review.showAll', { count: 8 }))).toBeNull();
    });
  });

  describe('peaks and camps', () => {
    it('renders PeaksCard when camps are completed in the week', async () => {
      const peakWithCompletedCamp: Peak = {
        id: 'p1',
        name: 'Mount Everest',
        camps: [
          {
            id: 'c1',
            name: 'Base Camp',
            done: true,
            order: 0,
            completedAt: '2026-10-06T10:00:00Z',
          },
        ],
        createdAt: '2026-01-01T00:00:00Z',
      };

      mockUsePeaks.mockReturnValue({
        peaks: [peakWithCompletedCamp],
        streak: 1,
        lastActiveDate: '2026-10-06',
      });

      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText(t('review.peaks'))).toBeTruthy();
      expect(getByText('Base Camp · Mount Everest')).toBeTruthy();
    });

    it('renders reached peak in PeaksCard when peak is completed in the week', async () => {
      const completedPeak: Peak = {
        id: 'p2',
        name: 'Mont Blanc',
        completedAt: '2026-10-07T12:00:00Z',
        camps: [],
        createdAt: '2026-01-01T00:00:00Z',
      };

      mockUsePeaks.mockReturnValue({
        peaks: [completedPeak],
        streak: 2,
        lastActiveDate: '2026-10-07',
      });

      const { getByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(getByText('Mont Blanc')).toBeTruthy();
    });

    it('does not render PeaksCard when no camps or peaks were completed', async () => {
      mockUsePeaks.mockReturnValue({
        peaks: [],
        streak: 0,
        lastActiveDate: undefined,
      });

      const { queryByText } = await render(
        <WeeklyReviewScreen navigation={mockNavigation} route={{} as any} />
      );

      expect(queryByText(t('review.peaks'))).toBeNull();
    });
  });
});
