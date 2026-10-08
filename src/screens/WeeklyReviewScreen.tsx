import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { t } from '../utils/i18n';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';
import { usePeaks } from '../store/PeaksContext';
import { useLocale } from '../store/LocaleContext';
import CategoryProgress from '../components/CategoryProgress';
import { getCategoryDisplayName } from '../utils/categoryUtils';
import { getDatesOfWeek } from '../types/weekUtils';
import type { Category } from '../types';
import type { PlannerStackParamList } from '../types/navigation';
import {
  computeWeeklyReview,
  ResolvedBlock,
  StreakStatus,
  WeeklyReview,
} from '../utils/weeklyReview';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const formatHours = (value: number): number => Number(value.toFixed(1));

interface SectionProps {
  icon: IconName;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, iconColor, title, children }: SectionProps) {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} style={styles.headerIcon} />
        <Text accessibilityRole="header" style={[styles.cardTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function IconRow({ icon, color, text }: { icon: IconName; color: string; text: string }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={18} color={color} style={styles.rowIcon} />
      <Text style={[styles.rowText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  const { colors } = useThemeColors();
  return <Text style={[styles.muted, { color: colors.textSecondary }]}>{text}</Text>;
}

function HoursSection({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  return (
    <Section icon="clock-outline" iconColor={colors.primary} title={t('review.hours')}>
      {review.blocksScheduled === 0 ? (
        <EmptyText text={t('review.emptyWeek')} />
      ) : (
        <>
          <Text style={[styles.bigValue, { color: colors.text }]}>
            {t('review.hoursValue', {
              completed: formatHours(review.hoursCompleted),
              scheduled: formatHours(review.hoursScheduled),
            })}
          </Text>
          {review.categories.length > 0 && (
            <>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('review.byCategory')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {review.categories.map((item) => (
                  <View key={item.category.id} style={styles.progressItem}>
                    <CategoryProgress
                      emoji={item.category.emoji}
                      name={getCategoryDisplayName(item.category)}
                      scheduled={item.scheduled}
                      completed={item.completed}
                      target={item.target}
                      color={item.category.color}
                    />
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </>
      )}
    </Section>
  );
}

function CompletionSection({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  const targeted = review.categories.filter((item) => item.target > 0);
  if (review.blocksScheduled === 0 && targeted.length === 0) return null;
  return (
    <Section
      icon="check-decagram-outline"
      iconColor={colors.success}
      title={t('review.completion')}
    >
      {review.blocksScheduled > 0 && (
        <Text style={[styles.bigValue, { color: colors.text }]}>
          {t('review.blocksValue', {
            completed: review.blocksCompleted,
            scheduled: review.blocksScheduled,
            rate: review.completionRate,
          })}
        </Text>
      )}
      {targeted.map((item) => (
        <IconRow
          key={item.category.id}
          icon={item.metTarget ? 'check-circle' : 'close-circle'}
          color={item.metTarget ? colors.success : colors.danger}
          text={`${getCategoryDisplayName(item.category)} - ${t(
            item.metTarget ? 'review.targetMet' : 'review.targetMissed'
          )}`}
        />
      ))}
    </Section>
  );
}

function SkippedRow({ item, fallbackName }: { item: ResolvedBlock; fallbackName: string }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.skippedRow}>
      <Text style={[styles.skippedName, { color: colors.text }]} numberOfLines={1}>
        {item.name || fallbackName}
      </Text>
      <Text style={[styles.skippedMeta, { color: colors.textSecondary }]}>
        {item.block.startTime} - {formatHours(item.hours)}h
      </Text>
    </View>
  );
}

function SkippedSection({ review, categories }: { review: WeeklyReview; categories: Category[] }) {
  const { colors } = useThemeColors();
  const nameOf = (item: ResolvedBlock): string =>
    getCategoryDisplayName(categories.find((c) => c.id === item.categoryId)) || t('common.unknown');
  return (
    <Section icon="calendar-remove-outline" iconColor={colors.danger} title={t('review.skipped')}>
      {review.streakStatus === 'upcoming' ? (
        <EmptyText text={t('review.futureWeek')} />
      ) : review.skippedByDay.length === 0 ? (
        <IconRow icon="check-circle" color={colors.success} text={t('review.noSkipped')} />
      ) : (
        review.skippedByDay.map(({ day, blocks }) => (
          <View key={day} style={styles.dayGroup}>
            <Text style={[styles.dayHeader, { color: colors.textSecondary }]}>
              {t(`days.${day}`)}
            </Text>
            {blocks.map((item) => (
              <SkippedRow key={item.block.id} item={item} fallbackName={nameOf(item)} />
            ))}
          </View>
        ))
      )}
    </Section>
  );
}

function StreakStatusRow({ status }: { status: StreakStatus }) {
  const { colors } = useThemeColors();
  switch (status) {
    case 'survived':
      return (
        <IconRow icon="shield-check" color={colors.success} text={t('review.streakSurvived')} />
      );
    case 'started':
      return <IconRow icon="sprout" color={colors.accent} text={t('review.streakStarted')} />;
    case 'broken':
      return <IconRow icon="shield-off" color={colors.danger} text={t('review.streakBroken')} />;
    default:
      return <EmptyText text={t('review.futureWeek')} />;
  }
}

function StreakSection({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  return (
    <Section icon="fire" iconColor={colors.streak} title={t('review.streak')}>
      <Text style={[styles.bigValue, { color: colors.text }]}>
        {t('review.streakDays', { count: review.streak })}
      </Text>
      <StreakStatusRow status={review.streakStatus} />
    </Section>
  );
}

function PeaksSection({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  const hasProgress = review.campsCompleted.length > 0 || review.peaksReached.length > 0;
  return (
    <Section icon="image-filter-hdr" iconColor={colors.primary} title={t('review.peaks')}>
      {!hasProgress && <EmptyText text={t('review.noPeakProgress')} />}
      {review.campsCompleted.length > 0 && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('review.campsCompleted')}
        </Text>
      )}
      {review.campsCompleted.map(({ peak, camp }) => (
        <IconRow
          key={camp.id}
          icon="flag-variant"
          color={colors.accent}
          text={`${camp.name} · ${peak.name}`}
        />
      ))}
      {review.peaksReached.length > 0 && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('review.peaksReached')}
        </Text>
      )}
      {review.peaksReached.map((peak) => (
        <IconRow key={peak.id} icon="flag-checkered" color={colors.mountainPeak} text={peak.name} />
      ))}
    </Section>
  );
}

type WeeklyReviewProps = NativeStackScreenProps<PlannerStackParamList, 'WeeklyReview'>;

export default function WeeklyReviewScreen({ navigation }: WeeklyReviewProps) {
  const { colors } = useThemeColors();
  const { locale } = useLocale();
  const {
    currentPlan,
    currentWeekId,
    categories,
    templates,
    isLoading: plannerLoading,
  } = usePlanner();
  const { peaks, streak, lastActiveDate, isLoading: peaksLoading } = usePeaks();
  const isLoading = plannerLoading || peaksLoading;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, colors]);

  const review = useMemo(
    () =>
      computeWeeklyReview({
        plan: currentPlan,
        categories,
        templates,
        peaks,
        streak,
        lastActiveDate,
        today: new Date(),
      }),
    [currentPlan, categories, templates, peaks, streak, lastActiveDate]
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const monday = getDatesOfWeek(currentWeekId)[0];
  const weekLabel = t('review.weekOf', {
    date: monday.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
  });

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.weekLabel, { color: colors.textSecondary }]}>{weekLabel}</Text>
      <HoursSection review={review} />
      <CompletionSection review={review} />
      <SkippedSection review={review} categories={categories} />
      <StreakSection review={review} />
      <PeaksSection review={review} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.md, gap: Spacing.md },
  weekLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  headerIcon: { marginRight: Spacing.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700' },
  bigValue: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.sm, fontWeight: '600', marginVertical: Spacing.xs },
  muted: { fontSize: FontSize.sm },
  progressItem: { marginRight: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  rowIcon: { marginRight: Spacing.sm },
  rowText: { fontSize: FontSize.sm, flexShrink: 1 },
  dayGroup: { marginBottom: Spacing.sm },
  dayHeader: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: Spacing.xs },
  skippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  skippedName: { fontSize: FontSize.sm, flex: 1, marginRight: Spacing.sm },
  skippedMeta: { fontSize: FontSize.xs },
});
