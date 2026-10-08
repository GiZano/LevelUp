import React from 'react';
import { t } from '../../utils/i18n';
import { useThemeColors } from '../../utils/useThemeColors';
import type { WeeklyReview } from '../../utils/weeklyReview';
import { IconRow, Section } from './shared';

const PEAK_ROW_MAX_LINES = 2;

export default function PeaksCard({ review }: { review: WeeklyReview }) {
  const { colors } = useThemeColors();
  if (review.campsCompleted.length === 0 && review.peaksReached.length === 0) return null;
  return (
    <Section icon="image-filter-hdr" iconColor={colors.primary} title={t('review.peaks')}>
      {review.campsCompleted.map(({ peak, camp }) => (
        <IconRow
          key={camp.id}
          icon="flag-variant"
          color={colors.accent}
          text={camp.name + ' · ' + peak.name}
          maxLines={PEAK_ROW_MAX_LINES}
        />
      ))}
      {review.peaksReached.map((peak) => (
        <IconRow
          key={peak.id}
          icon="flag-checkered"
          color={colors.mountainPeak}
          text={peak.name}
          maxLines={PEAK_ROW_MAX_LINES}
        />
      ))}
    </Section>
  );
}
