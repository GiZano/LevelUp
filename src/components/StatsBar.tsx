import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import type { UserStats } from '../types';
import { t } from '../utils/i18n';

interface StatsBarProps {
  stats: UserStats;
  onAltPress?: () => void;
  onPeaksPress?: () => void;
}

export default function StatsBar({ stats, onAltPress, onPeaksPress }: StatsBarProps) {
  const { colors } = useThemeColors();

  const cards = [
    {
      icon: '🏔️',
      value: `${stats.totalAltitude.toLocaleString()}m`,
      label: t('home.totalAlt'),
      onPress: onAltPress,
    },
    {
      icon: '⛰️',
      value: String(stats.peaksReached),
      label: t('home.peaksReached'),
      onPress: onPeaksPress,
    },
    {
      icon: '🔥',
      value: String(stats.currentStreak),
      label: t('home.streak'),
    },
  ];

  return (
    <View style={styles.container}>
      {cards.map((card) => {
        const Wrapper = card.onPress ? TouchableOpacity : View;
        return (
          <Wrapper
            key={card.label}
            onPress={card.onPress}
            activeOpacity={card.onPress ? 0.6 : 1}
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
          </Wrapper>
        );
      })}
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
