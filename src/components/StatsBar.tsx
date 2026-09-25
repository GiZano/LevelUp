import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import type { UserStats } from '../types';
import { t } from '../utils/i18n';

interface StatsBarProps {
  stats: UserStats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const { colors } = useThemeColors();

  const cards = [
    {
      icon: '🏔️',
      value: `${stats.totalAltitude.toLocaleString()}m`,
      label: t('home.totalAlt'),
    },
    {
      icon: '⛰️',
      value: String(stats.peaksReached),
      label: t('home.peaksReached'),
    },
    {
      icon: '🔥',
      value: String(stats.currentStreak),
      label: t('home.streak'),
    },
  ];

  return (
    <View style={styles.container}>
      {cards.map((card) => (
        <View
          key={card.label}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={styles.icon}>{card.icon}</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {card.value}
          </Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  icon: {
    fontSize: FontSize.xl,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});
