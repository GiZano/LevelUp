import { t } from "../utils/i18n";
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';
import { usePeaks } from '../store/PeaksContext';
import { getTodayDayOfWeek } from '../types/weekUtils';
import { DAY_LABELS } from '../types';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '☀️ ' + (t('today.greetingMorning') || 'Buongiorno');
  if (hour < 17) return '🌤️ ' + (t('today.greetingAfternoon') || 'Buon pomeriggio');
  if (hour < 21) return '🌅 ' + (t('today.greetingEvening') || 'Buonasera');
  return '🌙 ' + (t('today.greetingNight') || 'Buonanotte');
};

export default function TodayScreen({ navigation }: any) {
  const { colors } = useThemeColors();
  const { currentPlan, templates, getCategoryById, getTemplateById, toggleBlockDone } = usePlanner();
  const { addCompletedHours } = usePeaks();
  const today = getTodayDayOfWeek();

  useLayoutEffect(() => {
    const d = new Date();
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
    navigation.setOptions({
      title: t('today.title') + ': ' + t('days.' + today).substring(0,3),
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, colors, today]);

  const todayBlocks = currentPlan.blocks
    .filter(b => b.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleToggle = (block: any) => {
    const template = templates.find(t => t.id === block.templateId);
    let duration = 0;
    if (block.isOneOff) {
      duration = block.oneOffDuration || 0;
    } else {
      duration = block.customDuration ?? (template?.durationHours || 0);
    }
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleBlockDone(block.id);
    if (!block.done) addCompletedHours(duration);
    else addCompletedHours(-duration);
  };

  let totalScheduled = 0;
  let totalCompleted = 0;

  todayBlocks.forEach(b => {
    const template = templates.find(t => t.id === b.templateId);
    const duration = b.isOneOff ? (b.oneOffDuration || 0) : (b.customDuration ?? (template?.durationHours || 0));
    totalScheduled += duration;
    if (b.done) totalCompleted += duration;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.slotSection}>
          <Text style={[styles.slotTitle, { color: colors.textSecondary }]}>{t('today.yourDay')}</Text>
          
          {todayBlocks.length === 0 ? (
            <Text style={{color: colors.textTertiary, fontStyle: 'italic', marginLeft: Spacing.md, marginTop: Spacing.sm}}>
              Nessun blocco per oggi. Vai nel Planner!
            </Text>
          ) : (
            todayBlocks.map(b => {
              let name, catColor, catEmoji, duration;
              if (b.isOneOff) {
                name = b.oneOffName;
                duration = b.oneOffDuration;
                const cat = getCategoryById(b.oneOffCategoryId!);
                catColor = cat?.color || colors.border;
                catEmoji = cat?.emoji || '';
              } else {
                const tmpl = b.templateId ? getTemplateById(b.templateId) : undefined;
                const cat = tmpl ? getCategoryById(tmpl.categoryId) : undefined;
                name = tmpl?.name || 'Sconosciuto';
                duration = b.customDuration ?? (tmpl?.durationHours || 0);
                catColor = cat?.color || colors.border;
                catEmoji = cat?.emoji || '';
              }

              return (
                <View key={b.id} style={{marginBottom: Spacing.md}}>
                  <Text style={{fontSize: 12, color: colors.textSecondary, marginBottom: 4, marginLeft: 4, fontWeight: '600'}}>
                    {b.startTime}
                  </Text>
                  <Pressable 
                    onPress={() => handleToggle(b)}
                    style={[
                      styles.blockItem, 
                      { backgroundColor: colors.surface, borderLeftColor: catColor },
                      b.done && { opacity: 0.5 }
                    ]}
                  >
                    <View style={[styles.checkbox, { borderColor: b.done ? colors.success : colors.textTertiary, backgroundColor: b.done ? colors.success : 'transparent' }]}>
                      {b.done && <MaterialCommunityIcons name="check-bold" size={12} color="#fff" />}
                    </View>
                    
                    <MaterialCommunityIcons name={catEmoji as any} size={24} color={catColor} style={{marginRight: Spacing.sm}} />
                    
                    <View style={{flex: 1, flexDirection: 'column'}}>
                      <Text style={[styles.blockName, { color: colors.text }, b.done && {textDecorationLine: 'line-through'}]}>{name}</Text>
                      {!!b.description && (
                        <Text style={{fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2}}>
                          {b.description}
                        </Text>
                      )}
                    </View>
                    
                    <Text style={{color: colors.textSecondary}}>{duration}h</Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Footer summary */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.footerHeader}>
          <Text style={{color: colors.text, fontWeight: 'bold'}}>{t('today.todayProgress')}</Text>
          <Text style={{color: colors.textSecondary}}>{totalCompleted} / {totalScheduled}h</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: totalScheduled > 0 ? `${(totalCompleted / totalScheduled) * 100}%` : '0%' }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  slotSection: { marginBottom: Spacing.lg },
  slotTitle: { fontSize: FontSize.xl, fontWeight: 'bold', marginBottom: Spacing.md },
  blockItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, borderLeftWidth: 4 },
  checkbox: { width: 20, height: 20, borderRadius: BorderRadius.full, borderWidth: 2, marginRight: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  blockName: { fontSize: FontSize.md, fontWeight: '600' },
  footer: { padding: Spacing.md, borderTopWidth: 1 },
  footerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressBar: { height: 8, borderRadius: BorderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: BorderRadius.full }
});
