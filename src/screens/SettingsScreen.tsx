import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Share, Linking, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import i18n, { t } from '../utils/i18n';
import { useLocale } from '../store/LocaleContext';
import { usePeaks } from '../store/PeaksContext';
import { usePlanner } from '../store/PlannerContext';

export default function SettingsScreen() {
  const { colors } = useThemeColors();
  const [isImporting, setIsImporting] = useState(false);
  const { locale, changeLocale } = useLocale();
  const { refreshData: refreshPeaks } = usePeaks();
  const { refreshData: refreshPlanner } = usePlanner();
  const currentLang = locale.startsWith('it') ? 'it' : 'en';

  const changeLanguage = async (lang: string) => {
    await changeLocale(lang);
  };

  
  
  const exportBackup = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const levelUpKeys = keys.filter(k => k.startsWith('@levelup/'));
      const pairs = await AsyncStorage.multiGet(levelUpKeys);
      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: Object.fromEntries(pairs)
      };
      
      const jsonStr = JSON.stringify(backupData, null, 2);
      
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, 'levelup_backup.json', 'application/json');
          await FileSystem.writeAsStringAsync(uri, jsonStr, { encoding: FileSystem.EncodingType.UTF8 });
          Alert.alert('Success', 'Backup exported successfully!');
          return;
        }
      }

      // Fallback to sharing for iOS or if user cancels SAF on Android
      const fileUri = FileSystem.documentDirectory + 'levelup_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, jsonStr, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'LevelUp Backup' });

    } catch (e) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  
  const importBackup = async () => {
    Alert.alert(t('settings.importConfirmTitle'), t('settings.importConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'] });
            if (res.canceled || !res.assets || res.assets.length === 0) return;
            setIsImporting(true);
            await new Promise(r => setTimeout(r, 1000));
            const fileUri = res.assets[0].uri;
                        let fileContent = '';
            try {
              fileContent = await FileSystem.readAsStringAsync(fileUri);
            } catch (readErr) {
              const response = await fetch(fileUri);
              fileContent = await response.text();
            }
            const backupData = JSON.parse(fileContent);
            
            if (backupData && backupData.data) {
              const entries = Object.entries(backupData.data).filter(([_, v]) => v !== null) as [string, string][];
              
              const allKeys = await AsyncStorage.getAllKeys();
              const levelUpKeys = allKeys.filter(k => k.startsWith('@levelup/'));
              if (levelUpKeys.length > 0) {
                await AsyncStorage.multiRemove(levelUpKeys);
              }
              
              await AsyncStorage.multiSet(entries);
              await refreshPeaks();
              await refreshPlanner();
              Alert.alert(t('settings.importConfirmTitle'), t('settings.importSuccess') || 'Import successful!');
            } else {
              throw new Error('Invalid format');
            }
          } catch (e) {
            Alert.alert('Error', (t('settings.importError') || 'Failed to import data') + ': ' + String(e));
          } finally {
            setIsImporting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}><MaterialCommunityIcons name="translate" size={24} color={colors.primary} style={{marginRight: 8}} /><Text style={[styles.title, { color: colors.text, marginBottom: 0 }]}>{t('settings.langTitle')}</Text></View>
          <View style={styles.langRow}>
            <Pressable 
              style={[styles.langBtn, currentLang === 'en' && { backgroundColor: colors.primary }]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.langText, { color: currentLang === 'en' ? '#fff' : colors.textSecondary }]}>English</Text>
            </Pressable>
            <Pressable 
              style={[styles.langBtn, currentLang === 'it' && { backgroundColor: colors.primary }]}
              onPress={() => changeLanguage('it')}
            >
              <Text style={[styles.langText, { color: currentLang === 'it' ? '#fff' : colors.textSecondary }]}>Italiano</Text>
            </Pressable>
          </View>
        </View>

        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.xl }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}><MaterialCommunityIcons name="content-save-outline" size={24} color={colors.primary} style={{marginRight: 8}} /><Text style={[styles.title, { color: colors.text, marginBottom: 0 }]}>{t('settings.backupTitle')}</Text></View>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('settings.backupDesc')}
          </Text>
          <Pressable style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.md }]} onPress={exportBackup}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><MaterialCommunityIcons name="export" size={20} color={colors.primary} style={{marginRight: 8}} /><Text style={[{fontWeight: 'bold'}, {color: colors.text}]}>{t('settings.exportBtn')}</Text></View>
          </Pressable>
          <Pressable style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.sm, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} onPress={importBackup} disabled={isImporting}>
            {isImporting ? (
              <ActivityIndicator color={colors.primary} style={{marginRight: 8}} />
            ) : null}
            {isImporting ? <Text style={[{fontWeight: 'bold'}, {color: colors.text}]}>{t('settings.importing')}</Text> : <View style={{flexDirection: 'row', alignItems: 'center'}}><MaterialCommunityIcons name="import" size={20} color={colors.primary} style={{marginRight: 8}} /><Text style={[{fontWeight: 'bold'}, {color: colors.text}]}>{t('settings.importBtn')}</Text></View>}
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.xl }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}><MaterialCommunityIcons name="information-outline" size={24} color={colors.primary} style={{marginRight: 8}} /><Text style={[styles.title, { color: colors.text, marginBottom: 0 }]}>{t('settings.aboutTitle')}</Text></View>

          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('settings.aboutDesc1')}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {t('settings.aboutDesc2')}
          </Text>
          
          <Pressable 
            style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt }]} 
            onPress={() => Linking.openURL('https://github.com/gizano/LevelUp')}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}><MaterialCommunityIcons name="github" size={20} color={colors.primary} style={{marginRight: 8}} /><Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('settings.starGithub')}</Text></View>
          </Pressable>
          
          <Pressable 
            style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.sm }]} 
            onPress={() => Linking.openURL('https://github.com/gizano/LevelUp/issues')}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}><MaterialCommunityIcons name="bug" size={20} color={colors.primary} style={{marginRight: 8}} /><Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('settings.submitIssue')}</Text></View>
          </Pressable>

          <Pressable 
            style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.sm, opacity: 0.5 }]} 
            disabled={true}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}><MaterialCommunityIcons name="google-play" size={20} color={colors.textSecondary} style={{marginRight: 8}} /><Text style={{color: colors.textSecondary, fontWeight: 'bold'}}>{t('settings.feedbackPlayStore')}</Text></View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md },
  card: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
  title: { fontSize: FontSize.lg, fontWeight: 'bold', marginBottom: Spacing.md },
  body: { fontSize: FontSize.md, lineHeight: 22 },
  langRow: { flexDirection: 'row', gap: Spacing.md },
  langBtn: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  langText: { fontSize: FontSize.md, fontWeight: 'bold' },
  linkBtn: { padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.lg }
});
