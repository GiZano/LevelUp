import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';

interface CategoryProgressProps {
  emoji: string;
  name: string;
  scheduled: number;
  completed: number;
  target: number;
  color: string;
}

export default function CategoryProgress({
  emoji,
  name,
  scheduled,
  completed,
  target,
  color,
}: CategoryProgressProps) {
  const { colors } = useThemeColors();

  const scheduledRatio = target > 0 ? Math.min(1, scheduled / target) : 0;
  const completedRatio = target > 0 ? Math.min(1, completed / target) : 0;
  const reachedTarget = completed >= target && target > 0;
  const fillColor = reachedTarget ? colors.success : color;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <Text style={[styles.hours, { color: colors.textSecondary }]}>
          {completed}/{target}h
        </Text>
      </View>

      <View
        style={[styles.track, { backgroundColor: colors.surfaceAlt }]}
      >
        {/* Scheduled fill (lighter) */}
        <View
          style={[
            styles.scheduledFill,
            {
              width: `${Math.round(scheduledRatio * 100)}%`,
              backgroundColor: fillColor + '40',
            },
          ]}
        />
        {/* Completed fill (solid) */}
        <View
          style={[
            styles.completedFill,
            {
              width: `${Math.round(completedRatio * 100)}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.xs,
  },
  emoji: {
    fontSize: FontSize.sm,
    marginRight: Spacing.xs,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  hours: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  scheduledFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  completedFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
