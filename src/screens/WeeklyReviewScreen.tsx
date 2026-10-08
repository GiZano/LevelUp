import React, { useLayoutEffect, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';
import { usePeaks } from '../store/PeaksContext';
import type { PlannerStackParamList } from '../types/navigation';
import { computeWeeklyReview, getWeeklyInsight } from '../utils/weeklyReview';
import WeekHeader from '../components/weeklyReview/WeekHeader';
import HeroCard from '../components/weeklyReview/HeroCard';
import CategoriesCard from '../components/weeklyReview/CategoriesCard';
import ReviewTiles from '../components/weeklyReview/ReviewTiles';
import SkippedCard from '../components/weeklyReview/SkippedCard';
import PeaksCard from '../components/weeklyReview/PeaksCard';
import useRestorePlannerWeek from '../components/weeklyReview/useRestorePlannerWeek';

type WeeklyReviewProps = NativeStackScreenProps<PlannerStackParamList, 'WeeklyReview'>;

export default function WeeklyReviewScreen({ navigation }: WeeklyReviewProps) {
  const { colors } = useThemeColors();
  const { currentPlan, currentWeekId, changeWeek, isLoading, categories, templates } = usePlanner();
  const { peaks, streak, lastActiveDate } = usePeaks();

  useRestorePlannerWeek(currentWeekId, changeWeek);

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
  const insight = useMemo(() => getWeeklyInsight(review), [review]);
  const isUpcoming = review.phase === 'upcoming';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <WeekHeader
        weekId={currentWeekId}
        phase={review.phase}
        isLoading={isLoading}
        onChangeWeek={changeWeek}
      />
      <HeroCard review={review} insight={insight} />
      <CategoriesCard categories={review.categories} phase={review.phase} />
      {!isUpcoming && <ReviewTiles review={review} />}
      {!isUpcoming && <SkippedCard key={review.weekId} review={review} categories={categories} />}
      <PeaksCard review={review} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md },
});
