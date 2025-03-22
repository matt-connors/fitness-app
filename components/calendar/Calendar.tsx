import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { MonthData, WorkoutEvent, CalendarDay as CalendarDayType } from '@/app/models/calendar';
import { MonthView } from './MonthView';
import { useCalendar } from '@/hooks/useCalendar';
import { SPACING } from '@/constants/Spacing';

export interface CalendarProps {
  selectedDate?: Date;
  workouts?: WorkoutEvent[];
  onDayPress?: (day: CalendarDayType) => void;
  onMonthChange?: (month: MonthData) => void;
}

export interface CalendarRef {
  scrollToToday: () => void;
}

export const Calendar = forwardRef<CalendarRef, CalendarProps>(({
  selectedDate = new Date(),
  workouts = [],
  onDayPress,
  onMonthChange
}, ref) => {
  const {
    months,
    flatListRef,
    currentMonthIndex,
    getItemLayout,
    handleScroll,
    handleScrollToIndexFailed,
    scrollToToday,
  } = useCalendar({
    initialDate: selectedDate,
    workouts,
    onMonthChange
  });

  // Expose scrollToToday method through ref
  useImperativeHandle(ref, () => ({
    scrollToToday
  }));

  const handleDayPress = useCallback((day: CalendarDayType) => {
    if (onDayPress) {
      onDayPress(day);
    }
  }, [onDayPress]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={months}
        renderItem={({ item }) => (
          <MonthView data={item} onDayPress={handleDayPress} />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialScrollIndex={currentMonthIndex}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        windowSize={7}
        maxToRenderPerBatch={5}
        initialNumToRender={9}
        removeClippedSubviews={true}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        bounces={true}
        alwaysBounceVertical={true}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
        overScrollMode="always"
        decelerationRate="normal"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: SPACING.pageHorizontal,
    paddingTop: 40, // Extra padding to allow bounce effect
  },
}); 