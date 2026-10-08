import { BlockTemplate, Camp, Category, Peak, ScheduledBlock, WeeklyPlan } from '../../types';
import { computeWeeklyReview, resolveBlock, WeeklyReviewInput } from '../weeklyReview';

const CURRENT_WEEK = '2026-10-05';
const PAST_WEEK = '2026-09-28';
const FUTURE_WEEK = '2026-10-12';
const THURSDAY = new Date(2026, 9, 8, 12, 0, 0);
const UTC_THURSDAY = new Date('2026-10-08T12:00:00Z');

const category = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat1',
  name: 'Study',
  color: '#fff',
  emoji: '',
  targetHoursPerWeek: 0,
  ...overrides,
});

const template = (overrides: Partial<BlockTemplate> = {}): BlockTemplate => ({
  id: 'tpl1',
  name: 'Deep work',
  categoryId: 'cat1',
  durationHours: 2,
  ...overrides,
});

const block = (overrides: Partial<ScheduledBlock> = {}): ScheduledBlock => ({
  id: 'b1',
  templateId: 'tpl1',
  day: 'lun',
  startTime: '09:00',
  done: false,
  ...overrides,
});

const camp = (overrides: Partial<Camp> = {}): Camp => ({
  id: 'c1',
  name: 'Camp',
  done: false,
  order: 0,
  ...overrides,
});

