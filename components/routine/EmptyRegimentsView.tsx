import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export const EmptyRegimentsView = () => {
  return (
    <View style={styles.emptyRegimentContainer}>
      <ThemedText style={styles.emptyRegimentText}>
        Regiment features coming soon
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyRegimentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyRegimentText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 