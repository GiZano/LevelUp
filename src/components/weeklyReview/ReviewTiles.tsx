import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useThemeColors } from '../../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../../utils/theme';
import type { StreakStatus, WeeklyReview } from '../../utils/weeklyReview';
import { IconName, ThemeColors, sharedStyles } from './shared';

const TILE_ICON_SIZE = 24;
const STATUS_ICON_SIZE = 16;

interface StreakStatusView {
  icon: IconName;
  color: string;
  text: string;
}

function getStreakStatusView(status: StreakStatus, colors: ThemeColors): StreakStatusView | null {
  switch (status) {
    case 'survived':
      return { icon: 'shield-check', color: colors.success, text: t('review.streakSurvived') };
    case 'started':
      return { icon: 'sprout', color: colors.accent, text: t('review.streakStarted') };
    case 'broken':
      return { icon: 'shield-off', color: colors.danger, text: t('review.streakBroken') };
    case 'upcoming':
      return null;
    default: {
      const unhandled: never = status;
      return unhandled;
    }
  }
}

function Tile({ children }: { children: React.ReactNode }) {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function StreakTile({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  const status = getStreakStatusView(review.streakStatus, colors);
  return (
    <Tile>
      <MaterialCommunityIcons name="fire" size={TILE_ICON_SIZE} color={colors.streak} />
      <Text style={[sharedStyles.value, { color: colors.text }]}>
        {t('review.streakDays', { count: review.streak })}
      </Text>
      {status && (
        <View style={styles.statusStack}>
          <MaterialCommunityIcons name={status.icon} size={STATUS_ICON_SIZE} color={status.color} />
          <Text style={[styles.statusText, { color: colors.text }]}>{status.text}</Text>
        </View>
      )}
    </Tile>
  );
}

function PeaksTile({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  return (
    <Tile>
      <MaterialCommunityIcons name="image-filter-hdr" size={TILE_ICON_SIZE} color={colors.accent} />
      <Text style={[sharedStyles.value, { color: colors.text }]}>
        {String(review.campsCompleted.length)}
      </Text>
      <Text style={[sharedStyles.label, styles.centered, { color: colors.textSecondary }]}>
        {t('review.campsCompleted')}
      </Text>
      {review.peaksReached.length > 0 && (
        <View style={styles.tileExtra}>
          <MaterialCommunityIcons
            name="flag-checkered"
            size={STATUS_ICON_SIZE}
            color={colors.mountainPeak}
          />
          <Text style={[sharedStyles.label, styles.tileExtraText, { color: colors.textSecondary }]}>
            {String(review.peaksReached.length) + ' ' + t('review.peaksReached')}
          </Text>
        </View>
      )}
    </Tile>
  );
}

export default function ReviewTiles({ review }: { review: WeeklyReview }) {
  return (
    <View style={styles.tiles}>
      <StreakTile review={review} />
      <PeaksTile review={review} />
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: Spacing.sm },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  centered: { textAlign: 'center' },
  statusStack: { alignItems: 'center', gap: Spacing.xs },
  statusText: { fontSize: FontSize.xs, textAlign: 'center' },
  tileExtra: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  tileExtraText: { flexShrink: 1 },
});