const peak = (overrides: Partial<Peak> = {}): Peak => ({
  id: 'p1',
  name: 'Peak',
  camps: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const planOf = (blocks: ScheduledBlock[], weekId = CURRENT_WEEK): WeeklyPlan => ({
  weekId,
  blocks,
});

const input = (overrides: Partial<WeeklyReviewInput> = {}): WeeklyReviewInput => ({
  plan: planOf([]),
  categories: [category()],
  templates: [template()],
  peaks: [],
  streak: 0,
  today: THURSDAY,
  ...overrides,
});

describe('resolveBlock', () => {
  it('uses template name, category and duration for a template block', () => {
    const result = resolveBlock(block(), [template()]);

    expect(result).toEqual({
      block: block(),
      name: 'Deep work',
      categoryId: 'cat1',
      hours: 2,
    });
  });

  it('prefers customDuration over the template duration', () => {
    const result = resolveBlock(block({ customDuration: 0.5 }), [template()]);

    expect(result.hours).toBe(0.5);
  });

  it('uses one-off name, category and duration for a one-off block', () => {
    const oneOff = block({
      templateId: undefined,
      isOneOff: true,
      oneOffName: 'Dentist',
      oneOffCategoryId: 'cat2',
      oneOffDuration: 1.5,
    });

    const result = resolveBlock(oneOff, [template()]);

    expect(result).toEqual({ block: oneOff, name: 'Dentist', categoryId: 'cat2', hours: 1.5 });
  });

  it('falls back to empty name and zero hours for an incomplete one-off block', () => {
    const result = resolveBlock(block({ templateId: undefined, isOneOff: true }), []);

    expect(result.name).toBe('');
    expect(result.categoryId).toBeUndefined();
    expect(result.hours).toBe(0);
  });

  it('returns empty name, no category and zero hours when the template is missing', () => {
    const result = resolveBlock(block({ templateId: 'gone' }), [template()]);

    expect(result.name).toBe('');
    expect(result.categoryId).toBeUndefined();
    expect(result.hours).toBe(0);
  });

  it('keeps customDuration when the template is missing', () => {
    const result = resolveBlock(block({ templateId: 'gone', customDuration: 3 }), []);

    expect(result.hours).toBe(3);
  });
});

describe('computeWeeklyReview totals', () => {
  it('returns zeros and a 0 completion rate for an empty plan', () => {
    const review = computeWeeklyReview(input());

    expect(review.weekId).toBe(CURRENT_WEEK);
    expect(review.hoursCompleted).toBe(0);
    expect(review.hoursScheduled).toBe(0);
    expect(review.blocksCompleted).toBe(0);
    expect(review.blocksScheduled).toBe(0);
    expect(review.completionRate).toBe(0);
  });

  it('sums hours and block counts for scheduled and completed blocks', () => {
    const plan = planOf([
      block({ id: 'a', done: true }),
      block({ id: 'b', done: false, customDuration: 1 }),
      block({ id: 'c', done: true, customDuration: 0.5 }),
    ]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.blocksScheduled).toBe(3);
    expect(review.blocksCompleted).toBe(2);
    expect(review.hoursScheduled).toBe(3.5);
    expect(review.hoursCompleted).toBe(2.5);
  });

  it('rounds the completion rate to an integer percentage', () => {
    const plan = planOf([block({ id: 'a', done: true }), block({ id: 'b' }), block({ id: 'c' })]);

    expect(computeWeeklyReview(input({ plan })).completionRate).toBe(33);
  });

  it('reports 100 when every block is completed', () => {
    const plan = planOf([block({ id: 'a', done: true }), block({ id: 'b', done: true })]);

    expect(computeWeeklyReview(input({ plan })).completionRate).toBe(100);
  });

  it('includes one-off blocks in the totals', () => {
    const oneOff = block({
      id: 'o',
      templateId: undefined,
      isOneOff: true,
      oneOffName: 'Errand',
      oneOffCategoryId: 'cat1',
      oneOffDuration: 1,
      done: true,
    });

    const review = computeWeeklyReview(input({ plan: planOf([oneOff]) }));

    expect(review.blocksScheduled).toBe(1);
    expect(review.hoursCompleted).toBe(1);
  });

  it('reports the current streak when it was active yesterday', () => {
    const review = computeWeeklyReview(
      input({ streak: 7, lastActiveDate: '2026-10-07', today: UTC_THURSDAY })
    );

    expect(review.streak).toBe(7);
  });

  it('reports the current streak when it was active today', () => {
    const review = computeWeeklyReview(
      input({ streak: 7, lastActiveDate: '2026-10-08', today: UTC_THURSDAY })
    );

    expect(review.streak).toBe(7);
  });

  it('reports a streak of 0 when the last active day is before yesterday', () => {
    const review = computeWeeklyReview(
      input({ streak: 7, lastActiveDate: '2026-10-06', today: UTC_THURSDAY })
    );

    expect(review.streak).toBe(0);
  });

  it('reports a streak of 0 when lastActiveDate is missing', () => {
    expect(computeWeeklyReview(input({ streak: 7, today: UTC_THURSDAY })).streak).toBe(0);
  });

  it('does not mutate the input plan', () => {
    const plan = planOf([block({ id: 'b', startTime: '12:00' }), block({ id: 'a' })]);
    const snapshot = JSON.parse(JSON.stringify(plan));

    computeWeeklyReview(input({ plan }));

    expect(plan).toEqual(snapshot);
  });
});

describe('computeWeeklyReview categories', () => {
  it('aggregates scheduled and completed hours per category', () => {
    const plan = planOf([block({ id: 'a', done: true }), block({ id: 'b' })]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.categories).toHaveLength(1);
    expect(review.categories[0]).toMatchObject({ scheduled: 4, completed: 2 });
  });

  it('counts a one-off block in its own category', () => {
    const oneOff = block({
      id: 'o',
      templateId: undefined,
      isOneOff: true,
      oneOffCategoryId: 'cat2',
      oneOffDuration: 2,
      done: true,
    });
    const categories = [category(), category({ id: 'cat2', name: 'Sport' })];

    const review = computeWeeklyReview(input({ plan: planOf([oneOff]), categories }));

    expect(review.categories.map((c) => c.category.id)).toEqual(['cat2']);
    expect(review.categories[0]).toMatchObject({ scheduled: 2, completed: 2 });
  });

  it('excludes archived categories', () => {
    const categories = [category({ isArchived: true, targetHoursPerWeek: 5 })];

    const review = computeWeeklyReview(input({ categories, plan: planOf([block()]) }));

    expect(review.categories).toEqual([]);
  });

  it('excludes categories with nothing scheduled and no target', () => {
    const categories = [category(), category({ id: 'cat2', targetHoursPerWeek: 3 })];

    const review = computeWeeklyReview(input({ categories }));

    expect(review.categories.map((c) => c.category.id)).toEqual(['cat2']);
  });

  it('keeps the input order of categories', () => {
    const categories = [
      category({ id: 'z', targetHoursPerWeek: 1 }),
      category({ id: 'a', targetHoursPerWeek: 1 }),
    ];

    const review = computeWeeklyReview(input({ categories }));

    expect(review.categories.map((c) => c.category.id)).toEqual(['z', 'a']);
  });

  it('marks metTarget true when completed hours reach the target', () => {
    const categories = [category({ targetHoursPerWeek: 2 })];
    const plan = planOf([block({ done: true })]);

    const review = computeWeeklyReview(input({ categories, plan }));

    expect(review.categories[0]).toMatchObject({ target: 2, metTarget: true });
  });

  it('marks metTarget false when completed hours are below the target', () => {
    const categories = [category({ targetHoursPerWeek: 5 })];
    const plan = planOf([block({ done: true })]);

    const review = computeWeeklyReview(input({ categories, plan }));

    expect(review.categories[0].metTarget).toBe(false);
  });

  it('marks metTarget false when the target is 0', () => {
    const plan = planOf([block({ done: true })]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.categories[0]).toMatchObject({ target: 0, metTarget: false });
  });
});

describe('computeWeeklyReview skippedByDay', () => {
  it('returns nothing when every block is done', () => {
    const review = computeWeeklyReview(input({ plan: planOf([block({ done: true })]) }));

    expect(review.skippedByDay).toEqual([]);
  });

  it('groups skipped blocks by day in Monday-first order', () => {
    const plan = planOf([
      block({ id: 'w', day: 'mer' }),
      block({ id: 'm', day: 'lun' }),
      block({ id: 't', day: 'mar' }),
    ]);

    const review = computeWeeklyReview(input({ plan, today: new Date(2026, 9, 11) }));

    expect(review.skippedByDay.map((d) => d.day)).toEqual(['lun', 'mar', 'mer']);
  });

  it('lists only days that have skipped blocks', () => {
    const plan = planOf([
      block({ id: 'a', day: 'lun', done: true }),
      block({ id: 'b', day: 'mar' }),
    ]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay.map((d) => d.day)).toEqual(['mar']);
  });

  it('sorts blocks within a day by start time ascending', () => {
    const plan = planOf([
      block({ id: 'late', startTime: '18:00' }),
      block({ id: 'early', startTime: '07:30' }),
      block({ id: 'mid', startTime: '12:00' }),
    ]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay[0].blocks.map((b) => b.block.id)).toEqual(['early', 'mid', 'late']);
  });

  it('returns resolved blocks with name and hours', () => {
    const review = computeWeeklyReview(input({ plan: planOf([block()]) }));

    expect(review.skippedByDay[0].blocks[0]).toMatchObject({
      name: 'Deep work',
      categoryId: 'cat1',
      hours: 2,
    });
  });

  it('includes earlier days but excludes later days in the current week', () => {
    const plan = planOf([
      block({ id: 'wed', day: 'mer' }),
      block({ id: 'fri', day: 'ven' }),
      block({ id: 'sun', day: 'dom' }),
    ]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay.map((d) => d.day)).toEqual(['mer']);
  });

  it('includes a block today that has already ended', () => {
    const plan = planOf([block({ id: 'thu', day: 'gio', startTime: '09:00' })]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay.map((d) => d.day)).toEqual(['gio']);
  });

  it('excludes a block today that ends later today', () => {
    const plan = planOf([block({ id: 'thu', day: 'gio', startTime: '11:00' })]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay).toEqual([]);
  });

  it('includes a block today that ends exactly now', () => {
    const plan = planOf([block({ id: 'thu', day: 'gio', startTime: '10:00' })]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay.map((d) => d.day)).toEqual(['gio']);
  });

  it('uses fractional durations to decide whether a block today has ended', () => {
    const plan = planOf([
      block({ id: 'over', day: 'gio', startTime: '11:00', customDuration: 0.5 }),
      block({ id: 'running', day: 'gio', startTime: '11:45', customDuration: 0.5 }),
    ]);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay[0].blocks.map((b) => b.block.id)).toEqual(['over']);
  });

  it('includes every day for a past week', () => {
    const plan = planOf(
      [block({ id: 'a', day: 'lun' }), block({ id: 'b', day: 'dom' })],
      PAST_WEEK
    );

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay.map((d) => d.day)).toEqual(['lun', 'dom']);
  });

  it('includes no days for a future week', () => {
    const plan = planOf([block({ id: 'a', day: 'lun' })], FUTURE_WEEK);

    const review = computeWeeklyReview(input({ plan }));

    expect(review.skippedByDay).toEqual([]);
  });
});

