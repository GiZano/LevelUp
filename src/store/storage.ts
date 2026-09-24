import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Peak } from '../types';

const KEYS = {
  PEAKS: '@levelup/peaks',
  STREAK: '@levelup/streak',
  LAST_ACTIVE: '@levelup/last_active',
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

/** Salva streak e ultima data attiva */
export async function saveStreak(streak: number, lastActiveDate: string): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.STREAK, streak.toString()],
    [KEYS.LAST_ACTIVE, lastActiveDate],
  ]);
}

/** Carica streak e ultima data attiva */
export async function loadStreak(): Promise<{ streak: number; lastActiveDate?: string }> {
  const results = await AsyncStorage.multiGet([KEYS.STREAK, KEYS.LAST_ACTIVE]);
  const streakStr = results[0][1];
  const lastActive = results[1][1];

  return {
    streak: streakStr ? parseInt(streakStr, 10) : 0,
    lastActiveDate: lastActive ?? undefined,
  };
}
