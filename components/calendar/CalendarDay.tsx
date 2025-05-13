import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CalendarDay as CalendarDayType, CELL_ASPECT_RATIO } from '@/app/models/calendar';

interface CalendarDayProps {
  day: CalendarDayType;
  onPress?: (day: CalendarDayType) => void;
}

export function CalendarDay({ day, onPress }: CalendarDayProps) {
  const textColor = useThemeColor('textMuted');
  const textAccent = useThemeColor('text');

  const handlePress = () => {
    if (onPress && day.isCurrentMonth) {
      onPress(day);
    }
  };

  return (
    <Pressable 
      style={[
        styles.cell, 
        { 
          borderTopWidth: day.isCurrentMonth ? StyleSheet.hairlineWidth : 0,
        }
      ]}
      onPress={handlePress}
      disabled={!day.isCurrentMonth}
    >
      {day.isCurrentMonth && (
        <View style={styles.cellContent}>
          {day.workout && (
            <View 
              style={[
                styles.workoutBadge, 
                { backgroundColor: day.workout.color }
              ]}
            >
              <ThemedText 
                numberOfLines={1} 
                ellipsizeMode="clip" 
                style={styles.workoutBadgeText}
              >
                {day.workout.label}
              </ThemedText>
            </View>
          )}
          <ThemedText 
            style={[
              styles.cellText,
              { color: textColor },
              day.isToday && { color: textAccent }
            ]}
          >
            {day.date}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: `${(100 / 7) - 0.01}%`,
    aspectRatio: 1/CELL_ASPECT_RATIO,
    borderTopColor: 'rgba(140, 140, 140, 0.2)',
    padding: 2,
  },
  cellContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 14,
    position: 'relative',
  },
  cellText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  workoutBadge: {
    position: 'absolute',
    width: '90%',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 4,
    top: 10,
    alignSelf: 'center',
  },
  workoutBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  },
}); 