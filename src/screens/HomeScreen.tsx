import { ScrollView, TouchableOpacity } from 'react-native';
import { t } from "../utils/i18n";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useLayoutEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePeaks } from '../store/PeaksContext';
import { usePlanner } from '../store/PlannerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeStats, isPeakComplete, peakProgress } from '../utils/stats';
import StatsBar from '../components/StatsBar';
import PeakCard from '../components/PeakCard';
import type { RootStackParamList } from '../types/navigation';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeProps) {
  const { colors, isDark } = useThemeColors();
  const { peaks, streak, lastActiveDate, totalCompletedHours, addPeak } = usePeaks();

  const [altModalVisible, setAltModalVisible] = useState(false);
  const [peaksModalVisible, setPeaksModalVisible] = useState(false);
  const [altStats, setAltStats] = useState<{name: string, emoji: string, color: string, hours: number}[]>([]);
  const { categories, templates } = usePlanner();

  const loadAltStats = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const weekKeys = keys.filter((k: string) => k.startsWith('@levelup/week/'));
      const pairs = await AsyncStorage.multiGet(weekKeys);
      
      const catTotals: Record<string, number> = {};
      
      pairs.forEach(([_, value]: [string, string | null]) => {
        if (!value) return;
        const plan = JSON.parse(value);
        plan.blocks?.forEach((b: any) => {
          if (b.done) {
            let catId: string | null = null;
            let duration = 0;
            if (b.isOneOff) {
              catId = b.oneOffCategoryId;
              duration = b.oneOffDuration;
            } else if (b.templateId) {
              const t = templates.find((temp: any) => temp.id === b.templateId);
              if (t) {
                catId = t.categoryId;
                duration = t.durationHours;
              }
            }
            if (catId && duration) {
              catTotals[catId] = (catTotals[catId] || 0) + duration;
            }
          }
        });
      });

      const statsArray = Object.keys(catTotals).map(catId => {
        const cat = categories.find((c: any) => c.id === catId);
        return {
          name: cat ? cat.name : t('home.deletedArchived'),
          emoji: cat ? cat.emoji : '📦',
          color: cat ? cat.color : '#888',
          hours: catTotals[catId]
        };
      });

      const peakStats = peaks.map((p: any) => {
        const completedCamps = p.camps.filter((c: any) => c.done).length;
        return {
          name: p.name,
          emoji: '⛰️',
          color: colors.success || '#10B981',
          hours: completedCamps * 100
        };
      }).filter((p: any) => p.hours > 0);

      const allStats = [...statsArray, ...peakStats].sort((a,b) => b.hours - a.hours);
      setAltStats(allStats);
      setAltModalVisible(true);
    } catch(e) {
      console.log(e);
    }
  };


  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'LevelUp',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, colors]);

  const stats = computeStats(peaks, streak, lastActiveDate, totalCompletedHours);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPeak(trimmed, description.trim() || undefined);
    setName('');
    setDescription('');
    setModalVisible(false);
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatsBar stats={stats} onAltPress={loadAltStats} onPeaksPress={() => setPeaksModalVisible(true)} />

      <FlatList
        data={peaks.filter((p: any) => !isPeakComplete(p))}
        keyExtractor={(item) => item.id}
        contentContainerStyle={peaks.filter((p: any) => !isPeakComplete(p)).length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏔️</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aggiungi la tua prima vetta!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PeakCard
            peak={item}
            onPress={() => navigation.navigate('PeakDetail', { peakId: item.id })}
          />
        )}
      />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      
      
      {/* Peaks Stats Modal */}
      <Modal visible={peaksModalVisible} transparent animationType="slide" onRequestClose={() => setPeaksModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('home.peaksHistoryTitle')}</Text>
            <ScrollView style={{marginVertical: 16}}>
              {peaks.length === 0 && <Text style={{color: colors.textSecondary}}>{t('home.noHistoricalData')}</Text>}
              
              <Text style={{color: colors.text, fontWeight: 'bold', marginTop: Spacing.sm, marginBottom: Spacing.xs}}>{t('home.completed')}</Text>
              {peaks.filter((p: any) => isPeakComplete(p)).map((p: any) => (
                <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, backgroundColor: colors.surfaceAlt, borderRadius: 8 }}>
                  <Text style={{ fontSize: 24, marginRight: 8 }}>⛰️</Text>
                  <Text style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{p.name}</Text>
                  <Text style={{ color: colors.success || '#10B981', fontWeight: '900', fontSize: 16 }}>100%</Text>
                </View>
              ))}
              {peaks.filter((p: any) => isPeakComplete(p)).length === 0 && <Text style={{color: colors.textSecondary, fontSize: 12}}>{t('home.noCompletedPeaks')}</Text>}

              <Text style={{color: colors.text, fontWeight: 'bold', marginTop: Spacing.md, marginBottom: Spacing.xs}}>{t('home.inProgress')}</Text>
              {peaks.filter((p: any) => !isPeakComplete(p)).map((p: any) => {
                const perc = Math.round(peakProgress(p) * 100);
                return (
                  <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, backgroundColor: colors.surfaceAlt, borderRadius: 8 }}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>⛰️</Text>
                    <Text style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{p.name}</Text>
                    <Text style={{ color: colors.accent || '#3B82F6', fontWeight: '900', fontSize: 16 }}>{perc}%</Text>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary, alignItems: 'center' }]} onPress={() => setPeaksModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>{t('home.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Altitude Stats Modal */}
      <Modal visible={altModalVisible} transparent animationType="slide" onRequestClose={() => setAltModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('home.altHistoryTitle')}</Text>
            <ScrollView style={{marginVertical: 16}}>
              {altStats.length === 0 && <Text style={{color: colors.textSecondary}}>Nessun dato storico.</Text>}
              {altStats.map((s, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, backgroundColor: colors.surfaceAlt, borderRadius: 8 }}>
                  <Text style={{ fontSize: 24, marginRight: 8 }}>{s.emoji}</Text>
                  <Text style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{s.name}</Text>
                  <Text style={{ color: s.color, fontWeight: '900', fontSize: 16 }}>{s.hours}m</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary, alignItems: 'center' }]} onPress={() => setAltModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Peak Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('home.newPeak')}</Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Nome della vetta"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <TextInput
              style={[
                styles.input,
                styles.inputDescription,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder={t('home.descOptional')}
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                  Annulla
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreate}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>{t('home.createPeak')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
  },
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
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
  inputDescription: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
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
  modalButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
