import { useState, useRef, useCallback, useEffect } from 'react';
import { FlatList, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions, InteractionManager } from 'react-native';
import { MonthData, getInitialMonths, getMonthData, BASE_MONTH_HEIGHT, WorkoutEvent } from '@/app/models/calendar';
import { SPACING } from '@/constants/Spacing';

interface UseCalendarProps {
  initialDate: Date;
  workouts?: WorkoutEvent[];
  onMonthChange?: (month: MonthData) => void;
}

// Constants for buffer and batch loading
const INITIAL_LOAD_MONTHS = 7; // How many months to initially load (3 before, current, 3 after)
const BUFFER_MONTHS = 5; // How many additional months to keep as buffer
const BATCH_LOAD_SIZE = 3; // How many months to load at once when needed

export function useCalendar({ 
  initialDate, 
  workouts = [], 
  onMonthChange 
}: UseCalendarProps) {
  // State to track months data
  const [months, setMonths] = useState(() => getInitialMonths(initialDate, workouts));
  
  // Track references
  const flatListRef = useRef<FlatList>(null);
  const isLoadingRef = useRef(false);
  const currentMonthIndex = useRef(3); // Start with current month in the center
  const initialScrollComplete = useRef(false);
  const { height: screenHeight } = useWindowDimensions();
  
  // Update months when workouts change
  useEffect(() => {
    if (workouts.length > 0) {
      // Re-generate months when workouts change
      setMonths(getInitialMonths(initialDate, workouts));
    }
  }, [workouts, initialDate]);

  // Calculate cumulative height for scrolling
  const getCumulativeOffset = useCallback((index: number) => {
    return months.slice(0, index).reduce((sum, month) => sum + month.height, 0);
  }, [months]);

  // Get item layout for FlatList optimization
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: data[index]?.height || BASE_MONTH_HEIGHT,
    offset: getCumulativeOffset(index),
    index,
  }), [getCumulativeOffset]);

  // Scroll to today's date
  const scrollToToday = useCallback(() => {
    // Reset the loading state to prevent any ongoing loads
    isLoadingRef.current = false;
    
    // Reset to a fresh set of months centered on today
    const newMonths = getInitialMonths(new Date(), workouts);
    setMonths(newMonths);
    currentMonthIndex.current = 3; // Reset to center index
    
    // Scroll to the new current month
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({
        index: currentMonthIndex.current,
        animated: true,
        viewPosition: 0.5
      });
      
      // Ensure the month title is updated immediately
      if (onMonthChange) {
        onMonthChange(newMonths[currentMonthIndex.current]);
      }
    });
  }, [onMonthChange, workouts]);

  // Handle scroll events to load more months and update current month
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Find the current visible month based on cumulative heights
    let visibleIndex = 0;
    let cumulativeHeight = 0;
    
    for (let i = 0; i < months.length; i++) {
      cumulativeHeight += months[i].height;
      if (cumulativeHeight > contentOffset.y + (layoutMeasurement.height / 2)) {
        visibleIndex = i;
        break;
      }
    }
    
    // Notify parent of month change if callback exists
    if (onMonthChange && months[visibleIndex]) {
      onMonthChange(months[visibleIndex]);
    }
    
    // Load more months if needed
    const THRESHOLD = 1000;
    if (!isLoadingRef.current) {
      // Load previous months
      if (contentOffset.y < THRESHOLD && visibleIndex < 5) {
        isLoadingRef.current = true;
        
        setMonths(prevMonths => {
          const newMonths = [...prevMonths];
          const baseDate = new Date(prevMonths[0].year, prevMonths[0].month, 1);
          baseDate.setMonth(baseDate.getMonth() - 3);
          
          const monthsToAdd = [];
          for (let i = 0; i < 3; i++) {
            monthsToAdd.unshift(getMonthData(baseDate, workouts));
            baseDate.setMonth(baseDate.getMonth() + 1);
          }
          
          currentMonthIndex.current += monthsToAdd.length;
          
          return [...monthsToAdd, ...newMonths];
        });
        
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 500);
      }
      
      // Load next months
      if (contentSize.height - (contentOffset.y + layoutMeasurement.height) < THRESHOLD) {
        isLoadingRef.current = true;
        
        setMonths(prevMonths => {
          const baseDate = new Date(
            prevMonths[prevMonths.length - 1].year, 
            prevMonths[prevMonths.length - 1].month, 
            1
          );
          baseDate.setMonth(baseDate.getMonth() + 1);
          
          const monthsToAdd = [];
          for (let i = 0; i < 3; i++) {
            monthsToAdd.push(getMonthData(baseDate, workouts));
            baseDate.setMonth(baseDate.getMonth() + 1);
          }
          
          return [...prevMonths, ...monthsToAdd];
        });
        
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 500);
      }
    }
  }, [months, onMonthChange, workouts]);

  // Handle scrollToIndex failures
  const handleScrollToIndexFailed = useCallback((info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const offset = info.averageItemLength * info.index;
    flatListRef.current?.scrollToOffset({
      offset,
      animated: false,
    });

    // Try again but with animation
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 100);
  }, []);

  return {
    months,
    flatListRef,
    currentMonthIndex: currentMonthIndex.current,
    getItemLayout,
    handleScroll,
    handleScrollToIndexFailed,
    scrollToToday,
  };
} 