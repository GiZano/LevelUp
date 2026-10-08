import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useThemeColors } from '../../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../../utils/theme';
import { useLocale } from '../../store/LocaleContext';
import { getCategoryDisplayName } from '../../utils/categoryUtils';
import type { CategoryReview, WeekPhase } from '../../utils/weeklyReview';
import { formatHours, getCategoryBar, getTargetStatus } from '../../utils/weeklyReviewView';
import type { TargetStatus } from '../../utils/weeklyReviewView';
import { IconName, Section, ThemeColors, ROW_ICON_SIZE, TINT_ALPHA, sharedStyles } from './shared';

const CATEGORY_ICON_BOX = 36;
const CATEGORY_ICON_SIZE = 20;
const TRACK_HEIGHT = 6;
const HOURS_LABEL_MIN_WIDTH = 64;

interface StatusBadge {
  icon: IconName;
  color: string;
  label: string;
}

function getStatusBadge(status: TargetStatus, colors: ThemeColors): StatusBadge | null {
  switch (status) {
    case 'met':
      return { icon: 'check-circle', color: colors.success, label: t('review.targetMet') };
    case 'missed':
      return { icon: 'close-circle', color: colors.danger, label: t('review.targetMissed') };
    case 'inProgress':
      return {
        icon: 'progress-clock',
        color: colors.textTertiary,
        label: t('review.targetInProgress'),
      };
    case 'none':
      return null;
    default: {
      const unhandled: never = status;
      return unhandled;
    }
  }
}

function StatusSlot({ badge }: { badge: StatusBadge | null }) {
  return (
    <View style={styles.badgeSlot}>
      {badge && (
        <MaterialCommunityIcons
          name={badge.icon}
          size={ROW_ICON_SIZE}
          color={badge.color}
          accessibilityLabel={badge.label}
        />
      )}
    </View>
  );
}

interface CategoryRowProps {
  item: CategoryReview;
  phase: WeekPhase;
}

function CategoryRow({ item, phase }: CategoryRowProps) {
  const { colors } = useThemeColors();
  const { locale } = useLocale();
  const { category } = item;
  const bar = getCategoryBar(item, phase);
  const status = getTargetStatus(item, phase);
  const badge = getStatusBadge(status, colors);
  const name = getCategoryDisplayName(category);
  const unit = t('review.hoursUnit');
  const amount = formatHours(bar.amount, locale);
  const goal = formatHours(bar.goal, locale);
  const hoursText = t('review.hoursValue', { completed: amount, scheduled: goal, unit });
  return (
    <View
      style={styles.categoryRow}
      accessible
      accessibilityLabel={[name, hoursText, badge?.label].filter(Boolean).join(', ')}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.color + TINT_ALPHA }]}>
        <MaterialCommunityIcons
          name={(category.emoji || 'shape') as IconName}
          size={CATEGORY_ICON_SIZE}
          color={category.color}
        />
      </View>
      <View style={styles.categoryMiddle}>
        <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${bar.fraction * 100}%`,
                backgroundColor: status === 'met' ? colors.success : category.color,
              },
            ]}
          />
        </View>
      </View>
      <Text style={[sharedStyles.label, styles.categoryHours, { color: colors.textSecondary }]}>
        {amount + '/' + goal + ' ' + unit}
      </Text>
      <StatusSlot badge={badge} />
    </View>
  );
}

interface CategoriesCardProps {
  categories: CategoryReview[];
  phase: WeekPhase;
}

export default function CategoriesCard({ categories, phase }: CategoriesCardProps) {
  const { colors } = useThemeColors();
  if (categories.length === 0) return null;
  return (
    <Section icon="shape-outline" iconColor={colors.primary} title={t('review.categories')}>
      {categories.map((item) => (
        <CategoryRow key={item.category.id} item={item} phase={phase} />
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  categoryIcon: {
    width: CATEGORY_ICON_BOX,
    height: CATEGORY_ICON_BOX,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryMiddle: { flex: 1, gap: Spacing.xs },
  categoryName: { fontSize: FontSize.sm, fontWeight: '600' },
  track: { height: TRACK_HEIGHT, borderRadius: BorderRadius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: BorderRadius.full },
  categoryHours: {
    minWidth: HOURS_LABEL_MIN_WIDTH,
    marginHorizontal: Spacing.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
  badgeSlot: { width: ROW_ICON_SIZE, height: ROW_ICON_SIZE },
});
