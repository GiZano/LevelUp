import { t } from "../utils/i18n";
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Alert, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import { usePlanner } from '../store/PlannerContext';
import { usePeaks } from '../store/PeaksContext';
import CategoryProgress from '../components/CategoryProgress';
import BlockChip from '../components/BlockChip';
import { DAYS_OF_WEEK, DAY_LABELS, DayOfWeek } from '../types';
import { getDatesOfWeek, getNextWeekId, getPrevWeekId, getCurrentWeekId, getTodayDayOfWeek } from '../types/weekUtils';

export default function PlannerScreen({ navigation }: any) {
  const { colors, isDark } = useThemeColors();
  const { currentWeekId, currentPlan, categories, templates, scheduleBlock, scheduleOneOffBlock, unscheduleBlock, toggleBlockDone, updateBlockDescription, getTemplateById, getCategoryById, getCategoryHours, changeWeek, copyPreviousWeek } = usePlanner();
  const { addCompletedHours } = usePeaks();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [editBlockId, setEditBlockId] = useState<string | null>(null);
  const [editBlockDesc, setEditBlockDesc] = useState('');
  const editBlock = editBlockId ? currentPlan.blocks.find(b => b.id === editBlockId) : null;
  const isDone = editBlock?.done;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('tabs.planner'),
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    });
  }, [navigation, colors]);

  const handleBlockPress = (block: any) => {
    setEditBlockId(block.id);
    setEditBlockDesc(block.description || '');
  };

  const saveBlockDesc = () => {
    if (editBlockId) {
      updateBlockDescription(editBlockId, editBlockDesc.trim());
      setEditBlockId(null);
    }
  };

  const handleDeleteBlock = () => {
    if (editBlockId) {
      unscheduleBlock(editBlockId);
      setEditBlockId(null);
    }
  };

  const handleToggleBlock = () => {
    if (editBlockId) {
      const block = currentPlan.blocks.find(b => b.id === editBlockId);
      if (block) {
        let duration = 0;
        if (block.isOneOff) duration = block.oneOffDuration || 0;
        else {
          const template = getTemplateById(block.templateId!);
          duration = template?.durationHours || 0;
        }
        toggleBlockDone(block.id);
        if (!block.done) addCompletedHours(duration);
        else addCompletedHours(-duration);
      }
      setEditBlockId(null);
    }
  };

  const handleAddPress = (day: DayOfWeek) => {
    setSelectedDay(day);

    const dayBlocks = currentPlan.blocks.filter(b => b.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (dayBlocks.length > 0) {
      const lastBlock = dayBlocks[dayBlocks.length - 1];
      let dur = 0;
      if (lastBlock.isOneOff && lastBlock.oneOffDuration) dur = lastBlock.oneOffDuration;
      else if (lastBlock.templateId) dur = getTemplateById(lastBlock.templateId)?.durationHours || 0;
      
      const [hh, mm] = lastBlock.startTime.split(':').map(Number);
      const startMs = new Date().setHours(hh, mm, 0, 0);
      const endMs = startMs + dur * 60 * 60 * 1000;
      setStartTime(new Date(endMs));
    } else {
      setStartTime(new Date(new Date().setHours(9, 0, 0, 0)));
    }

    setModalVisible(true);
  };

  const formatTime = (d: Date) => {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handlePickTemplate = (templateId: string) => {
    if (selectedDay) {
      scheduleBlock(templateId, selectedDay, formatTime(startTime));
    }
    setModalVisible(false);
    setSelectedDay(null);
  };

  const datesOfWeek = getDatesOfWeek(currentWeekId);
  const realCurrentWeekId = getCurrentWeekId();
  const todayDay = getTodayDayOfWeek();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Categorie summary */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs}}>
          <Pressable onPress={() => changeWeek(getPrevWeekId(currentWeekId))} style={{padding: Spacing.sm}}>
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('planner.prev')}</Text>
          </Pressable>
          
          <View style={{ alignItems: 'center' }}>
            {currentWeekId === realCurrentWeekId && (
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>
                {t('planner.current')}
              </Text>
            )}
            <Text style={[styles.weekText, { color: colors.textSecondary, marginBottom: 0 }]}>
              {t('planner.week')} {currentWeekId.split('-').reverse().join('-')}
            </Text>
          </View>

          <Pressable onPress={() => changeWeek(getNextWeekId(currentWeekId))} style={{padding: Spacing.sm}}>
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('planner.next')}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryList}>
          {categories.map((cat) => {
            const hours = getCategoryHours(cat.id);
            if (hours.scheduled === 0 && cat.targetHoursPerWeek === 0) return null;
            return (
              <View key={cat.id} style={{ marginRight: Spacing.sm }}>
                <CategoryProgress
                  emoji={cat.emoji}
                  name={cat.name}
                  scheduled={hours.scheduled}
                  completed={hours.completed}
                  target={cat.targetHoursPerWeek}
                  color={cat.color}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid */}
      {currentPlan.blocks.length === 0 && (
        <View style={{padding: Spacing.md, alignItems: 'center'}}>
          <Text style={{color: colors.textSecondary, marginBottom: Spacing.sm}}>{t('planner.emptyWeek')}</Text>
          <Pressable 
            onPress={() => {
              Alert.alert(t('planner.copyWeekTitle'), t('planner.copyWeekMsg'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('planner.copyWeekTitle'), onPress: copyPreviousWeek }
              ])
            }}
            style={[styles.btn, {backgroundColor: colors.primary}]}
          >
            <Text style={{color: '#fff', fontWeight: 'bold'}}>{t('planner.copyBtn')}</Text>
          </Pressable>
        </View>
      )}

      <ScrollView style={styles.gridScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.grid}>
            {DAYS_OF_WEEK.map((day, idx) => {
              const blocks = currentPlan.blocks.filter(b => b.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
              const dateObj = datesOfWeek[idx];
              const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
              const isToday = currentWeekId === realCurrentWeekId && day === todayDay;
              
              return (
                <View key={day} style={[
                  styles.dayCol, 
                  { borderRightColor: colors.border },
                  isToday && { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }
                ]}>
                  <Text style={[
                    styles.dayHeader, 
                    { color: isToday ? colors.primary : colors.text },
                    isToday && { fontWeight: '900' }
                  ]}>
                    {DAY_LABELS[day]} {dateStr}
                  </Text>
                  
                  <View style={styles.slotContainer}>
                    {blocks.map(block => {
                      let name, catColor, catEmoji, duration;
                      if (block.isOneOff) {
                        name = block.oneOffName!;
                        duration = block.oneOffDuration!;
                        const cat = getCategoryById(block.oneOffCategoryId!);
                        catColor = cat?.color || colors.primary;
                        catEmoji = cat?.emoji || '🏷️';
                      } else {
                        const tmpl = block.templateId ? getTemplateById(block.templateId) : undefined;
                        const cat = tmpl ? getCategoryById(tmpl.categoryId) : undefined;
                        name = tmpl?.name || 'Sconosciuto';
                        duration = tmpl?.durationHours || 0;
                        catColor = cat?.color || colors.primary;
                        catEmoji = cat?.emoji || '🏷️';
                      }
                      
                      return (
                        <View key={block.id} style={{marginBottom: Spacing.sm}}>
                          <Text style={{fontSize: 10, color: colors.textTertiary, marginBottom: 2}}>{block.startTime}</Text>
                          <BlockChip
                            name={name}
                            categoryColor={catColor}
                            categoryEmoji={catEmoji}
                            durationHours={duration}
                            done={block.done}
                            onPress={() => handleBlockPress(block)}
                          />
                        </View>
                      );
                    })}
                    <Pressable 
                      style={[styles.addSlotBtn, { backgroundColor: colors.surfaceAlt }]} 
                      onPress={() => handleAddPress(day)}
                    >
                      <Text style={{color: colors.textSecondary}}>+</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Edit Block Modal */}
      <Modal visible={!!editBlockId} transparent animationType="fade" onRequestClose={() => setEditBlockId(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Block Details</Text>
            
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4, color: colors.textSecondary }}>Specific Task / Description</Text>
            <TextInput
              style={[
                { borderWidth: 1, borderRadius: 12, padding: 8, fontSize: 16, marginBottom: 16 },
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="e.g. Chapter 4 exercises"
              placeholderTextColor={colors.textSecondary}
              value={editBlockDesc}
              onChangeText={setEditBlockDesc}
            />
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 16}}>
              <View style={{flexDirection: 'row', gap: 8}}>
                <Pressable style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.danger }} onPress={handleDeleteBlock}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{t('common.delete')}</Text>
                </Pressable>
                <Pressable style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: isDone ? colors.danger : colors.success }} onPress={handleToggleBlock}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{isDone ? 'X Toggle' : '✓ Toggle'}</Text>
                </Pressable>
              </View>
              <View style={{flexDirection: 'row', gap: 8}}>
                <Pressable style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.background }} onPress={() => setEditBlockId(null)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.primary }} onPress={saveBlockDesc}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{t('common.save')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Template Picker Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('planner.scheduleBlock')}</Text>
            
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md}}>
              <Text style={{color: colors.text, fontSize: FontSize.md, marginRight: Spacing.sm}}>{t('planner.startTime')}</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onValueChange={(_, date) => { if (date) setStartTime(date); }}
                />
              ) : (
                <>
                  <Pressable 
                    onPress={() => setShowTimePicker(true)}
                    style={{padding: Spacing.sm, backgroundColor: colors.background, borderRadius: BorderRadius.sm}}
                  >
                    <Text style={{color: colors.text, fontSize: FontSize.md}}>{formatTime(startTime)}</Text>
                  </Pressable>
                  {showTimePicker && (
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onValueChange={(_, date) => {
                        setShowTimePicker(false);
                        if (date) setStartTime(date);
                      }}
                      onDismiss={() => setShowTimePicker(false)}
                    />
                  )}
                </>
              )}
            </View>

            {templates.length === 0 ? (
              <View style={{padding: Spacing.lg, alignItems: 'center'}}>
                <Text style={{color: colors.textSecondary, marginBottom: Spacing.md}}>{t('planner.createFirst')}</Text>
                <Pressable onPress={() => { setModalVisible(false); navigation.navigate('ManageBlocks'); }} style={[styles.btn, {backgroundColor: colors.primary}]}>
                  <Text style={{color: '#fff'}}>{t('planner.goToManage')}</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView style={{maxHeight: 300}}>
                {templates.map(t => {
                  const cat = getCategoryById(t.categoryId);
                  return (
                    <Pressable key={t.id} style={[styles.templateItem, {borderBottomColor: colors.border}]} onPress={() => handlePickTemplate(t.id)}>
                      <Text style={{fontSize: FontSize.lg, marginRight: Spacing.sm}}>{cat?.emoji}</Text>
                      <View style={{flex: 1}}>
                        <Text style={{color: colors.text, fontWeight: '600'}}>{t.name}</Text>
                      </View>
                      <Text style={{color: colors.textSecondary}}>{t.durationHours}h</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            <Pressable onPress={() => setModalVisible(false)} style={{padding: Spacing.md, alignItems: 'center'}}>
              <Text style={{color: colors.textSecondary}}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryContainer: { padding: Spacing.md, borderBottomWidth: 1 },
  weekText: { fontSize: FontSize.sm, marginBottom: Spacing.xs },
  summaryList: { paddingBottom: Spacing.xs },
  gridScroll: { flex: 1 },
  grid: { flexDirection: 'row', paddingVertical: Spacing.md },
  dayCol: { width: 140, borderRightWidth: 1, paddingHorizontal: Spacing.xs },
  dayHeader: { textAlign: 'center', fontWeight: 'bold', marginBottom: Spacing.sm },
  slotContainer: { minHeight: 120 },
  addSlotBtn: { alignItems: 'center', justifyContent: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, marginTop: Spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, padding: Spacing.lg, paddingBottom: 40 },
  modalTitle: { fontSize: FontSize.xl, fontWeight: 'bold', marginBottom: Spacing.md },
  templateItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  btn: { padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' }
});
