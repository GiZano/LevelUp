import { SafeAreaView } from "react-native-safe-area-context";
import React, { useLayoutEffect, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';
import { DAY_LABELS, TIME_SLOTS, TIME_SLOT_LABELS, type TimeSlot } from '../types';
import { getTodayDayOfWeek } from '../types/weekUtils';

export default function TodayScreen({ navigation }: { navigation: any }) {
  const { colors } = useThemeColors();
  const {
    currentPlan,
    toggleBlockDone,
    getTemplateById,
    getCategoryById,
  } = usePlanner();

  const today = useMemo(() => getTodayDayOfWeek(), []);
  const dayLabel = DAY_LABELS[today];
  const dateStr = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Oggi',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, colors]);

  const todayBlocks = useMemo(
    () => currentPlan.blocks.filter((b) => b.day === today),
    [currentPlan.blocks, today],
  );

  const blocksBySlot = useMemo(() => {
    const map: Record<TimeSlot, typeof todayBlocks> = {
      mattina: [],
      pomeriggio: [],
      sera: [],
    };
    for (const b of todayBlocks) {
      map[b.timeSlot].push(b);
    }
    return map;
  }, [todayBlocks]);

  // Summary
  const { totalHours, completedHours } = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const b of todayBlocks) {
      const tmpl = b.templateId ? getTemplateById(b.templateId) : undefined;
      if (tmpl) {
        total += tmpl.durationHours;
        if (b.done) completed += tmpl.durationHours;
      }
    }
    return { totalHours: total, completedHours: completed };
  }, [todayBlocks, getTemplateById]);

  const pct = totalHours > 0 ? Math.min(completedHours / totalHours, 1) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.dayName, { color: colors.text }]}>{dayLabel}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{dateStr}</Text>
        </View>

        {/* Time slot sections */}
        {TIME_SLOTS.map((slot) => {
          const blocks = blocksBySlot[slot];
          return (
            <View key={slot} style={styles.section}>
              <Text style={[styles.slotHeader, { color: colors.text }]}>
                {TIME_SLOT_LABELS[slot]}
              </Text>

              {blocks.length === 0 ? (
                <Text style={[styles.emptySlot, { color: colors.textTertiary }]}>
                  Nessun blocco
                </Text>
              ) : (
                blocks.map((b) => {
                  const tmpl = b.templateId ? getTemplateById(b.templateId) : undefined;
                  const cat = tmpl ? getCategoryById(tmpl.categoryId) : undefined;
                  return (
                    <Pressable
                      key={b.id}
                      style={[
                        styles.blockCard,
                        {
                          backgroundColor: colors.surface,
                          borderLeftColor: cat?.color ?? colors.primary,
                          opacity: b.done ? 0.55 : 1,
                        },
                      ]}
                      onPress={() => toggleBlockDone(b.id)}
                    >
                      {/* Checkbox */}
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: b.done ? colors.success : colors.border,
                            backgroundColor: b.done ? colors.success : 'transparent',
                          },
                        ]}
                      >
                        {b.done && <Text style={styles.checkmark}>✓</Text>}
                      </View>

                      <View style={styles.blockInfo}>
                        <Text
                          style={[
                            styles.blockName,
                            { color: colors.text },
                            b.done && styles.strikethrough,
                          ]}
                          numberOfLines={1}
                        >
                          {tmpl?.name ?? '?'}
                        </Text>
                        <Text style={[styles.blockMeta, { color: colors.textSecondary }]}>
                          {cat?.emoji} {cat?.name} · {tmpl?.durationHours}h
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Summary bar */}
      <View style={[styles.summaryBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          {completedHours}/{totalHours} ore completate oggi
        </Text>
        <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${pct * 100}%`,
                backgroundColor: pct >= 1 ? colors.success : colors.accent,
              },
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  /* Header */
  header: { marginBottom: Spacing.lg },
  dayName: { fontSize: FontSize.xxl, fontWeight: '700' },
  date: { fontSize: FontSize.md, marginTop: 2 },

  /* Slot sections */
  section: { marginBottom: Spacing.lg },
  slotHeader: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: Spacing.sm },
  emptySlot: { fontSize: FontSize.sm, paddingVertical: Spacing.sm },

  /* Block card */
  blockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 16 },
  blockInfo: { flex: 1 },
  blockName: { fontSize: FontSize.md, fontWeight: '500' },
  blockMeta: { fontSize: FontSize.sm, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through' },

  /* Summary bar */
  summaryBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  summaryText: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
});
