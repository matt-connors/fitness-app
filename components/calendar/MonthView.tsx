import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { MonthData, MONTHS_SHORT } from '@/app/models/calendar';
import { CalendarDay } from './CalendarDay';

interface MonthViewProps {
  data: MonthData;
  onDayPress?: (day: any) => void;
}

export function MonthView({ data, onDayPress }: MonthViewProps) {
  return (
    <View style={[styles.monthContainer, { height: data.height }]}>
      <ThemedText style={styles.monthText}>
        {MONTHS_SHORT[data.month]}
      </ThemedText>
      <View style={styles.grid}>
        {data.days.map((day, index) => (
          <CalendarDay 
            key={`${data.id}-day-${index}`} 
            day={day} 
            onPress={onDayPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthContainer: {
    width: '100%',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'right',
    marginRight: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
}); 