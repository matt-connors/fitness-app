import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';

interface ChipItem {
  id: string;
  name: string;
}

interface FilterChipsProps {
  data: ChipItem[];
  selectedId: string | null;
  isAllSelected: boolean;
  onChipPress: (id: string) => void;
  horizontal?: boolean;
  style?: object;
}

export const FilterChips = ({
  data,
  selectedId,
  isAllSelected,
  onChipPress,
  horizontal = true,
  style
}: FilterChipsProps) => {
  const accentColor = useThemeColor('brand');
  const accentTextColor = useThemeColor('brandText');
  const textColorMuted = useThemeColor('textMuted');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');

  const renderChip = ({ item }: { item: ChipItem }) => {
    // Determine if this chip is selected
    let isSelected = false;

    if (item.id === 'all') {
      isSelected = isAllSelected;
    } else {
      isSelected = selectedId === item.id;
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.chip,
          { backgroundColor: isSelected ? accentColor : contrastBackgroundColor }
        ]}
        onPress={() => onChipPress(item.id)}
      >
        <ThemedText style={[
          styles.chipText,
          { color: isSelected ? accentTextColor : textColorMuted }
        ]}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      data={data}
      renderItem={renderChip}
      keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.chipsContainer, 
        { paddingHorizontal: SPACING.pageHorizontal },
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 0
  },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 18,
    marginRight: 8,
    height: 34,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '400',
  },
}); 