import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { peakProgress, isPeakComplete } from '../utils/stats';
import type { Peak } from '../types';

interface PeakCardProps {
  peak: Peak;
  onPress: () => void;
}

export default function PeakCard({ peak, onPress }: PeakCardProps) {
  const { colors } = useThemeColors();
  const progress = peakProgress(peak);
  const completed = isPeakComplete(peak);
  const doneCamps = peak.camps.filter((c) => c.done).length;
  const totalCamps = peak.camps.length;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.name, { color: colors.text }]}
          numberOfLines={1}
        >
          {peak.name}
        </Text>
        {completed && <Text style={styles.badge}>🏁</Text>}
      </View>

      {peak.description ? (
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {peak.description}
        </Text>
      ) : null}

      <View
        style={[
          styles.progressTrack,
          { backgroundColor: colors.surfaceAlt },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: completed ? colors.success : colors.accent,
            },
          ]}
        />
      </View>

      <Text style={[styles.fraction, { color: colors.textTertiary }]}>
        {doneCamps}/{totalCamps} campi
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    fontSize: FontSize.lg,
    marginLeft: Spacing.sm,
  },
  description: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  fraction: {
    fontSize: FontSize.xs,
    textAlign: 'right',
  },
});
