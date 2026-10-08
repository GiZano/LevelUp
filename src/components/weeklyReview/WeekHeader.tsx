import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useThemeColors } from '../../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../../utils/theme';
import { useLocale } from '../../store/LocaleContext';
import { getDatesOfWeek, getNextWeekId, getPrevWeekId } from '../../types/weekUtils';
import type { WeekPhase } from '../../utils/weeklyReview';
import { IconName, MIN_TOUCH_TARGET, TINT_ALPHA } from './shared';

const NAV_ICON_SIZE = 28;
const NAV_HIT_SLOP = 12;
const DISABLED_OPACITY = 0.4;

interface WeekNavButtonProps {
  icon: IconName;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

function WeekNavButton({ icon, label, disabled, onPress }: WeekNavButtonProps) {
  const { colors } = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={NAV_HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.navButton, disabled && { opacity: DISABLED_OPACITY }]}
    >
      <MaterialCommunityIcons name={icon} size={NAV_ICON_SIZE} color={colors.text} />
    </Pressable>
  );
}

function CurrentWeekPill() {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.pill, { backgroundColor: colors.primary + TINT_ALPHA }]}>
      <Text style={[styles.pillText, { color: colors.text }]}>{t('review.currentWeek')}</Text>
    </View>
  );
}

function formatWeekRange(weekId: string, locale: string): string {
  const dates = getDatesOfWeek(weekId);
  const start = dates[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const end = dates[6].toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${start} – ${end}`;
}

interface WeekHeaderProps {
  weekId: string;
  phase: WeekPhase;
  isLoading: boolean;
  onChangeWeek: (weekId: string) => void;
}

export default function WeekHeader({ weekId, phase, isLoading, onChangeWeek }: WeekHeaderProps) {
  const { colors } = useThemeColors();
  const { locale } = useLocale();
  return (
    <View style={styles.weekHeader}>
      <WeekNavButton
        icon="chevron-left"
        label={t('review.prevWeek')}
        disabled={isLoading}
        onPress={() => onChangeWeek(getPrevWeekId(weekId))}
      />
      <View style={styles.weekCenter}>
        <Text style={[styles.weekLabel, { color: colors.text }]}>
          {formatWeekRange(weekId, locale)}
        </Text>
        {phase === 'current' && <CurrentWeekPill />}
      </View>
      <WeekNavButton
        icon="chevron-right"
        label={t('review.nextWeek')}
        disabled={isLoading}
        onPress={() => onChangeWeek(getNextWeekId(weekId))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCenter: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  weekLabel: { fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  pill: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
});
