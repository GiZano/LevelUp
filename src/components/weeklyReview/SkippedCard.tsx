import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useThemeColors } from '../../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../../utils/theme';
import { useLocale } from '../../store/LocaleContext';
import { getCategoryDisplayName } from '../../utils/categoryUtils';
import { formatHours } from '../../utils/weeklyReviewView';
import type { Category } from '../../types';
import type { ResolvedBlock, WeeklyReview } from '../../utils/weeklyReview';
import {
  IconName,
  IconRow,
  MIN_TOUCH_TARGET,
  ROW_ICON_SIZE,
  Section,
  sharedStyles,
} from './shared';

type SkippedDay = WeeklyReview['skippedByDay'][number];

const SKIPPED_PREVIEW_LIMIT = 6;
const ACCENT_BORDER_WIDTH = 4;

const countSkipped = (days: SkippedDay[]): number =>
  days.reduce((sum, day) => sum + day.blocks.length, 0);

function limitSkipped(days: SkippedDay[], limit: number): SkippedDay[] {
  let remaining = limit;
  return days
    .map((day) => {
      const blocks = day.blocks.slice(0, Math.max(remaining, 0));
      remaining -= blocks.length;
      return { day: day.day, blocks };
    })
    .filter((day) => day.blocks.length > 0);
}

interface SkippedRowProps {
  item: ResolvedBlock;
  categories: Category[];
}

function SkippedRow({ item, categories }: SkippedRowProps) {
  const { colors } = useThemeColors();
  const { locale } = useLocale();
  const category = categories.find((c) => c.id === item.categoryId);
  const color = category?.color ?? colors.border;
  const name = item.name || getCategoryDisplayName(category) || t('common.unknown');
  const detail = item.block.startTime + ' · ' + formatHours(item.hours, locale) + ' ';
  return (
    <View
      style={[styles.skippedRow, { backgroundColor: colors.surfaceAlt, borderLeftColor: color }]}
    >
      <MaterialCommunityIcons
        name={(category?.emoji || 'shape') as IconName}
        size={ROW_ICON_SIZE}
        color={color}
        style={sharedStyles.rowIcon}
      />
      <Text style={[styles.skippedName, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[sharedStyles.label, { color: colors.text }]}>
        {detail + t('review.hoursUnit')}
      </Text>
    </View>
  );
}

function SkippedList({ days, categories }: { days: SkippedDay[]; categories: Category[] }) {
  const { colors } = useThemeColors();
  return (
    <>
      {days.map(({ day, blocks }) => (
        <View key={day} style={styles.dayGroup}>
          <Text style={[styles.dayHeader, { color: colors.textSecondary }]}>
            {t(`days.${day}`)}
          </Text>
          {blocks.map((item) => (
            <SkippedRow key={item.block.id} item={item} categories={categories} />
          ))}
        </View>
      ))}
    </>
  );
}

interface SkippedCardProps {
  review: WeeklyReview;
  categories: Category[];
}

export default function SkippedCard({ review, categories }: SkippedCardProps) {
  const { colors } = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const total = countSkipped(review.skippedByDay);
  const canExpand = total > SKIPPED_PREVIEW_LIMIT;
  const days = expanded
    ? review.skippedByDay
    : limitSkipped(review.skippedByDay, SKIPPED_PREVIEW_LIMIT);
  const expand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(true);
  };
  return (
    <Section icon="calendar-remove-outline" iconColor={colors.danger} title={t('review.skipped')}>
      {total === 0 ? (
        <IconRow icon="check-circle" color={colors.success} text={t('review.noSkipped')} />
      ) : (
        <SkippedList days={days} categories={categories} />
      )}
      {canExpand && !expanded && (
        <Pressable onPress={expand} accessibilityRole="button" style={styles.showAll}>
          <Text style={[styles.showAllText, { color: colors.primary }]}>
            {t('review.showAll', { count: total })}
          </Text>
        </Pressable>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  dayGroup: { marginBottom: Spacing.sm },
  dayHeader: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: Spacing.xs },
  skippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderLeftWidth: ACCENT_BORDER_WIDTH,
    borderRadius: BorderRadius.sm,
  },
  skippedName: { flex: 1, marginRight: Spacing.sm, fontSize: FontSize.sm },
  showAll: { minHeight: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  showAllText: { fontSize: FontSize.sm, fontWeight: '600' },
});
