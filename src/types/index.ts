/**
 * LevelUp — Core type definitions
 *
 * Modello dati basato sulla metafora alpinistica:
 * - Peak (Vetta): obiettivo a lungo termine
 * - Camp (Campo): sotto-obiettivo / milestone lungo il percorso
 */

export interface Camp {
  id: string;
  name: string;
  done: boolean;
  completedAt?: string; // ISO 8601
  order: number;
}

export interface Peak {
  id: string;
  name: string;
  description?: string;
  camps: Camp[];
  createdAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
}

export interface WeeklyBlock {
  id: string;
  name: string;
  category: string;
  color: string;
  estimatedHours: number;
  peakId?: string; // collegamento opzionale a una vetta
}

export interface UserStats {
  totalAltitude: number; // 100m per campo completato + 1m per ora completata
  peaksReached: number;
  currentStreak: number;
  lastActiveDate?: string; // ISO 8601 (solo data, YYYY-MM-DD)
  totalCompletedHours: number; // Incrementato quando un blocco viene completato
}

// ── Weekly Planner types ──

export type DayOfWeek = 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';

export const DAYS_OF_WEEK: DayOfWeek[] = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  lun: 'Lunedì',
  mar: 'Martedì',
  mer: 'Mercoledì',
  gio: 'Giovedì',
  ven: 'Venerdì',
  sab: 'Sabato',
  dom: 'Domenica',
};

export interface Category {
  id: string;
  name: string;
  color: string;
  emoji: string;
  targetHoursPerWeek: number;
}

export interface BlockTemplate {
  id: string;
  name: string;
  categoryId: string;
  durationHours: number;
  peakId?: string; // collegamento opzionale a una vetta
}

export interface ScheduledBlock {
  id: string;
  templateId?: string; // opzionale se è one-off
  day: DayOfWeek;
  startTime: string; // formato "HH:mm", es. "09:30" o "22:00"
  done: boolean;
  calendarEventId?: string; // ID dell'evento su Google Calendar per poterlo cancellare
  // Campi per blocchi one-off temporanei
  isOneOff?: boolean;
  oneOffName?: string;
  oneOffCategoryId?: string;
  oneOffDuration?: number;
}

/** Settimana identificata da ISO week string, es. "2026-W39" */
export interface WeeklyPlan {
  weekId: string;
  blocks: ScheduledBlock[];
}
