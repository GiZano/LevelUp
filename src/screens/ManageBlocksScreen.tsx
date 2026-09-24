import { t } from "../utils/i18n";
import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';

const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 8];

export default function ManageBlocksScreen({ navigation }: any) {
  const { colors } = useThemeColors();
  const { categories, templates, addTemplate, deleteTemplate, getCategoryById, editCategory, addCategory } = usePlanner();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('manage.title'),
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, colors]);

  const [modalVisible, setModalVisible] = useState(false);
  const [blockName, setBlockName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  const [catModalVisible, setCatModalVisible] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [catTargetHours, setCatTargetHours] = useState('');

  const resetModal = () => {
    setBlockName('');
    setSelectedCategoryId(null);
    setSelectedDuration(1);
    setModalVisible(false);
  };

  const handleCreateBlock = () => {
    if (blockName.trim() && selectedCategoryId) {
      addTemplate(blockName.trim(), selectedCategoryId, selectedDuration);
      resetModal();
    }
  };

  const handleDeleteBlock = (id: string, name: string) => {
    Alert.alert(t('manage.deleteBlockTitle'), `Sei sicuro di voler eliminare "${name}"?`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteTemplate(id) },
    ]);
  };

  const openEditCategory = (cat: any) => {
    setEditCatId(cat.id);
    setCatTargetHours(String(cat.targetHoursPerWeek));
    setCatModalVisible(true);
  };

  const saveCategory = () => {
    const hours = parseInt(catTargetHours, 10);
    if (!isNaN(hours) && editCatId) {
      editCategory(editCatId, hours);
    }
    setCatModalVisible(false);
  };

  // Raggruppa template per categoria
  const templatesByCategory = categories.map((c) => ({
    categoryId: c.id,
    items: templates.filter((t) => t.categoryId === c.id),
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Sezione Categorie */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm}}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorie</Text>
        </View>
        <Text style={{color: colors.textSecondary, fontSize: 12, marginBottom: Spacing.sm}}>Tocca una categoria per modificarne le ore target.</Text>
        
        {categories.map((c) => (
          <Pressable key={c.id} style={[styles.catRow, { backgroundColor: colors.surface }]} onPress={() => openEditCategory(c)}>
            <Text style={styles.catEmoji}>{c.emoji}</Text>
            <Text style={[styles.catName, { color: colors.text }]}>{c.name}</Text>
            <Text style={[styles.catTarget, { color: colors.textSecondary }]}>
              {c.targetHoursPerWeek}h target ✎
            </Text>
          </Pressable>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>Blocchi Attività</Text>

        {templates.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nessun blocco definito. Creane uno usando il tasto in basso.
          </Text>
        )}

        {templatesByCategory.map(({ categoryId, items }) => {
          if (items.length === 0) return null;
          const cat = getCategoryById(categoryId);
          return (
            <View key={categoryId} style={styles.group}>
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
                  <Pressable onPress={() => handleDeleteBlock(t.id, t.name)} hitSlop={8}>
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

      {/* Modal Categoria */}
      <Modal visible={catModalVisible} transparent animationType="fade" onRequestClose={() => setCatModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Modifica Categoria</Text>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Target ore settimanali (es. 20)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              keyboardType="numeric"
              value={catTargetHours}
              onChangeText={setCatTargetHours}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, { backgroundColor: colors.background }]} onPress={() => setCatModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Annulla</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={saveCategory}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Salva</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Nuovo Blocco */}
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
            />

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
                    <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]} numberOfLines={1}>
                      {c.emoji} {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

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
                    <Text style={[styles.durChipText, { color: selected ? '#fff' : colors.text }]}>{d}h</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, { backgroundColor: colors.background }]} onPress={resetModal}>
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Annulla</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary, opacity: blockName.trim() && selectedCategoryId ? 1 : 0.5 }]}
                onPress={handleCreateBlock}
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
  catRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xs },
  catEmoji: { fontSize: FontSize.lg, marginRight: Spacing.sm },
  catName: { fontSize: FontSize.md, flex: 1, fontWeight: '500' },
  catTarget: { fontSize: FontSize.sm },
  group: { marginBottom: Spacing.md },
  groupHeader: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  blockRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.xs },
  blockColor: { width: 4, height: 28, borderRadius: 2, marginRight: Spacing.sm },
  blockName: { fontSize: FontSize.md, flex: 1 },
  blockDur: { fontSize: FontSize.sm, marginRight: Spacing.sm },
  deleteIcon: { fontSize: 18 },
  emptyText: { fontSize: FontSize.md, textAlign: 'center', paddingVertical: Spacing.lg },
  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.lg, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.27, shadowRadius: 4.65 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.lg },
  modalContent: { borderRadius: BorderRadius.lg, padding: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.md },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.sm, fontSize: FontSize.md, marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  chipText: { fontSize: FontSize.sm },
  durChip: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1 },
  durChipText: { fontSize: FontSize.sm, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.md },
  modalButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md },
  modalButtonText: { fontSize: FontSize.md, fontWeight: '600' }
});
