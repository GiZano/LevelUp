import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';

interface BlockChipProps {
  name: string;
  categoryColor: string;
  categoryEmoji: string;
  durationHours: number;
  done: boolean;
  description?: string;
  onPress: () => void;
}

export default function BlockChip({
  name,
  categoryColor,
  categoryEmoji,
  durationHours,
  done,
  description,
  onPress,
}: BlockChipProps) {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderLeftColor: categoryColor,
          backgroundColor: categoryColor + '20',
          opacity: done ? 0.5 : 1,
        },
      ]}
    >
      <Text style={styles.emoji}>{categoryEmoji}</Text>

      <View style={styles.nameContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {done && <MaterialCommunityIcons name="check-bold" size={16} color={colors.success} style={{ marginRight: 4 }} />}
          <Text
            style={[
              styles.name,
              { color: colors.text },
              done && styles.nameDone,
            ]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        {!!description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      <Text style={[styles.duration, { color: colors.textSecondary }]}>
        {durationHours}h
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  emoji: {
    fontSize: FontSize.sm,
    marginRight: Spacing.xs,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  checkmark: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    flexShrink: 1,
  },
  nameDone: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },
  duration: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
