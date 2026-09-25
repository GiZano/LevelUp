import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../utils/useThemeColors';
import { Spacing, FontSize, BorderRadius } from '../utils/theme';
import i18n, { t } from '../utils/i18n';

export default function SettingsScreen() {
  const { colors } = useThemeColors();
  const [currentLang, setCurrentLang] = useState(i18n.locale.startsWith('it') ? 'it' : 'en');

  const changeLanguage = async (lang: string) => {
    i18n.locale = lang;
    setCurrentLang(lang);
    await AsyncStorage.setItem('app_language', lang);
    Alert.alert(
      lang === 'it' ? 'Lingua cambiata' : 'Language changed',
      lang === 'it' ? 'Riavvia l\'app per applicare le modifiche su tutte le schermate.' : 'Please restart the app to apply changes across all screens.'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>🌐 Language / Lingua</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>ℹ️ About LevelUp</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            LevelUp was born from a simple need: eliminating decision fatigue in free time. The mountain climbing metaphor helps tracking long-term goals (Peaks) and breaking them down into actionable steps (Camps).
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            This app is 100% Open Source and built by developers, for everyone.
          </Text>
          
          <Pressable style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt }]} onPress={() => {}}>
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>⭐ Star on GitHub</Text>
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
