import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Share, Linking } from 'react-native';
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

export default function SettingsScreen() {
  const { colors } = useThemeColors();
  const { locale, changeLocale } = useLocale();
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
          Alert.alert('Success', t('settings.importSuccess') || 'Backup exported successfully!');
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
            const fileUri = res.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const backupData = JSON.parse(fileContent);
            
            if (backupData && backupData.data) {
              const entries = Object.entries(backupData.data) as [string, string][];
              
              const allKeys = await AsyncStorage.getAllKeys();
              const levelUpKeys = allKeys.filter(k => k.startsWith('@levelup/'));
              if (levelUpKeys.length > 0) {
                await AsyncStorage.multiRemove(levelUpKeys);
              }
              
              await AsyncStorage.multiSet(entries);
              Alert.alert(t('settings.importConfirmTitle'), t('settings.importSuccess'));
            } else {
              throw new Error('Invalid format');
            }
          } catch (e) {
            Alert.alert('Error', t('settings.importError'));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings.langTitle')}</Text>
          <View style={styles.langRow}>
            <Pressable 
              style={[styles.langBtn, currentLang === 'en' && { backgroundColor: colors.primary }]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.langText, { color: currentLang === 'en' ? '#fff' : colors.textSecondary }]}>🇬🇧 English</Text>
            </Pressable>
            <Pressable 
              style={[styles.langBtn, currentLang === 'it' && { backgroundColor: colors.primary }]}
              onPress={() => changeLanguage('it')}
            >
              <Text style={[styles.langText, { color: currentLang === 'it' ? '#fff' : colors.textSecondary }]}>🇮🇹 Italiano</Text>
            </Pressable>
          </View>
        </View>

        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.xl }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings.backupTitle')}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('settings.backupDesc')}
          </Text>
          <Pressable style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.md }]} onPress={exportBackup}>
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('settings.exportBtn')}</Text>
          </Pressable>
          <Pressable style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.sm }]} onPress={importBackup}>
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('settings.importBtn')}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.xl }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings.aboutTitle')}</Text>

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
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('settings.starGithub')}</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.sm }]} 
            onPress={() => Linking.openURL('https://github.com/gizano/LevelUp/issues')}
          >
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('settings.submitIssue')}</Text>
          </Pressable>

          <Pressable 
            style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt, marginTop: Spacing.sm, opacity: 0.5 }]} 
            disabled={true}
          >
            <Text style={{color: colors.textSecondary, fontWeight: 'bold'}}>{t('settings.feedbackPlayStore')}</Text>
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
