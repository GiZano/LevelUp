import {
  BlockTemplate,
  Camp,
  Category,
  DAYS_OF_WEEK,
  DayOfWeek,
  Peak,
  ScheduledBlock,
  WeeklyPlan,
} from '../types';
import { getDatesOfWeek, getWeekId } from '../types/weekUtils';

export interface ResolvedBlock {
  block: ScheduledBlock;
  name: string;
  categoryId?: string;
  hours: number;
}

export interface CategoryReview {
  category: Category;
  scheduled: number;
  completed: number;
  target: number;
  metTarget: boolean;
}

export type StreakStatus = 'survived' | 'started' | 'broken' | 'upcoming';

export interface WeeklyReview {
  weekId: string;
  hoursCompleted: number;
  hoursScheduled: number;
  blocksCompleted: number;
  blocksScheduled: number;
  completionRate: number;
  categories: CategoryReview[];
  skippedByDay: { day: DayOfWeek; blocks: ResolvedBlock[] }[];
  streak: number;
  streakStatus: StreakStatus;
  campsCompleted: { peak: Peak; camp: Camp }[];
  peaksReached: Peak[];
}

export interface WeeklyReviewInput {
  plan: WeeklyPlan;
  categories: Category[];
  templates: BlockTemplate[];
  peaks: Peak[];
  streak: number;
  lastActiveDate?: string;
  today: Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const pad = (n: number): string => String(n).padStart(2, '0');

const toLocalDateString = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const dayNumber = (dateString: string): number => {
  const [y, m, d] = dateString.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / MS_PER_DAY;
};

const toUtcDateString = (d: Date): string => d.toISOString().slice(0, 10);

const fromDayNumber = (n: number): string => toUtcDateString(new Date(n * MS_PER_DAY));

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const sumHours = (blocks: ResolvedBlock[]): number => blocks.reduce((sum, b) => sum + b.hours, 0);

export function resolveBlock(block: ScheduledBlock, templates: BlockTemplate[]): ResolvedBlock {
  if (block.isOneOff) {
    return {
      block,
      name: block.oneOffName ?? '',
      categoryId: block.oneOffCategoryId,
      hours: block.oneOffDuration ?? 0,
    };
  }
  const template = templates.find((t) => t.id === block.templateId);
  return {
    block,
    name: template?.name ?? '',
    categoryId: template?.categoryId,
    hours: block.customDuration ?? template?.durationHours ?? 0,
  };
}

function reviewCategories(categories: Category[], resolved: ResolvedBlock[]): CategoryReview[] {
  return categories
    .filter((c) => !c.isArchived)
    .map((c) => {
      const own = resolved.filter((r) => r.categoryId === c.id);
      const scheduled = sumHours(own);
      const completed = sumHours(own.filter((r) => r.block.done));
      const target = c.targetHoursPerWeek;
      return {
        category: c,
        scheduled,
        completed,
        target,
        metTarget: target > 0 && completed >= target,
      };
    })
    .filter((r) => r.scheduled > 0 || r.target > 0);
}

function hasEnded(item: ResolvedBlock, nowMinutes: number): boolean {
  return toMinutes(item.block.startTime) + Math.round(item.hours * 60) <= nowMinutes;
}

function groupSkippedByDay(
  resolved: ResolvedBlock[],
  weekId: string,
  today: Date
): WeeklyReview['skippedByDay'] {
  const todayString = toLocalDateString(today);
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  const dates = getDatesOfWeek(weekId).map(toLocalDateString);
  const isSkipped = (item: ResolvedBlock, date: string): boolean =>
    !item.block.done &&
    (date < todayString || (date === todayString && hasEnded(item, nowMinutes)));

  return DAYS_OF_WEEK.map((day, index) => ({
    day,
    blocks: resolved
      .filter((r) => r.block.day === day && isSkipped(r, dates[index]))
      .sort((a, b) => a.block.startTime.localeCompare(b.block.startTime)),
  })).filter((entry) => entry.blocks.length > 0);
}

function getStreakStatus(input: WeeklyReviewInput, isAlive: boolean): StreakStatus {
  const { plan, streak, lastActiveDate, today } = input;
  const dates = getDatesOfWeek(plan.weekId).map(toLocalDateString);
  const [monday, sunday] = [dates[0], dates[6]];
  const todayString = toLocalDateString(today);
  if (monday > todayString) return 'upcoming';
  if (!lastActiveDate || streak <= 0) return 'broken';

  const reachesMonday = dayNumber(lastActiveDate) - dayNumber(monday) + 1 <= streak;
  if (sunday < todayString)
    return lastActiveDate >= sunday && reachesMonday ? 'survived' : 'broken';
  if (!isAlive) return 'broken';
  return reachesMonday ? 'survived' : 'started';
}

function isStreakAlive({ streak, lastActiveDate, today }: WeeklyReviewInput): boolean {
  if (!lastActiveDate || streak <= 0) return false;
  const yesterday = fromDayNumber(dayNumber(toUtcDateString(today)) - 1);
  return lastActiveDate >= yesterday;
}

function findCompletedCamps(peaks: Peak[], weekId: string): WeeklyReview['campsCompleted'] {
  return peaks.flatMap((peak) =>
    peak.camps
      .filter((camp) => camp.done && isInWeek(camp.completedAt, weekId))
      .map((camp) => ({ peak, camp }))
  );
}

function isInWeek(isoDate: string | undefined, weekId: string): boolean {
  return !!isoDate && getWeekId(new Date(isoDate)) === weekId;
}

export function computeWeeklyReview(input: WeeklyReviewInput): WeeklyReview {
  const { plan, categories, templates, peaks, streak, today } = input;
  const isAlive = isStreakAlive(input);
  const resolved = plan.blocks.map((b) => resolveBlock(b, templates));
  const completedBlocks = resolved.filter((r) => r.block.done);

  return {
    weekId: plan.weekId,
    hoursCompleted: sumHours(completedBlocks),
    hoursScheduled: sumHours(resolved),
    blocksCompleted: completedBlocks.length,
    blocksScheduled: resolved.length,
    completionRate:
      resolved.length === 0 ? 0 : Math.round((completedBlocks.length / resolved.length) * 100),
    categories: reviewCategories(categories, resolved),
    skippedByDay: groupSkippedByDay(resolved, plan.weekId, today),
    streak: isAlive ? streak : 0,
    streakStatus: getStreakStatus(input, isAlive),
    campsCompleted: findCompletedCamps(peaks, plan.weekId),
    peaksReached: peaks.filter((p) => isInWeek(p.completedAt, plan.weekId)),
  };
}
