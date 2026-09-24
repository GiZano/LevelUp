import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';

const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

export default function ManageBlocksScreen({ navigation }: { navigation: any }) {
  const { colors } = useThemeColors();
  const { categories, templates, addTemplate, deleteTemplate, getCategoryById } = usePlanner();

  const [modalVisible, setModalVisible] = useState(false);
  const [blockName, setBlockName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Gestisci Blocchi',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, colors]);

  // Group templates by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof templates>();
    for (const t of templates) {
      const arr = map.get(t.categoryId) ?? [];
      arr.push(t);
      map.set(t.categoryId, arr);
    }
    return map;
  }, [templates]);

  const resetModal = () => {
    setBlockName('');
    setSelectedCategoryId(null);
    setSelectedDuration(1);
    setModalVisible(false);
  };

  const handleCreate = () => {
    const name = blockName.trim();
    if (!name || !selectedCategoryId) return;
    addTemplate(name, selectedCategoryId, selectedDuration);
    resetModal();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Elimina blocco', `Eliminare "${name}"?`, [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => deleteTemplate(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Categorie */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorie</Text>
        {categories.map((c) => (
          <View key={c.id} style={[styles.catRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.catEmoji]}>{c.emoji}</Text>
            <Text style={[styles.catName, { color: colors.text }]} numberOfLines={1}>
              {c.name}
            </Text>
            <Text style={[styles.catTarget, { color: colors.textSecondary }]}>
              {c.targetHoursPerWeek}h/sett
            </Text>
          </View>
        ))}

        {/* Blocchi Attività */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
          Blocchi Attività
        </Text>

        {templates.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nessun blocco creato
          </Text>
        )}

        {Array.from(grouped.entries()).map(([catId, items]) => {
          const cat = getCategoryById(catId);
          return (
            <View key={catId} style={styles.group}>
              <Text style={[styles.groupHeader, { color: colors.textSecondary }]}>
                {cat?.emoji} {cat?.name ?? 'Altro'}
              </Text>
              {items.map((t) => (
                <View key={t.id} style={[styles.blockRow, { backgroundColor: colors.surface }]}>
                  <View style={[styles.blockColor, { backgroundColor: cat?.color ?? colors.primary }]} />
                  <Text style={[styles.blockName, { color: colors.text }]} numberOfLines={1}>
                    {t.name}
                  </Text>
                  <Text style={[styles.blockDur, { color: colors.textSecondary }]}>
                    {t.durationHours}h
                  </Text>
                  <Pressable onPress={() => handleDelete(t.id, t.name)} hitSlop={8}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* FAB – Nuovo Blocco */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Create template modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={resetModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nuovo Blocco</Text>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Nome blocco"
              placeholderTextColor={colors.textSecondary}
              value={blockName}
              onChangeText={setBlockName}
              autoFocus
            />

            {/* Category selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoria</Text>
            <View style={styles.chipsRow}>
              {categories.map((c) => {
                const selected = selectedCategoryId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? c.color : colors.surfaceAlt,
                        borderColor: selected ? c.color : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategoryId(c.id)}
                  >
                    <Text
                      style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}
                      numberOfLines={1}
                    >
                      {c.emoji} {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Duration selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Durata</Text>
            <View style={styles.chipsRow}>
              {DURATION_OPTIONS.map((d) => {
                const selected = selectedDuration === d;
                return (
                  <Pressable
                    key={d}
                    style={[
                      styles.durChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.surfaceAlt,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDuration(d)}
                  >
                    <Text style={[styles.durChipText, { color: selected ? '#fff' : colors.text }]}>
                      {d}h
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={resetModal}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Annulla</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary, opacity: blockName.trim() && selectedCategoryId ? 1 : 0.5 }]}
                onPress={handleCreate}
                disabled={!blockName.trim() || !selectedCategoryId}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Crea</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 100 },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },

  /* Categories */
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  catEmoji: { fontSize: FontSize.lg, marginRight: Spacing.sm },
  catName: { fontSize: FontSize.md, flex: 1, fontWeight: '500' },
  catTarget: { fontSize: FontSize.sm },

  /* Grouped blocks */
  group: { marginBottom: Spacing.md },
  groupHeader: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  blockColor: { width: 4, height: 28, borderRadius: 2, marginRight: Spacing.sm },
  blockName: { fontSize: FontSize.md, flex: 1 },
  blockDur: { fontSize: FontSize.sm, marginRight: Spacing.sm },
  deleteIcon: { fontSize: 18 },

  emptyText: { fontSize: FontSize.md, textAlign: 'center', paddingVertical: Spacing.lg },

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
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '600' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: { borderRadius: BorderRadius.lg, padding: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: FontSize.sm },
  durChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  durChipText: { fontSize: FontSize.sm, fontWeight: '600' },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  modalButtonText: { fontSize: FontSize.md, fontWeight: '600' },
});