describe('computeWeeklyReview camps and peaks', () => {
  const inWeek = new Date(2026, 9, 7, 10).toISOString();
  const beforeWeek = new Date(2026, 9, 4, 23, 59).toISOString();
  const afterWeek = new Date(2026, 9, 12, 0, 1).toISOString();

  it('lists done camps completed inside the reviewed week', () => {
    const inside = camp({ id: 'in', done: true, completedAt: inWeek });
    const before = camp({ id: 'before', done: true, completedAt: beforeWeek });
    const after = camp({ id: 'after', done: true, completedAt: afterWeek });
    const p = peak({ camps: [inside, before, after] });

    const review = computeWeeklyReview(input({ peaks: [p] }));

    expect(review.campsCompleted).toEqual([{ peak: p, camp: inside }]);
  });

  it('ignores camps that are not done even with a completedAt in the week', () => {
    const p = peak({ camps: [camp({ done: false, completedAt: inWeek })] });

    expect(computeWeeklyReview(input({ peaks: [p] })).campsCompleted).toEqual([]);
  });

  it('ignores done camps without a completedAt', () => {
    const p = peak({ camps: [camp({ done: true })] });

    expect(computeWeeklyReview(input({ peaks: [p] })).campsCompleted).toEqual([]);
  });

  it('lists peaks reached inside the reviewed week only', () => {
    const reached = peak({ id: 'reached', completedAt: inWeek });
    const old = peak({ id: 'old', completedAt: beforeWeek });
    const open = peak({ id: 'open' });

    const review = computeWeeklyReview(input({ peaks: [reached, old, open] }));

    expect(review.peaksReached).toEqual([reached]);
  });
});

