import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import type { Camp } from '../types';

interface CampItemProps {
  camp: Camp;
  onToggle: () => void;
  onDelete: () => void;
}

export default function CampItem({ camp, onToggle, onDelete }: CampItemProps) {
  const { colors } = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        onPress={onToggle}
        style={styles.checkboxArea}
        activeOpacity={0.6}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: camp.done ? colors.success : colors.textTertiary,
              backgroundColor: camp.done ? colors.success : 'transparent',
            },
          ]}
        >
          {camp.done && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <Text
        style={[
          styles.name,
          { color: camp.done ? colors.textTertiary : colors.text },
          camp.done && styles.nameCompleted,
        ]}
        numberOfLines={1}
      >
        {camp.name}
      </Text>

      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        activeOpacity={0.6}
      >
        <Text style={[styles.deleteIcon, { color: colors.danger }]}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  checkboxArea: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
    lineHeight: FontSize.sm,
  },
  name: {
    flex: 1,
    fontSize: FontSize.md,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  deleteIcon: {
    fontSize: FontSize.md,
  },
});
