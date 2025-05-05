import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface RefreshIndicatorProps {
  fetching: boolean;
  refreshText?: string;
  updatedText?: string;
}

export const RefreshIndicator = ({
  fetching,
  refreshText = "Refreshing...",
  updatedText = "Updated!"
}: RefreshIndicatorProps) => {
  const accentColor = useThemeColor('brand');

  return (
    <View style={styles.refreshIndicator}>
      <ActivityIndicator size="small" color={accentColor} />
      <ThemedText style={styles.refreshText}>
        {fetching ? refreshText : updatedText}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  refreshText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#888',
  },
}); 