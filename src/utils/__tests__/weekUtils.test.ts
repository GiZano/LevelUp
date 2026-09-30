import { getWeekId, getNextWeekId, getPrevWeekId, getMonday } from '../../types/weekUtils';

describe('weekUtils', () => {
  it('should generate a valid week ID based on the Monday date', () => {
    // 2026-09-30 is a Wednesday. The Monday of this week is 2026-09-28.
    const id = getWeekId(new Date('2026-09-30T10:00:00Z'));
    expect(id).toBe('2026-09-28');
  });

  it('should navigate to the next week correctly', () => {
    const next = getNextWeekId('2026-09-28');
    expect(next).toBe('2026-10-05');
  });

  it('should navigate to the previous week correctly', () => {
    const prev = getPrevWeekId('2026-09-28');
    expect(prev).toBe('2026-09-21');
  });

  it('should handle month/year rollover correctly', () => {
    // Monday is 2026-12-28
    const next = getNextWeekId('2026-12-28');
    // Next Monday is 2027-01-04
    expect(next).toBe('2027-01-04');
  });
});
