import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useThemeColors } from '../../utils/useThemeColors';
import { Spacing, FontSize } from '../../utils/theme';
import { useLocale } from '../../store/LocaleContext';
import ProgressRing from '../ProgressRing';
import { formatHours } from '../../utils/weeklyReviewView';
import type { WeeklyInsight, WeeklyReview } from '../../utils/weeklyReview';
import InsightBanner from './InsightBanner';
import { Card, IconName, sharedStyles } from './shared';

const GREAT_RATE = 80;
const RING_SIZE = 96;
const RING_STROKE = 10;
const EMPTY_ICON_SIZE = 48;
const RING_TEXT_MAX_SCALE = 1.2;
const STAT_MIN_FONT_SCALE = 0.7;

function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name={icon} size={EMPTY_ICON_SIZE} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.statLine}>
      <Text style={[sharedStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={[sharedStyles.value, { color: colors.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={STAT_MIN_FONT_SCALE}
      >
        {value}
      </Text>
    </View>
  );
}

function HeroStats({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  const { locale } = useLocale();
  const rate = review.completionRate;
  return (
    <View style={styles.heroRow}>
      <ProgressRing
        progress={rate / 100}
        size={RING_SIZE}
        strokeWidth={RING_STROKE}
        color={rate >= GREAT_RATE ? colors.success : colors.primary}
        trackColor={colors.surfaceAlt}
        label={t('review.completionLabel')}
      >
        <Text
          style={[sharedStyles.value, { color: colors.text }]}
          maxFontSizeMultiplier={RING_TEXT_MAX_SCALE}
        >
          {String(rate) + '%'}
        </Text>
      </ProgressRing>
      <View style={styles.heroStats}>
        <StatLine
          label={t('review.hours')}
          value={t('review.hoursValue', {
            completed: formatHours(review.hoursCompleted, locale),
            scheduled: formatHours(review.hoursScheduled, locale),
            unit: t('review.hoursUnit'),
          })}
        />
        <StatLine
          label={t('review.blocks')}
          value={String(review.blocksCompleted) + ' / ' + String(review.blocksScheduled)}
        />
      </View>
    </View>
  );
}

interface HeroCardProps {
  review: WeeklyReview;
  insight: WeeklyInsight;
}

export default function HeroCard({ review, insight }: HeroCardProps) {
  const { locale } = useLocale();
  if (insight.type === 'upcoming') {
    return (
      <Card>
        <EmptyState icon="calendar-clock" text={t('review.futureWeek')} />
      </Card>
    );
  }
  if (insight.type === 'empty') {
    return (
      <Card>
        <EmptyState icon="calendar-blank-outline" text={t('review.emptyWeek')} />
      </Card>
    );
  }
  return (
    <Card>
      <HeroStats review={review} />
      <InsightBanner insight={insight} phase={review.phase} locale={locale} />
    </Card>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroStats: { flex: 1, gap: Spacing.md },
  statLine: { gap: Spacing.xs },
});
