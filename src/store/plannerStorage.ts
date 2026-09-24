import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, BlockTemplate, WeeklyPlan } from '../types';

const KEYS = {
  CATEGORIES: '@levelup/categories',
  TEMPLATES: '@levelup/templates',
  WEEKLY_PLAN_PREFIX: '@levelup/week/',
} as const;

// ── Categories ──

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}

export async function loadCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
  if (!raw) return [];
  return JSON.parse(raw) as Category[];
}

// ── Block Templates ──

export async function saveTemplates(templates: BlockTemplate[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
}

export async function loadTemplates(): Promise<BlockTemplate[]> {
  const raw = await AsyncStorage.getItem(KEYS.TEMPLATES);
  if (!raw) return [];
  return JSON.parse(raw) as BlockTemplate[];
}

// ── Weekly Plans ──

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
  const key = KEYS.WEEKLY_PLAN_PREFIX + plan.weekId;
  await AsyncStorage.setItem(key, JSON.stringify(plan));
}

export async function loadWeeklyPlan(weekId: string): Promise<WeeklyPlan | null> {
  const key = KEYS.WEEKLY_PLAN_PREFIX + weekId;
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as WeeklyPlan;
}
