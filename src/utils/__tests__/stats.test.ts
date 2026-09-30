import { peakProgress, computeStats, isPeakComplete, updateStreak } from '../stats';

describe('stats utilities', () => {
  it('should calculate peak progress correctly', () => {
    const mockPeak: any = {
      id: 'p1',
      name: 'Test Peak',
      createdAt: '2026-01-01',
      camps: [
        { id: 'c1', name: 'Camp 1', done: true },
        { id: 'c2', name: 'Camp 2', done: false },
      ]
    };
    
    // progress should be 1 / 2 = 0.5
    expect(peakProgress(mockPeak)).toBe(0.5);
  });

  it('should return 0 when there are no camps', () => {
    const mockPeak: any = {
      id: 'p2',
      name: 'Empty Peak',
      createdAt: '2026-01-01',
      camps: []
    };
    
    expect(peakProgress(mockPeak)).toBe(0);
  });

  it('should correctly identify a completed peak', () => {
    const mockPeak: any = {
      camps: [
        { done: true },
        { done: true },
      ]
    };
    expect(isPeakComplete(mockPeak)).toBe(true);
  });

  it('should not identify an incomplete peak as completed', () => {
    const mockPeak: any = {
      camps: [
        { done: true },
        { done: false },
      ]
    };
    expect(isPeakComplete(mockPeak)).toBe(false);
  });

  it('should compute overall stats correctly', () => {
    const peaks: any[] = [
      { camps: [{ done: true }, { done: true }] }, // completed
      { camps: [{ done: true }, { done: false }] } // incomplete, 1 camp done
    ];

    const stats = computeStats(peaks, 5, '2026-01-01', 10);
    // 3 completed camps * 100 + 10 hours = 310 totalAltitude
    // 1 peak reached
    expect(stats.totalAltitude).toBe(310);
    expect(stats.peaksReached).toBe(1);
    expect(stats.currentStreak).toBe(5);
  });
});
