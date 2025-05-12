import { useTheme } from '@/lib/context/ThemeContext';
import { ColorSchemeName } from 'react-native';

// Updated hook that uses our theme context
export function useColorScheme(): ColorSchemeName {
  const { colorScheme } = useTheme();
  return colorScheme;
}
