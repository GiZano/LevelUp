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
  totalAltitude: number; // 100m per campo completato
  peaksReached: number;
  currentStreak: number;
  lastActiveDate?: string; // ISO 8601 (solo data, YYYY-MM-DD)
}
