import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { DAYS_OF_WEEK } from '@/app/models/calendar';

export function CalendarHeader() {
  return (
    <View style={styles.header}>
      {DAYS_OF_WEEK.map((day) => (
        <View key={day} style={styles.headerCell}>
          <ThemedText style={styles.headerText}>
            {day}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginBottom: 2,
    gap: 2,
    justifyContent: 'space-between',
  },
  headerCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '500',
  },
}); 