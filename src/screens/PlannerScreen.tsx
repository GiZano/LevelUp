import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  TIME_SLOT_LABELS,
  type DayOfWeek,
  type TimeSlot,
} from '../types';
import { getTodayDayOfWeek } from '../types/weekUtils';

const DAY_SHORT: Record<DayOfWeek, string> = {
  lun: 'L',
  mar: 'M',
  mer: 'M',
  gio: 'G',
  ven: 'V',
  sab: 'S',
  dom: 'D',
};

const COL_WIDTH = 110;

export default function PlannerScreen({ navigation }: { navigation: any }) {
  const { colors } = useThemeColors();
  const {
    categories,
    templates,
    currentPlan,
    currentWeekId,
    scheduleBlock,
    unscheduleBlock,
    toggleBlockDone,
    getTemplateById,
    getCategoryById,
    getCategoryHours,
  } = usePlanner();

  const [pickSlot, setPickSlot] = useState<{ day: DayOfWeek; timeSlot: TimeSlot } | null>(null);

  const today = useMemo(() => getTodayDayOfWeek(), []);
  const weekNum = currentWeekId.split('-W')[1] ?? '';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Settimana ${weekNum}`,
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('ManageBlocks')} style={{ marginRight: Spacing.md }}>
          <Text style={{ color: colors.primary, fontSize: FontSize.md, fontWeight: '600' }}>Blocchi</Text>
        </Pressable>
      ),
    });
  }, [navigation, colors, weekNum]);

  // ── Category progress ──

  const categoryProgress = useMemo(
    () => categories.filter((c) => c.targetHoursPerWeek > 0).map((c) => ({ ...c, ...getCategoryHours(c.id) })),
    [categories, getCategoryHours],
  );

  // ── Helpers ──

  const blocksForSlot = (day: DayOfWeek, slot: TimeSlot) =>
    currentPlan.blocks.filter((b) => b.day === day && b.timeSlot === slot);

  const handleBlockPress = (blockId: string, isDone: boolean) => {
    Alert.alert(
      'Azione',
      undefined,
      [
        { text: isDone ? 'Riapri' : 'Completa', onPress: () => toggleBlockDone(blockId) },
        { text: 'Rimuovi', style: 'destructive', onPress: () => unscheduleBlock(blockId) },
        { text: 'Annulla', style: 'cancel' },
      ],
    );
  };

  const handlePickTemplate = (templateId: string) => {
    if (!pickSlot) return;
    scheduleBlock(templateId, pickSlot.day, pickSlot.timeSlot);
    setPickSlot(null);
  };

  // ── Render ──

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Category hours summary */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
        style={styles.catScroll}
      >
        {categoryProgress.map((c) => {
          const pct = c.target > 0 ? Math.min(c.completed / c.target, 1) : 0;
          const isMet = c.completed >= c.target && c.target > 0;
          return (
            <View key={c.id} style={[styles.catCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.catLabel, { color: colors.text }]} numberOfLines={1}>
                {c.emoji} {c.name}
              </Text>
              <View style={[styles.barBg, { backgroundColor: colors.surfaceAlt }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${pct * 100}%`,
                      backgroundColor: isMet ? colors.success : colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.catHours, { color: colors.textSecondary }]}>
                {c.scheduled}/{c.target}h
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Weekly grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridScroll}>
        <View style={styles.gridContainer}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {DAYS_OF_WEEK.map((d) => (
              <View
                key={d}
                style={[
                  styles.dayHeader,
                  d === today && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayHeaderText,
                    { color: d === today ? '#fff' : colors.text },
                  ]}
                >
                  {DAY_SHORT[d]}
                </Text>
              </View>
            ))}
          </View>

          {/* Slot rows */}
          {TIME_SLOTS.map((slot) => (
            <View key={slot} style={styles.slotRow}>
              <Text style={[styles.slotLabel, { color: colors.textTertiary }]}>
                {TIME_SLOT_LABELS[slot]}
              </Text>
              <View style={styles.slotCells}>
                {DAYS_OF_WEEK.map((day) => {
                  const blocks = blocksForSlot(day, slot);
                  return (
                    <View
                      key={day}
                      style={[styles.cell, { borderColor: colors.border }]}
                    >
                      {blocks.map((b) => {
                        const tmpl = b.templateId ? getTemplateById(b.templateId) : undefined;
                        const cat = tmpl ? getCategoryById(tmpl.categoryId) : undefined;
                        return (
                          <Pressable
                            key={b.id}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: cat?.color ?? colors.surfaceAlt,
                                opacity: b.done ? 0.5 : 1,
                              },
                            ]}
                            onPress={() => handleBlockPress(b.id, b.done)}
                          >
                            <Text style={styles.chipText} numberOfLines={2}>
                              {b.done ? '✓ ' : ''}
                              {tmpl?.name ?? '?'}
                            </Text>
                            <Text style={styles.chipDur}>{tmpl?.durationHours}h</Text>
                          </Pressable>
                        );
                      })}
                      {blocks.length === 0 && (
                        <Pressable
                          style={[styles.addBtn, { borderColor: colors.border }]}
                          onPress={() => setPickSlot({ day, timeSlot: slot })}
                        >
                          <Text style={[styles.addBtnText, { color: colors.textTertiary }]}>+</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB → ManageBlocks */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('ManageBlocks')}
      >
        <Text style={styles.fabText}>⚙️</Text>
      </Pressable>

      {/* Template picker modal */}
      <Modal visible={!!pickSlot} transparent animationType="fade" onRequestClose={() => setPickSlot(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Scegli blocco</Text>

            {templates.length === 0 ? (
              <View style={styles.emptyPicker}>
                <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>
                  Crea prima un blocco attività!
                </Text>
                <Pressable
                  style={[styles.emptyPickerBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setPickSlot(null);
                    navigation.navigate('ManageBlocks');
                  }}
                >
                  <Text style={styles.emptyPickerBtnText}>Vai a Blocchi</Text>
                </Pressable>
              </View>
            ) : (
              <FlatList
                data={templates}
                keyExtractor={(t) => t.id}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => {
                  const cat = getCategoryById(item.categoryId);
                  return (
                    <Pressable
                      style={[styles.templateRow, { backgroundColor: colors.surfaceAlt }]}
                      onPress={() => handlePickTemplate(item.id)}
                    >
                      <Text style={[styles.templateLabel, { color: colors.text }]}>
                        {cat?.emoji ?? '📦'} {item.name}
                      </Text>
                      <Text style={[styles.templateDur, { color: colors.textSecondary }]}>
                        {item.durationHours}h
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}

            <Pressable style={styles.cancelBtn} onPress={() => setPickSlot(null)}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Annulla</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Category summary */
  catScroll: { flexGrow: 0 },
  catRow: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, gap: Spacing.sm },
  catCard: {
    width: 140,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  catLabel: { fontSize: FontSize.xs, fontWeight: '600', marginBottom: 4 },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 2 },
  barFill: { height: 6, borderRadius: 3 },
  catHours: { fontSize: FontSize.xs, textAlign: 'right' },

  /* Grid */
  gridScroll: { flex: 1 },
  gridContainer: { paddingHorizontal: Spacing.sm, paddingBottom: 100 },
  dayHeaders: { flexDirection: 'row', marginBottom: Spacing.xs },
  dayHeader: {
    width: COL_WIDTH,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: 4,
  },
  dayHeaderText: { fontSize: FontSize.sm, fontWeight: '700' },

  slotRow: { marginBottom: Spacing.sm },
  slotLabel: { fontSize: FontSize.xs, marginBottom: 2, paddingLeft: 2 },
  slotCells: { flexDirection: 'row' },
  cell: {
    width: COL_WIDTH,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginRight: 4,
    padding: 4,
    justifyContent: 'center',
  },

  /* Chips */
  chip: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginBottom: 2,
  },
  chipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  chipDur: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },

  addBtn: {
    alignSelf: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 20, lineHeight: 22 },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabText: { fontSize: 24 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },

  templateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  templateLabel: { fontSize: FontSize.md, flex: 1 },
  templateDur: { fontSize: FontSize.sm, marginLeft: Spacing.sm },

  emptyPicker: { alignItems: 'center', paddingVertical: Spacing.lg },
  emptyPickerText: { fontSize: FontSize.md, marginBottom: Spacing.md, textAlign: 'center' },
  emptyPickerBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyPickerBtnText: { color: '#fff', fontWeight: '600', fontSize: FontSize.md },

  cancelBtn: { alignItems: 'center', marginTop: Spacing.md },
  cancelText: { fontSize: FontSize.md, fontWeight: '600' },
});
