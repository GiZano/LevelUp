import { useColorScheme } from 'react-native';
import { Colors } from './theme';

/** Hook che ritorna la palette corretta in base al tema di sistema */
export function useThemeColors() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? Colors.dark : Colors.light, isDark };
}
