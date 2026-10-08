import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../../utils/theme';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
export type ThemeColors = ReturnType<typeof useThemeColors>['colors'];

export const MIN_TOUCH_TARGET = 44;
export const TINT_ALPHA = '20';
export const SECTION_ICON_SIZE = 22;
export const ROW_ICON_SIZE = 18;

export function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

interface SectionProps {
  icon: IconName;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

export function Section({ icon, iconColor, title, children }: SectionProps) {
  const { colors } = useThemeColors();
  return (
    <Card>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={SECTION_ICON_SIZE}
          color={iconColor}
          style={styles.headerIcon}
        />
        <Text accessibilityRole="header" style={[styles.cardTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </Card>
  );
}

interface IconRowProps {
  icon: IconName;
  color: string;
  text: string;
  maxLines?: number;
}

export function IconRow({ icon, color, text, maxLines }: IconRowProps) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons
        name={icon}
        size={ROW_ICON_SIZE}
        color={color}
        style={sharedStyles.rowIcon}
      />
      <Text style={[styles.rowText, { color: colors.text }]} numberOfLines={maxLines}>
        {text}
      </Text>
    </View>
  );
}

export const sharedStyles = StyleSheet.create({
  value: { fontSize: FontSize.lg, fontWeight: '700' },
  label: { fontSize: FontSize.xs },
  rowIcon: { marginRight: Spacing.sm },
});

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  headerIcon: { marginRight: Spacing.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  rowText: { fontSize: FontSize.sm, flexShrink: 1 },
});
