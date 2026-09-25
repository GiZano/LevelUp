import type { Peak, UserStats } from '../types';

/** Calcola le statistiche aggregate da un array di vette */
export function computeStats(peaks: Peak[], currentStreak: number, lastActiveDate?: string, totalCompletedHours: number = 0): UserStats {
  let totalCampsCompleted = 0;
  let peaksReached = 0;

  for (const peak of peaks) {
    const completedCamps = peak.camps.filter((c) => c.done).length;
    totalCampsCompleted += completedCamps;

    if (isPeakComplete(peak)) {
      peaksReached++;
    }
  }

  return {
    totalAltitude: (totalCampsCompleted * 100) + totalCompletedHours, // 100m per camp + 1m per hour
    peaksReached,
    currentStreak,
    lastActiveDate,
    totalCompletedHours,
  };
}

/** Calcola il progresso di una vetta (0-1) */
export function peakProgress(peak: Peak): number {
  if (peak.camps.length === 0) return 0;
  const done = peak.camps.filter((c) => c.done).length;
  return done / peak.camps.length;
}

/** Controlla se una vetta è completata (tutti i campi fatti) */
export function isPeakComplete(peak: Peak): boolean {
  return peak.camps.length > 0 && peak.camps.every((c) => c.done);
}

/** Aggiorna lo streak basandosi sulla data odierna */
export function updateStreak(
  currentStreak: number,
  lastActiveDate: string | undefined
): { streak: number; lastActiveDate: string } {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (!lastActiveDate) {
    return { streak: 1, lastActiveDate: today };
  }

  if (lastActiveDate === today) {
    // Already active today, no change
    return { streak: currentStreak, lastActiveDate: today };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActiveDate === yesterdayStr) {
    // Consecutive day
    return { streak: currentStreak + 1, lastActiveDate: today };
  }

  // Streak broken
  return { streak: 1, lastActiveDate: today };
}
