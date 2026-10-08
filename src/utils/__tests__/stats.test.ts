import type { Camp, Peak } from '../../types';
import { peakProgress, computeStats, isPeakComplete, updateStreak } from '../stats';

const makeCamp = (index: number, done: boolean): Camp => ({
  id: `c${index}`,
  name: `Camp ${index}`,
  done,
  order: index,
});

const makePeak = (campStates: boolean[], overrides: Partial<Peak> = {}): Peak => ({
  id: 'p1',
  name: 'Test Peak',
  createdAt: '2026-01-01',
  camps: campStates.map((done, index) => makeCamp(index + 1, done)),
  ...overrides,
});

describe('stats utilities', () => {
  it('should calculate peak progress correctly', () => {
    expect(peakProgress(makePeak([true, false]))).toBe(0.5);
  });

  it('should return 0 when there are no camps', () => {
    expect(peakProgress(makePeak([]))).toBe(0);
  });

  it('should correctly identify a completed peak', () => {
    expect(isPeakComplete(makePeak([true, true]))).toBe(true);
  });

  it('should not identify an incomplete peak as completed', () => {
    expect(isPeakComplete(makePeak([true, false]))).toBe(false);
  });

  it('should compute overall stats correctly', () => {
    const peaks: Peak[] = [makePeak([true, true]), makePeak([true, false], { id: 'p2' })];

    const stats = computeStats(peaks, 5, '2026-01-01', 10);
    // 3 completed camps * 100 + 10 hours = 310 totalAltitude
    // 1 peak reached
    expect(stats.totalAltitude).toBe(310);
    expect(stats.peaksReached).toBe(1);
    expect(stats.currentStreak).toBe(5);
  });
});

describe('computeStats edge cases', () => {
  it('returns zeroed stats for an empty peak list', () => {
    const stats = computeStats([], 0);

    expect(stats).toEqual({
      totalAltitude: 0,
      peaksReached: 0,
      currentStreak: 0,
      lastActiveDate: undefined,
      totalCompletedHours: 0,
    });
  });

  it('does not count a peak without camps as reached', () => {
    const peaks: Peak[] = [makePeak([])];

    const stats = computeStats(peaks, 2, '2026-10-07');

    expect(stats.peaksReached).toBe(0);
    expect(stats.totalAltitude).toBe(0);
    expect(stats.lastActiveDate).toBe('2026-10-07');
  });

  it('defaults totalCompletedHours to 0 and adds hours on top of camp altitude', () => {
    const peaks: Peak[] = [makePeak([true])];

    expect(computeStats(peaks, 1).totalAltitude).toBe(100);
    expect(computeStats(peaks, 1, undefined, 7).totalAltitude).toBe(107);
  });

  it('sums completed camps and reached peaks across several peaks', () => {
    const peaks: Peak[] = [makePeak([true]), makePeak([true, true]), makePeak([false])];

    const stats = computeStats(peaks, 3);

    expect(stats.totalAltitude).toBe(300);
    expect(stats.peaksReached).toBe(2);
  });
});

describe('updateStreak', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-08T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts a streak of 1 on the first activity', () => {
    const result = updateStreak(0, undefined);

    expect(result).toEqual({ streak: 1, lastActiveDate: '2026-10-08' });
  });

  it('keeps the streak unchanged when already active today', () => {
    const result = updateStreak(4, '2026-10-08');

    expect(result).toEqual({ streak: 4, lastActiveDate: '2026-10-08' });
  });

  it('increments the streak when the last activity was yesterday', () => {
    const result = updateStreak(4, '2026-10-07');

    expect(result).toEqual({ streak: 5, lastActiveDate: '2026-10-08' });
  });

  it('resets the streak to 1 after a gap of more than one day', () => {
    const result = updateStreak(9, '2026-10-05');

    expect(result).toEqual({ streak: 1, lastActiveDate: '2026-10-08' });
  });

  it('treats a future lastActiveDate as a broken streak', () => {
    const result = updateStreak(3, '2026-10-09');

    expect(result).toEqual({ streak: 1, lastActiveDate: '2026-10-08' });
  });

  it('increments across a month boundary', () => {
    jest.setSystemTime(new Date('2026-11-01T12:00:00Z'));

    const result = updateStreak(2, '2026-10-31');

    expect(result).toEqual({ streak: 3, lastActiveDate: '2026-11-01' });
  });

  it('increments across a year boundary', () => {
    jest.setSystemTime(new Date('2027-01-01T12:00:00Z'));

    const result = updateStreak(10, '2026-12-31');

    expect(result).toEqual({ streak: 11, lastActiveDate: '2027-01-01' });
  });
});
