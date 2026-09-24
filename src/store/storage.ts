import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Peak } from '../types';

const KEYS = {
  PEAKS: '@levelup/peaks',
  STREAK: '@levelup/streak',
  LAST_ACTIVE: '@levelup/last_active',
  COMPLETED_HOURS: '@levelup/completed_hours',
} as const;

/** Salva tutte le vette */
export async function savePeaks(peaks: Peak[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PEAKS, JSON.stringify(peaks));
}

/** Carica tutte le vette */
export async function loadPeaks(): Promise<Peak[]> {
  const raw = await AsyncStorage.getItem(KEYS.PEAKS);
  if (!raw) return [];
  return JSON.parse(raw) as Peak[];
}

/** Salva streak e ultima data attiva e ore */
export async function saveStreak(streak: number, lastActiveDate: string, totalCompletedHours: number = 0): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.STREAK, streak.toString()],
    [KEYS.LAST_ACTIVE, lastActiveDate],
    [KEYS.COMPLETED_HOURS, totalCompletedHours.toString()],
  ]);
}

/** Carica streak, ultima data attiva e ore */
export async function loadStreak(): Promise<{ streak: number; lastActiveDate?: string; totalCompletedHours: number }> {
  const results = await AsyncStorage.multiGet([KEYS.STREAK, KEYS.LAST_ACTIVE, KEYS.COMPLETED_HOURS]);
  const streakStr = results[0][1];
  const lastActive = results[1][1];
  const hoursStr = results[2][1];

  return {
    streak: streakStr ? parseInt(streakStr, 10) : 0,
    lastActiveDate: lastActive ?? undefined,
    totalCompletedHours: hoursStr ? parseFloat(hoursStr) : 0,
  };
}
