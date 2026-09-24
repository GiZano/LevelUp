import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Category, BlockTemplate, ScheduledBlock, WeeklyPlan, DayOfWeek } from '../types';
import { generateId } from '../utils/id';
import {
  saveCategories,
  loadCategories,
  saveTemplates,
  loadTemplates,
  saveWeeklyPlan,
  loadWeeklyPlan,
} from './plannerStorage';
import { getCurrentWeekId } from '../types/weekUtils';
import { createCalendarEvent } from '../utils/calendar';

// ── Categorie predefinite ──

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'sonno', name: 'Sonno', color: '#6366F1', emoji: '😴', targetHoursPerWeek: 56 },
  { id: 'uni', name: 'Lezione Uni', color: '#0EA5E9', emoji: '🎓', targetHoursPerWeek: 20 },
  { id: 'studio', name: 'Studio', color: '#3B82F6', emoji: '📚', targetHoursPerWeek: 20 },
  { id: 'cp', name: 'Competitive Programming', color: '#8B5CF6', emoji: '💻', targetHoursPerWeek: 4 },
  { id: 'hobby', name: 'Hobby', color: '#10B981', emoji: '♟️', targetHoursPerWeek: 3 },
  { id: 'lettura', name: 'Lettura', color: '#F59E0B', emoji: '📖', targetHoursPerWeek: 3 },
  { id: 'progetto', name: 'Side Project', color: '#EC4899', emoji: '🚀', targetHoursPerWeek: 2 },
  { id: 'libero', name: 'Tempo Libero', color: '#6B7280', emoji: '🎮', targetHoursPerWeek: 0 },
];

interface PlannerState {
  categories: Category[];
  templates: BlockTemplate[];
  currentPlan: WeeklyPlan;
  currentWeekId: string;
  isLoading: boolean;
}

interface PlannerActions {
  changeWeek: (weekId: string) => void;
  addCategory: (name: string, emoji: string, color: string, targetHours: number) => void;
  deleteCategory: (id: string) => void;
  addTemplate: (name: string, categoryId: string, durationHours: number, peakId?: string) => void;
  deleteTemplate: (id: string) => void;
  scheduleBlock: (templateId: string, day: DayOfWeek, startTime: string) => void;
  scheduleOneOffBlock: (name: string, categoryId: string, durationHours: number, day: DayOfWeek, startTime: string) => void;
  unscheduleBlock: (blockId: string) => void;
  toggleBlockDone: (blockId: string) => void;
  getTemplateById: (id: string) => BlockTemplate | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryHours: (categoryId: string) => { scheduled: number; completed: number; target: number };
}

type PlannerContextType = PlannerState & PlannerActions;

const PlannerContext = createContext<PlannerContextType | null>(null);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [currentWeekId, setCurrentWeekId] = useState(getCurrentWeekId());
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan>({ weekId: currentWeekId, blocks: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Carica dati all'avvio
  useEffect(() => {
    (async () => {
      try {
        const [cats, tmpl, plan] = await Promise.all([
          loadCategories(),
          loadTemplates(),
          loadWeeklyPlan(currentWeekId),
        ]);
        if (cats.length > 0) setCategories(cats);
        setTemplates(tmpl);
        if (plan) setCurrentPlan(plan);
      } catch (e) {
        console.error('Errore caricamento planner:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const changeWeek = useCallback(async (newWeekId: string) => {
    setIsLoading(true);
    try {
      const plan = await loadWeeklyPlan(newWeekId);
      setCurrentWeekId(newWeekId);
      setCurrentPlan(plan || { weekId: newWeekId, blocks: [] });
    } catch (e) {
      console.error('Errore cambio settimana:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (!isLoading) {
      saveCategories(categories).catch(console.error);
    }
  }, [categories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveTemplates(templates).catch(console.error);
    }
  }, [templates, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveWeeklyPlan(currentPlan).catch(console.error);
    }
  }, [currentPlan, isLoading]);

  // ── Actions ──

  const addCategory = useCallback((name: string, emoji: string, color: string, targetHours: number) => {
    setCategories((prev) => [...prev, {
      id: generateId(),
      name,
      emoji,
      color,
      targetHoursPerWeek: targetHours,
    }]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addTemplate = useCallback((name: string, categoryId: string, durationHours: number, peakId?: string) => {
    setTemplates((prev) => [...prev, {
      id: generateId(),
      name,
      categoryId,
      durationHours,
      peakId,
    }]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    // Rimuovi anche i blocchi schedulati con questo template
    setCurrentPlan((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.templateId !== id),
    }));
  }, []);

  const scheduleBlock = useCallback((templateId: string, day: DayOfWeek, startTime: string) => {
    setCurrentPlan((prev) => {
      const newBlock: ScheduledBlock = {
        id: generateId(),
        templateId,
        day,
        startTime,
        done: false,
      };

      // Sincronizza con Google Calendar in background
      const template = templates.find(t => t.id === templateId);
      if (template) {
        createCalendarEvent(template.name, day, startTime, template.durationHours).catch(console.error);
      }

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
      };
    });
  }, [templates]);

  const scheduleOneOffBlock = useCallback((name: string, categoryId: string, durationHours: number, day: DayOfWeek, startTime: string) => {
    setCurrentPlan((prev) => {
      const newBlock: ScheduledBlock = {
        id: generateId(),
        day,
        startTime,
        done: false,
        isOneOff: true,
        oneOffName: name,
        oneOffCategoryId: categoryId,
        oneOffDuration: durationHours,
      };

      // Sincronizza con Google Calendar in background
      createCalendarEvent(name, day, startTime, durationHours).catch(console.error);

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
      };
    });
  }, [templates]);

  const unscheduleBlock = useCallback((blockId: string) => {
    setCurrentPlan((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
  }, []);

  const toggleBlockDone = useCallback((blockId: string) => {
    setCurrentPlan((prev) => {
      let duration = 0;
      const newBlocks = prev.blocks.map((b) => {
        if (b.id === blockId) {
          const isNowDone = !b.done;
          if (b.isOneOff) {
            duration = b.oneOffDuration || 0;
          } else if (b.templateId) {
            const template = templates.find((t) => t.id === b.templateId);
            duration = template?.durationHours || 0;
          }
          // We don't have access to PeaksContext here directly to call addCompletedHours.
          // We can let the component doing the toggle call addCompletedHours!
          return { ...b, done: isNowDone };
        }
        return b;
      });
      return { ...prev, blocks: newBlocks };
    });
  }, [templates]);

  const getTemplateById = useCallback((id: string) => {
    return templates.find((t) => t.id === id);
  }, [templates]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find((c) => c.id === id);
  }, [categories]);

  const getCategoryHours = useCallback((categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    let scheduled = 0;
    let completed = 0;

    for (const block of currentPlan.blocks) {
      const template = templates.find((t) => t.id === block.templateId);
      if (template?.categoryId === categoryId) {
        scheduled += template.durationHours;
        if (block.done) completed += template.durationHours;
      }
    }

    return {
      scheduled,
      completed,
      target: cat?.targetHoursPerWeek ?? 0,
    };
  }, [categories, templates, currentPlan]);

  return (
    <PlannerContext.Provider
      value={{
        categories,
        templates,
        currentPlan,
        currentWeekId,
        isLoading,
        changeWeek,
        addCategory,
        deleteCategory,
        addTemplate,
        deleteTemplate,
        scheduleBlock,
        scheduleOneOffBlock,
        unscheduleBlock,
        toggleBlockDone,
        getTemplateById,
        getCategoryById,
        getCategoryHours,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner(): PlannerContextType {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}
