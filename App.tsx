import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.emoji]}>🏔️</Text>
      <Text style={[styles.title, isDark && styles.textDark]}>LevelUp</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        Conquista le tue vette.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1,
  },
  textDark: {
    color: '#F1F5F9',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  subtitleDark: {
    color: '#94A3B8',
  },
});
