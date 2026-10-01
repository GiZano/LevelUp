import { getCategoryDisplayName } from '../categoryUtils';
import { t } from '../i18n';
import type { Category } from '../../types';

describe('categoryUtils', () => {
  it('returns empty string when category is null or undefined', () => {
    expect(getCategoryDisplayName(null)).toBe('');
    expect(getCategoryDisplayName(undefined)).toBe('');
  });

  it('translates default category lectura / reading properly', () => {
    const defaultCat: Category = {
      id: 'lettura',
      name: 'Lettura',
      color: '#F59E0B',
      emoji: 'book-open-page-variant',
      targetHoursPerWeek: 3,
    };
    expect(getCategoryDisplayName(defaultCat)).toBe(t('categories.reading'));

    const englishDefault: Category = {
      ...defaultCat,
      name: 'Reading',
    };
    expect(getCategoryDisplayName(englishDefault)).toBe(t('categories.reading'));
  });

  it('preserves custom renamed name for lettura', () => {
    const customCat: Category = {
      id: 'lettura',
      name: 'Libri Personali',
      color: '#F59E0B',
      emoji: 'book-open-page-variant',
      targetHoursPerWeek: 3,
    };
    expect(getCategoryDisplayName(customCat)).toBe('Libri Personali');

    const renamedToAltro: Category = {
      ...customCat,
      name: 'Altro',
    };
    expect(getCategoryDisplayName(renamedToAltro)).toBe('Altro');
  });

  it('translates default category progetto properly', () => {
    const defaultCat: Category = {
      id: 'progetto',
      name: 'Progetto',
      color: '#EC4899',
      emoji: 'rocket-launch',
      targetHoursPerWeek: 2,
    };
    expect(getCategoryDisplayName(defaultCat)).toBe(t('categories.project'));

    const englishDefault: Category = {
      ...defaultCat,
      name: 'Project',
    };
    expect(getCategoryDisplayName(englishDefault)).toBe(t('categories.project'));
  });

  it('preserves custom renamed name for progetto', () => {
    const customCat: Category = {
      id: 'progetto',
      name: 'Side Hustle',
      color: '#EC4899',
      emoji: 'rocket-launch',
      targetHoursPerWeek: 2,
    };
    expect(getCategoryDisplayName(customCat)).toBe('Side Hustle');

    const renamedToAltro: Category = {
      ...customCat,
      name: 'Altro',
    };
    expect(getCategoryDisplayName(renamedToAltro)).toBe('Altro');
  });

  it('preserves custom names for user-created categories', () => {
    const userCat: Category = {
      id: 'custom-123',
      name: 'Palestra',
      color: '#10B981',
      emoji: 'dumbbell',
      targetHoursPerWeek: 4,
    };
    expect(getCategoryDisplayName(userCat)).toBe('Palestra');
  });
});
