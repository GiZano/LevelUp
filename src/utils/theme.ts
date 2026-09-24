/**
 * LevelUp — Theme constants
 *
 * Palette ispirata alla montagna:
 * - Slate blues per il cielo e gli sfondi
 * - Gold/amber per i progressi e gli achievement
 * - Emerald per i completamenti
 */

export const Colors = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    text: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    success: '#10B981',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    streak: '#F97316',
    mountain: '#CBD5E1',
    mountainFilled: '#F59E0B',
    mountainPeak: '#FBBF24',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#334155',
    primary: '#60A5FA',
    primaryDark: '#3B82F6',
    accent: '#FBBF24',
    accentLight: '#78350F',
    success: '#34D399',
    successLight: '#064E3B',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    streak: '#FB923C',
    mountain: '#475569',
    mountainFilled: '#FBBF24',
    mountainPeak: '#FDE68A',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
