import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useThemeColors } from '../../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../../utils/theme';
import { getCategoryDisplayName } from '../../utils/categoryUtils';
import { formatHours } from '../../utils/weeklyReviewView';
import type { WeekPhase, WeeklyInsight } from '../../utils/weeklyReview';
import { IconName, ThemeColors, TINT_ALPHA, sharedStyles } from './shared';

const BANNER_ICON_SIZE = 20;

interface InsightView {
  icon: IconName;
  color: string;
  text: string;
}

interface InsightContext {
  phase: WeekPhase;
  colors: ThemeColors;
  locale: string;
}

function getFocusText(
  insight: Extract<WeeklyInsight, { type: 'focus' }>,
  { phase, locale }: InsightContext
): string {
  const hours = formatHours(insight.missingHours, locale) + ' ' + t('review.hoursUnit');
  const key = phase === 'current' ? 'review.insightFocusCurrent' : 'review.insightFocus';
  return t(key, { category: getCategoryDisplayName(insight.category), hours });
}

export function getInsightView(
  insight: WeeklyInsight,
  context: InsightContext
): InsightView | null {
  const { colors } = context;
  switch (insight.type) {
    case 'perfect':
      return { icon: 'trophy-outline', color: colors.success, text: t('review.insightPerfect') };
    case 'great':
      return { icon: 'thumb-up-outline', color: colors.success, text: t('review.insightGreat') };
    case 'focus':
      return { icon: 'target', color: colors.accent, text: getFocusText(insight, context) };
    case 'keepGoing':
      return { icon: 'trending-up', color: colors.primary, text: t('review.insightKeepGoing') };
    case 'empty':
    case 'upcoming':
      return null;
    default: {
      const unhandled: never = insight;
      return unhandled;
    }
  }
}

interface InsightBannerProps {
  insight: WeeklyInsight;
  phase: WeekPhase;
  locale: string;
}

export default function InsightBanner({ insight, phase, locale }: InsightBannerProps) {
  const { colors } = useThemeColors();
  const view = getInsightView(insight, { phase, colors, locale });
  if (!view) return null;
  return (
    <View style={[styles.banner, { backgroundColor: view.color + TINT_ALPHA }]}>
      <MaterialCommunityIcons
        name={view.icon}
        size={BANNER_ICON_SIZE}
        color={view.color}
        style={sharedStyles.rowIcon}
      />
      <Text style={[styles.bannerText, { color: colors.text }]}>{view.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  bannerText: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
});
