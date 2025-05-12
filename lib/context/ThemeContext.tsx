import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ColorSchemeName, useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
type ThemeMode = 'light' | 'dark' | 'system';

// Theme context type
type ThemeContextType = {
  colorScheme: ColorSchemeName;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
};

// Storage key for theme preference
const THEME_STORAGE_KEY = 'fitness_app_theme_mode';

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  themeMode: 'system',
  setThemeMode: () => {},
  isDarkMode: false,
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get the system color scheme
  const systemColorScheme = useSystemColorScheme();
  
  // State for the user's theme preference
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  
  // Derived color scheme based on theme mode and system preference
  const colorScheme = themeMode === 'system' 
    ? systemColorScheme 
    : themeMode;
  
  // Boolean for whether dark mode is active
  const isDarkMode = colorScheme === 'dark';

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Context value
  const value = {
    colorScheme,
    themeMode,
    setThemeMode: handleSetThemeMode,
    isDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}; 