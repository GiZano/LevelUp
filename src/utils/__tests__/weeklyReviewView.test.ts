import { Category } from '../../types';
import { CategoryReview } from '../weeklyReview';
import { formatHours, getCategoryBar, getTargetStatus } from '../weeklyReviewView';

const category = (): Category => ({
  id: 'cat1',
  name: 'Study',
  color: '#fff',
  emoji: '',
  targetHoursPerWeek: 0,
});

describe('target status and category bar', () => {
  const item = (overrides: Partial<CategoryReview> = {}): CategoryReview => ({
    category: category(),
    scheduled: 4,
    completed: 1,
    target: 6,
    metTarget: false,
    ...overrides,
  });

  it('has no status when the category has no target', () => {
    expect(getTargetStatus(item({ target: 0 }), 'past')).toBe('none');
  });

  it('has no status in an upcoming week even with a target', () => {
    expect(getTargetStatus(item(), 'upcoming')).toBe('none');
    expect(getTargetStatus(item({ completed: 6, metTarget: true }), 'upcoming')).toBe('none');
  });

  it('is met in current and past weeks once the target is reached', () => {
    const met = item({ completed: 6, metTarget: true });

    expect(getTargetStatus(met, 'current')).toBe('met');
    expect(getTargetStatus(met, 'past')).toBe('met');
  });

  it('is in progress rather than missed while the week is current', () => {
    expect(getTargetStatus(item(), 'current')).toBe('inProgress');
  });

  it('is missed once a past week ended below target', () => {
    expect(getTargetStatus(item(), 'past')).toBe('missed');
  });

  it('measures completed hours against the target', () => {
    expect(getCategoryBar(item({ completed: 3 }), 'current')).toEqual({
      amount: 3,
      goal: 6,
      fraction: 0.5,
    });
  });

  it('caps the bar fraction at 1 when the target is exceeded', () => {
    expect(getCategoryBar(item({ completed: 9 }), 'past').fraction).toBe(1);
  });

  it('measures scheduled hours against the target in an upcoming week', () => {
    expect(getCategoryBar(item({ scheduled: 3, completed: 0 }), 'upcoming')).toEqual({
      amount: 3,
      goal: 6,
      fraction: 0.5,
    });
  });

  it('falls back to scheduled hours as the goal when there is no target', () => {
    expect(getCategoryBar(item({ target: 0, scheduled: 4, completed: 1 }), 'past')).toEqual({
      amount: 1,
      goal: 4,
      fraction: 0.25,
    });
  });

  it('has an empty bar when there is neither a target nor scheduled hours', () => {
    expect(getCategoryBar(item({ target: 0, scheduled: 0, completed: 0 }), 'past').fraction).toBe(
      0
    );
  });
});

describe('formatHours', () => {
  it('drops trailing zeros', () => {
    expect(formatHours(2, 'en')).toBe('2');
  });

  it('keeps one decimal using the locale separator', () => {
    expect(formatHours(2.5, 'en')).toBe('2.5');
    expect(formatHours(2.5, 'de')).toBe('2,5');
  });

  it('rounds to one decimal and removes floating point noise', () => {
    expect(formatHours(0.7 + 0.1, 'en')).toBe('0.8');
    expect(formatHours(1.26, 'en')).toBe('1.3');
  });

  it('rounds an exact half up', () => {
    expect(formatHours(0.25, 'en')).toBe('0.3');
  });
});
