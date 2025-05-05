import React, { forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onPressIn?: () => void;
  placeholder?: string;
  active?: boolean;
  style?: object;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(({
  value,
  onChangeText,
  onClear,
  onPressIn,
  placeholder = 'Search...',
  active = false,
  style
}, ref) => {
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const borderColor = useThemeColor('border');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');
  const inputBgColor = useThemeColor('background');

  if (!active) {
    return (
      <TouchableOpacity
        style={[
          styles.searchBarContainer, 
          { backgroundColor: contrastBackgroundColor, borderColor },
          style
        ]}
        onPress={onPressIn}
        activeOpacity={0.7}
      >
        <Search size={20} color={textColorMuted} style={styles.searchIcon} strokeWidth={2} />
        <ThemedText
          style={[styles.searchPlaceholder, { color: textColorMuted }]}
        >
          {placeholder}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <View 
      style={[
        styles.searchInputContainer, 
        { backgroundColor: inputBgColor, borderColor },
        style
      ]}
    >
      <Search size={18} color={textColorMuted} style={styles.searchIcon} />
      <TextInput
        ref={ref}
        style={[styles.searchInput, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={textColorMuted}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity
          onPress={onClear}
          style={styles.clearButton}
        >
          <X size={16} color={textColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 10 + 5,
    marginLeft: 5,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
  },
  searchPlaceholder: {
    fontSize: 16,
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
  },
}); 