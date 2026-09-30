import type { Category } from '../types';
import { t } from './i18n';

const DEFAULT_CATEGORY_MAP: Record<string, { key: string; defaults: string[] }> = {
  sonno: { key: 'categories.sleep', defaults: ['Sonno', 'Sleep', 'Schlaf', 'Sommeil', 'Sueño', 'Sueno'] },
  uni: { key: 'categories.uni', defaults: ['Lezione Uni', 'University', 'Uni', 'Universität', 'Universite', 'Université', 'Universidad'] },
  studio: { key: 'categories.study', defaults: ['Studio', 'Study', 'Lernen', 'Études', 'Etudes', 'Estudio'] },
  cp: { key: 'categories.cp', defaults: ['Competitive Prog.', 'Competitive Prog'] },
  hobby: { key: 'categories.hobby', defaults: ['Hobby', 'Loisir', 'Afición', 'Aficion'] },
  lettura: { key: 'categories.reading', defaults: ['Lettura', 'Reading', 'Altro', 'Other', 'Lesen', 'Lecture', 'Lectura'] },
  progetto: { key: 'categories.project', defaults: ['Progetto', 'Project', 'Altro', 'Other', 'Projekt', 'Projet', 'Proyecto'] },
  libero: { key: 'categories.freetime', defaults: ['Tempo Libero', 'Free Time', 'Freizeit', 'Temps libre', 'Tiempo libre'] },
};

export function getCategoryDisplayName(cat?: Category | null): string {
  if (!cat) return '';
  const def = DEFAULT_CATEGORY_MAP[cat.id];
  if (def && def.defaults.some((d) => d.toLowerCase() === cat.name.trim().toLowerCase())) {
    return t(def.key);
  }
  return cat.name;
}
