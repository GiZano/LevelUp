import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Peak, Camp } from '../types';
import { generateId } from '../utils/id';
import { savePeaks, loadPeaks, saveStreak, loadStreak } from './storage';
import { isPeakComplete, updateStreak } from '../utils/stats';

interface PeaksState {
  peaks: Peak[];
  streak: number;
  lastActiveDate?: string;
  totalCompletedHours: number;
  isLoading: boolean;
}

interface PeaksActions {
  addPeak: (name: string, description?: string) => void;
  deletePeak: (peakId: string) => void;
  addCamp: (peakId: string, name: string) => void;
  toggleCamp: (peakId: string, campId: string) => void;
  deleteCamp: (peakId: string, campId: string) => void;
  reorderCamps: (peakId: string, camps: Camp[]) => void;
  addCompletedHours: (hours: number) => void;
}

type PeaksContextType = PeaksState & PeaksActions;

const PeaksContext = createContext<PeaksContextType | null>(null);

export function PeaksProvider({ children }: { children: React.ReactNode }) {
  const [peaks, setPeaks] = useState<Peak[]>([]);
  const [streak, setStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | undefined>();
  const [totalCompletedHours, setTotalCompletedHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on startup
  useEffect(() => {
    (async () => {
      try {
        const [loadedPeaks, streakData] = await Promise.all([loadPeaks(), loadStreak()]);
        setPeaks(loadedPeaks);
        setStreak(streakData.streak);
        setLastActiveDate(streakData.lastActiveDate);
        setTotalCompletedHours(streakData.totalCompletedHours);
      } catch (e) {
        console.error('Errore caricamento dati:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Save peaks whenever they change
  useEffect(() => {
    if (!isLoading) {
      savePeaks(peaks).catch((e) => console.error('Errore salvataggio peaks:', e));
    }
  }, [peaks, isLoading]);

  // Save streak and hours whenever they change
  useEffect(() => {
    if (!isLoading && lastActiveDate) {
      saveStreak(streak, lastActiveDate, totalCompletedHours).catch((e) =>
        console.error('Errore salvataggio streak:', e)
      );
    }
  }, [streak, lastActiveDate, totalCompletedHours, isLoading]);

  const recordActivity = useCallback(() => {
    const updated = updateStreak(streak, lastActiveDate);
    setStreak(updated.streak);
    setLastActiveDate(updated.lastActiveDate);
  }, [streak, lastActiveDate]);

  const addCompletedHours = useCallback((hours: number) => {
    setTotalCompletedHours((prev) => prev + hours);
    recordActivity();
  }, [recordActivity]);

  const addPeak = useCallback(
    (name: string, description?: string) => {
      const newPeak: Peak = {
        id: generateId(),
        name,
        description,
        camps: [],
        createdAt: new Date().toISOString(),
      };
      setPeaks((prev) => [...prev, newPeak]);
      recordActivity();
    },
    [recordActivity]
  );

  const deletePeak = useCallback((peakId: string) => {
    setPeaks((prev) => prev.filter((p) => p.id !== peakId));
  }, []);

  const addCamp = useCallback(
    (peakId: string, name: string) => {
      setPeaks((prev) =>
        prev.map((peak) => {
          if (peak.id !== peakId) return peak;
          const newCamp: Camp = {
            id: generateId(),
            name,
            done: false,
            order: peak.camps.length,
          };
          return { ...peak, camps: [...peak.camps, newCamp], completedAt: undefined };
        })
      );
      recordActivity();
    },
    [recordActivity]
  );

  const toggleCamp = useCallback(
    (peakId: string, campId: string) => {
      setPeaks((prev) =>
        prev.map((peak) => {
          if (peak.id !== peakId) return peak;

          const updatedCamps = peak.camps.map((camp) => {
            if (camp.id !== campId) return camp;
            return {
              ...camp,
              done: !camp.done,
              completedAt: !camp.done ? new Date().toISOString() : undefined,
            };
          });

          const updatedPeak = { ...peak, camps: updatedCamps };

          // Check if peak was completed
          if (isPeakComplete(updatedPeak) && !peak.completedAt) {
            updatedPeak.completedAt = new Date().toISOString();
          } else if (!isPeakComplete(updatedPeak) && peak.completedAt) {
            updatedPeak.completedAt = undefined;
          }

          return updatedPeak;
        })
      );
      recordActivity();
    },
    [recordActivity]
  );

  const deleteCamp = useCallback((peakId: string, campId: string) => {
    setPeaks((prev) =>
      prev.map((peak) => {
        if (peak.id !== peakId) return peak;
        const filtered = peak.camps.filter((c) => c.id !== campId);
        const reordered = filtered.map((c, i) => ({ ...c, order: i }));

        const updatedPeak = { ...peak, camps: reordered };
        // Recalculate peak completion
        if (isPeakComplete(updatedPeak) && !peak.completedAt) {
          updatedPeak.completedAt = new Date().toISOString();
        } else if (!isPeakComplete(updatedPeak)) {
          updatedPeak.completedAt = undefined;
        }
        return updatedPeak;
      })
    );
  }, []);

  const reorderCamps = useCallback((peakId: string, camps: Camp[]) => {
    setPeaks((prev) =>
      prev.map((peak) => {
        if (peak.id !== peakId) return peak;
        return { ...peak, camps: camps.map((c, i) => ({ ...c, order: i })) };
      })
    );
  }, []);

  return (
    <PeaksContext.Provider
      value={{
        peaks,
        streak,
        lastActiveDate,
        totalCompletedHours,
        isLoading,
        addPeak,
        deletePeak,
        addCamp,
        toggleCamp,
        deleteCamp,
        reorderCamps,
        addCompletedHours,
      }}
    >
      {children}
    </PeaksContext.Provider>
  );
}

export function usePeaks(): PeaksContextType {
  const ctx = useContext(PeaksContext);
  if (!ctx) throw new Error('usePeaks must be used within PeaksProvider');
  return ctx;
}
