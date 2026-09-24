import { t } from "../utils/i18n";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import { peakProgress, isPeakComplete } from '../utils/stats';
import CampItem from '../components/CampItem';
import MountainSvg from '../components/MountainSvg';
import type { RootStackParamList } from '../types/navigation';

type PeakDetailProps = NativeStackScreenProps<RootStackParamList, 'PeakDetail'>;

export default function PeakDetailScreen({ navigation, route }: PeakDetailProps) {
  const { peakId } = route.params;
  const { colors } = useThemeColors();
  const { peaks, addCamp, toggleCamp, deleteCamp, deletePeak } = usePeaks();

  const [campName, setCampName] = useState('');

  const peak = peaks.find((p) => p.id === peakId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: peak?.name ?? 'Vetta',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerRight: () => (
        <Pressable onPress={handleDeletePeak} hitSlop={8}>
          <Text style={{ fontSize: 22 }}>🗑️</Text>
        </Pressable>
      ),
    });
  }, [navigation, colors, peak?.name]);

  if (!peak) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, fontSize: FontSize.md }}>
          Vetta non trovata
        </Text>
      </View>
    );
  }

  const progress = peakProgress(peak);
  const complete = isPeakComplete(peak);
  const totalCamps = peak.camps.length;
  const doneCamps = peak.camps.filter((c) => c.done).length;
  const pct = totalCamps > 0 ? Math.round((doneCamps / totalCamps) * 100) : 0;

  const handleDeletePeak = () => {
    Alert.alert('Elimina vetta', `Vuoi eliminare "${peak.name}"?`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deletePeak(peakId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAddCamp = () => {
    const trimmed = campName.trim();
    if (!trimmed) return;
    addCamp(peakId, trimmed);
    setCampName('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={peak.camps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.mountainWrapper}>
              <MountainSvg progress={progress} isComplete={complete} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{peak.name}</Text>

            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {doneCamps}/{totalCamps} campi • {pct}%
            </Text>

            {complete && (
              <View style={[styles.banner, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.bannerText, { color: colors.primary }]}>
                  🏁 Vetta conquistata!
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CampItem
            camp={item}
            onToggle={() => toggleCamp(peakId, item.id)}
            onDelete={() => deleteCamp(peakId, item.id)}
          />
        )}
      />

      {/* Bottom input bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Nuovo campo..."
          placeholderTextColor={colors.textSecondary}
          value={campName}
          onChangeText={setCampName}
          onSubmitEditing={handleAddCamp}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddCamp}
        >
          <Text style={styles.addButtonText}>Aggiungi</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  mountainWrapper: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  progressText: {
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
  banner: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  bannerText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
  },
  addButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
