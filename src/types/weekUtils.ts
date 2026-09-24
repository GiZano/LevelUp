import type { DayOfWeek } from './index';

/**
 * Ritorna l'ID della settimana ISO corrente, es. "2026-W39"
 */
export function getCurrentWeekId(): string {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / 86400000) + 1;
  // Calcolo settimana ISO semplificato
  const weekNum = Math.ceil((dayOfYear + yearStart.getDay()) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Ritorna il giorno della settimana corrente come DayOfWeek
 */
export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  return days[new Date().getDay()];
}
