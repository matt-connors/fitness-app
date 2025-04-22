import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ActionSheetOption = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type ActionSheetProps = {
  visible: boolean;
  options: ActionSheetOption[];
  onClose: () => void;
};

export function ActionSheet({ visible, options, onClose }: ActionSheetProps) {
  const backgroundColor = useThemeColor('backgroundSubtleContrast');
  const borderColor = useThemeColor('borderStronger');
  const destructiveColor = '#FF453A';

  // Handle option press with safety against nested updates
  const handleOptionPress = (optionFn: () => void) => {
    // Close first, then execute the option function after the state has settled
    onClose();
    // Use setTimeout to break the update cycle
    setTimeout(() => {
      optionFn();
    }, 0);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.container, { backgroundColor }]}>
          {options.map((option, index) => (
            <React.Fragment key={option.label}>
              <TouchableOpacity 
                style={styles.option}
                onPress={() => handleOptionPress(option.onPress)}
              >
                <ThemedText 
                  style={[
                    styles.optionText, 
                    option.destructive && { color: destructiveColor }
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
              
              {index < options.length - 1 && (
                <View style={[styles.divider, { borderColor }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
  },
  divider: {
    borderTopWidth: 1,
    width: '100%',
  },
}); 