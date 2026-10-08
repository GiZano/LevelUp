import {
  getCurrentWeekId,
  getDatesOfWeek,
  getMonday,
  getNextWeekId,
  getPrevWeekId,
  getTodayDayOfWeek,
  getWeekId,
} from '../../types/weekUtils';

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

describe('weekUtils relative to the current date', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ['2026-10-04T12:00:00', 'dom'],
    ['2026-10-05T12:00:00', 'lun'],
    ['2026-10-06T12:00:00', 'mar'],
    ['2026-10-07T12:00:00', 'mer'],
    ['2026-10-08T12:00:00', 'gio'],
    ['2026-10-09T12:00:00', 'ven'],
    ['2026-10-10T12:00:00', 'sab'],
  ])('getTodayDayOfWeek returns the right day for %s', (now, expected) => {
    jest.useFakeTimers().setSystemTime(new Date(now));

    expect(getTodayDayOfWeek()).toBe(expected);
  });

  it('getCurrentWeekId returns the Monday of the faked current week', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-08T12:00:00'));

    expect(getCurrentWeekId()).toBe('2026-10-05');
  });

  it('getCurrentWeekId on a Sunday belongs to the week starting the previous Monday', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-11T12:00:00'));

    expect(getCurrentWeekId()).toBe('2026-10-05');
  });
});

describe('getMonday', () => {
  it('returns the same day at midnight when given a Monday', () => {
    const monday = getMonday(new Date(2026, 9, 5, 15, 30));

    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(9);
    expect(monday.getDate()).toBe(5);
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
  });

  it('returns the previous Monday when given a Sunday', () => {
    const monday = getMonday(new Date(2026, 9, 11, 9, 0));

    expect(monday.getMonth()).toBe(9);
    expect(monday.getDate()).toBe(5);
  });

  it('does not mutate the input date', () => {
    const input = new Date(2026, 9, 8, 9, 0);

    getMonday(input);

    expect(input.getDate()).toBe(8);
    expect(input.getHours()).toBe(9);
  });
});

describe('getDatesOfWeek', () => {
  it('returns 7 consecutive dates starting on the given Monday', () => {
    const dates = getDatesOfWeek('2026-10-05');

    expect(dates).toHaveLength(7);
    expect(dates.map((d) => d.getDate())).toEqual([5, 6, 7, 8, 9, 10, 11]);
    expect(dates[0].getDay()).toBe(1);
    expect(dates[6].getDay()).toBe(0);
  });

  it('rolls over to the next month', () => {
    const dates = getDatesOfWeek('2026-09-28');

    expect(dates.map((d) => [d.getMonth() + 1, d.getDate()])).toEqual([
      [9, 28],
      [9, 29],
      [9, 30],
      [10, 1],
      [10, 2],
      [10, 3],
      [10, 4],
    ]);
  });

  it('rolls over to the next year', () => {
    const dates = getDatesOfWeek('2026-12-28');

    expect(dates[4].getFullYear()).toBe(2027);
    expect(dates[4].getMonth()).toBe(0);
    expect(dates[4].getDate()).toBe(1);
    expect(dates[6].getDate()).toBe(3);
  });

  it('returns seven consecutive calendar days for the week starting 2026-10-19', () => {
    const dates = getDatesOfWeek('2026-10-19');

    expect(dates.map((d) => d.getDate())).toEqual([19, 20, 21, 22, 23, 24, 25]);
  });

  it('returns seven consecutive calendar days for the week starting 2026-03-23', () => {
    const dates = getDatesOfWeek('2026-03-23');

    expect(dates.map((d) => d.getDate())).toEqual([23, 24, 25, 26, 27, 28, 29]);
  });
});

describe('week navigation boundaries', () => {
  it('moves forward from the week starting 2026-10-19', () => {
    expect(getNextWeekId('2026-10-19')).toBe('2026-10-26');
  });

  it('moves backward from the week starting 2026-10-26', () => {
    expect(getPrevWeekId('2026-10-26')).toBe('2026-10-19');
  });

  it('moves forward and backward around the week starting 2026-03-30', () => {
    expect(getNextWeekId('2026-03-23')).toBe('2026-03-30');
    expect(getPrevWeekId('2026-03-30')).toBe('2026-03-23');
  });

  it('moves backward across a year boundary', () => {
    expect(getPrevWeekId('2027-01-04')).toBe('2026-12-28');
  });

  it('moves backward across a month boundary', () => {
    expect(getPrevWeekId('2026-10-05')).toBe('2026-09-28');
  });

  it('next then prev returns the original week id', () => {
    expect(getPrevWeekId(getNextWeekId('2026-12-28'))).toBe('2026-12-28');
  });

  it('zero-pads single-digit months and days in week ids', () => {
    expect(getPrevWeekId('2026-02-09')).toBe('2026-02-02');
    expect(getNextWeekId('2026-01-26')).toBe('2026-02-02');
  });
});