describe('computeWeeklyReview streakStatus', () => {
  const review = (overrides: Partial<WeeklyReviewInput>) =>
    computeWeeklyReview(input({ today: UTC_THURSDAY, ...overrides }));
  const LATE_UTC = new Date('2026-10-08T23:30:00Z');

  it('is survived in the current week when the streak was active yesterday and reaches Monday', () => {
    expect(review({ streak: 3, lastActiveDate: '2026-10-07' }).streakStatus).toBe('survived');
  });

  it('is survived in the current week when the streak was active today', () => {
    expect(review({ streak: 10, lastActiveDate: '2026-10-08' }).streakStatus).toBe('survived');
  });

  it('is started in the current week when the streak began after Monday', () => {
    expect(review({ streak: 2, lastActiveDate: '2026-10-07' }).streakStatus).toBe('started');
  });

  it('is started in the current week when the streak began today', () => {
    expect(review({ streak: 1, lastActiveDate: '2026-10-08' }).streakStatus).toBe('started');
  });

  it('is broken in the current week when the last active day is before yesterday', () => {
    expect(review({ streak: 10, lastActiveDate: '2026-10-06' }).streakStatus).toBe('broken');
  });

  it('is broken when the streak is 0', () => {
    expect(review({ streak: 0, lastActiveDate: '2026-10-07' }).streakStatus).toBe('broken');
  });

  it('is broken when lastActiveDate is missing', () => {
    expect(review({ streak: 5 }).streakStatus).toBe('broken');
  });

  it('is survived for a past week when the streak covers all seven days up to Sunday', () => {
    const plan = planOf([], PAST_WEEK);

    expect(review({ plan, streak: 7, lastActiveDate: '2026-10-04' }).streakStatus).toBe('survived');
  });

  it('is survived for a past week when the streak continued after the week ended', () => {
    const plan = planOf([], PAST_WEEK);

    expect(review({ plan, streak: 11, lastActiveDate: '2026-10-08' }).streakStatus).toBe(
      'survived'
    );
  });

  it('is broken for a past week when the streak ended before Sunday', () => {
    const plan = planOf([], PAST_WEEK);

    expect(review({ plan, streak: 7, lastActiveDate: '2026-10-03' }).streakStatus).toBe('broken');
  });

  it('is broken for a past week when the streak began mid-week', () => {
    const plan = planOf([], PAST_WEEK);

    expect(review({ plan, streak: 3, lastActiveDate: '2026-10-04' }).streakStatus).toBe('broken');
  });

  it('is broken for a past week when the streak is 0', () => {
    const plan = planOf([], PAST_WEEK);

    expect(review({ plan, streak: 0, lastActiveDate: '2026-10-04' }).streakStatus).toBe('broken');
  });

  it('is upcoming for a future week', () => {
    const plan = planOf([], FUTURE_WEEK);

    expect(review({ plan, streak: 30, lastActiveDate: '2026-10-08' }).streakStatus).toBe(
      'upcoming'
    );
  });

  it('treats a UTC date written late in the UTC day as active in any time zone', () => {
    const result = review({ today: LATE_UTC, streak: 4, lastActiveDate: '2026-10-08' });

    expect(result.streak).toBe(4);
    expect(result.streakStatus).toBe('survived');
  });

  it('treats the previous UTC date as still alive late in the UTC day', () => {
    const result = review({ today: LATE_UTC, streak: 4, lastActiveDate: '2026-10-07' });

    expect(result.streak).toBe(4);
  });

  it('treats the UTC date two days back as broken late in the UTC day', () => {
    const result = review({ today: LATE_UTC, streak: 4, lastActiveDate: '2026-10-06' });

    expect(result.streak).toBe(0);
    expect(result.streakStatus).toBe('broken');
  });

  it('computes yesterday across a month boundary', () => {
    const plan = planOf([], '2026-11-30');
    const today = new Date('2026-12-01T00:30:00Z');

    const result = review({ plan, today, streak: 2, lastActiveDate: '2026-11-30' });

    expect(result.streakStatus).toBe('survived');
  });
});
