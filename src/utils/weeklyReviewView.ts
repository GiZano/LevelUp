import type { CategoryReview, WeekPhase } from './weeklyReview';

export type TargetStatus = 'met' | 'missed' | 'inProgress' | 'none';

export interface CategoryBar {
  amount: number;
  goal: number;
  fraction: number;
}

export function getTargetStatus(item: CategoryReview, phase: WeekPhase): TargetStatus {
  if (item.target <= 0 || phase === 'upcoming') return 'none';
  if (item.metTarget) return 'met';
  return phase === 'current' ? 'inProgress' : 'missed';
}

export function getCategoryBar(item: CategoryReview, phase: WeekPhase): CategoryBar {
  const amount = phase === 'upcoming' ? item.scheduled : item.completed;
  const goal = item.target > 0 ? item.target : item.scheduled;
  const fraction = goal > 0 ? Math.min(amount / goal, 1) : 0;
  return { amount, goal, fraction };
}

export const formatHours = (value: number, locale: string): string =>
  value.toLocaleString(locale, { maximumFractionDigits: 1 });
