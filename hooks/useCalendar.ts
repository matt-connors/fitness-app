import { useState, useRef, useCallback, useEffect } from 'react';
import { FlatList, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions, InteractionManager } from 'react-native';
import { MonthData, getInitialMonths, getMonthData, BASE_MONTH_HEIGHT, WorkoutEvent } from '@/app/models/calendar';
import { SPACING } from '@/constants/Spacing';

interface UseCalendarProps {
  initialDate?: Date;
  workouts?: WorkoutEvent[];
  onMonthChange?: (month: MonthData) => void;
}

// Constants for buffer and batch loading
const INITIAL_LOAD_MONTHS = 7; // How many months to initially load (3 before, current, 3 after)
const BUFFER_MONTHS = 5; // How many additional months to keep as buffer
const BATCH_LOAD_SIZE = 3; // How many months to load at once when needed

export function useCalendar({ 
  initialDate = new Date(), 
  workouts = [], 
  onMonthChange 
}: UseCalendarProps = {}) {
  // Store current date for initial rendering and resetting
  const currentDateRef = useRef(new Date(initialDate));
  
  // Reference to maintain the range of months currently loaded
  const dateRangeRef = useRef({
    oldest: new Date(initialDate),
    newest: new Date(initialDate),
  });
  
  // Initialize by loading a range of months (buffered)
  const [months, setMonths] = useState(() => {
    const initialMonths = [];
    const startDate = new Date(initialDate);
    
    // Set the oldest date (for range tracking)
    startDate.setMonth(startDate.getMonth() - (Math.floor(INITIAL_LOAD_MONTHS / 2) + BUFFER_MONTHS));
    dateRangeRef.current.oldest = new Date(startDate);
    
    // Populate initial months
    for (let i = 0; i < INITIAL_LOAD_MONTHS + (BUFFER_MONTHS * 2); i++) {
      initialMonths.push(getMonthData(startDate, workouts));
      startDate.setMonth(startDate.getMonth() + 1);
      
      // Update the newest date (for range tracking)
      if (i === INITIAL_LOAD_MONTHS + (BUFFER_MONTHS * 2) - 1) {
        dateRangeRef.current.newest = new Date(startDate);
      }
    }
    
    return initialMonths;
  });
  
  const flatListRef = useRef<FlatList>(null);
  const isLoadingRef = useRef(false);
  const currentMonthIndex = useRef(BUFFER_MONTHS + Math.floor(INITIAL_LOAD_MONTHS / 2));
  const currentScrollOffset = useRef(0);
  const initialScrollComplete = useRef(false);
  const { height: screenHeight } = useWindowDimensions();
  
  // Calculate cumulative height up to a specific index
  const getCumulativeOffset = useCallback((index: number): number => {
    return months.slice(0, index).reduce((sum, month) => sum + month.height, 0);
  }, [months]);

  // Calculate the center offset to position a month in the middle of the screen
  const centerOffset = useCallback((index: number): number => {
    const cumulativeHeight = getCumulativeOffset(index);
    const currentMonthHeight = months[index]?.height || BASE_MONTH_HEIGHT;
    return cumulativeHeight - ((screenHeight - currentMonthHeight) / 2) + SPACING.headerHeight;
  }, [screenHeight, months, getCumulativeOffset]);

  // Calculate the offset needed to center a specific day within a month
  const centerDayOffset = useCallback((monthIndex: number, dayIndex: number): number => {
    if (!months[monthIndex]) return 0;
    
    const month = months[monthIndex];
    const daysPerRow = 7; // Calendar always has 7 days per row
    const rowIndex = Math.floor(dayIndex / daysPerRow);
    
    // Calculate the month's cumulative height up to this point
    const monthOffset = getCumulativeOffset(monthIndex);
    
    // Calculate position within the month (approximation based on rows)
    const dayPosition = rowIndex * (month.height / 6); // Assuming 6 rows max per month
    
    // Adjust to center this position on screen
    return monthOffset + dayPosition - (screenHeight / 2) + SPACING.headerHeight;
  }, [months, screenHeight, getCumulativeOffset]);

  // Get item layout for FlatList optimization
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: data[index]?.height || BASE_MONTH_HEIGHT,
    offset: getCumulativeOffset(index),
    index,
  }), [getCumulativeOffset]);

  // Load more months in specified direction using the buffer approach
  const loadMoreMonths = useCallback((direction: 'before' | 'after') => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    // Create a new base date depending on direction
    const baseDate = new Date(
      direction === 'before' 
        ? dateRangeRef.current.oldest 
        : dateRangeRef.current.newest
    );
    
    // Prepare new months to add
    const newMonths: MonthData[] = [];
    
    // Load a batch of months
    for (let i = 0; i < BATCH_LOAD_SIZE; i++) {
      if (direction === 'before') {
        // Move date backward one month
        baseDate.setMonth(baseDate.getMonth() - 1);
        
        // Add to start of array
        newMonths.unshift(getMonthData(baseDate, workouts));
        
        // Update our oldest date reference
        if (i === BATCH_LOAD_SIZE - 1) {
          dateRangeRef.current.oldest = new Date(baseDate);
        }
      } else {
        // Move date forward one month
        baseDate.setMonth(baseDate.getMonth() + 1);
        
        // Add to end of array
        newMonths.push(getMonthData(baseDate, workouts));
        
        // Update our newest date reference
        if (i === BATCH_LOAD_SIZE - 1) {
          dateRangeRef.current.newest = new Date(baseDate);
        }
      }
    }
    
    // Update the state with new months
    setMonths(prevMonths => {
      if (direction === 'before') {
        // Add months to beginning (and adjust current month index)
        currentMonthIndex.current += newMonths.length;
        return [...newMonths, ...prevMonths];
      } else {
        // Add months to end
        return [...prevMonths, ...newMonths];
      }
    });

    // Reset loading flag after a small delay
    setTimeout(() => {
      isLoadingRef.current = false;
    }, 100);
  }, [workouts]);

  // Handle scroll events to detect when to load more months
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const velocity = event.nativeEvent.velocity?.y ?? 0;
    currentScrollOffset.current = contentOffset.y;
    
    // Find the current visible month based on scroll position
    let currentVisibleIndex = 0;
    let cumulativeHeight = 0;
    
    for (let i = 0; i < months.length; i++) {
      const monthHeight = months[i].height;
      if (cumulativeHeight + (monthHeight / 2) > contentOffset.y) {
        currentVisibleIndex = i;
        break;
      }
      cumulativeHeight += monthHeight;
    }

    // Notify parent of month change if callback exists
    if (onMonthChange && months[currentVisibleIndex]) {
      onMonthChange(months[currentVisibleIndex]);
    }
    
    // Calculate when to load more content, using velocity-aware thresholds
    const isScrollingFast = Math.abs(velocity) > 1.5;
    const visibleHeight = layoutMeasurement.height;
    
    // Dynamic load thresholds based on scroll speed
    const topLoadThreshold = isScrollingFast 
      ? visibleHeight * 2 
      : visibleHeight;
      
    const bottomLoadThreshold = isScrollingFast 
      ? visibleHeight * 2 
      : visibleHeight;
    
    // Check if we need to load more months at the top
    if (contentOffset.y < topLoadThreshold && !isLoadingRef.current) {
      // Preload more months if we're approaching the top of the list
      loadMoreMonths('before');
    }
    
    // Check if we need to load more months at the bottom
    if (contentSize.height - (contentOffset.y + visibleHeight) < bottomLoadThreshold && !isLoadingRef.current) {
      // Preload more months if we're approaching the bottom of the list
      loadMoreMonths('after');
    }
  }, [loadMoreMonths, months, onMonthChange]);

  // Find the index of today's date within the months array
  const findTodayPosition = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < months.length; i++) {
      const monthData = months[i];
      for (let j = 0; j < monthData.days.length; j++) {
        const day = monthData.days[j];
        if (day.isToday && day.isCurrentMonth) {
          return { monthIndex: i, dayIndex: j };
        }
      }
    }
    
    // Fallback to current month index if today not found
    return { monthIndex: currentMonthIndex.current, dayIndex: -1 };
  }, [months]);

  // Reset and scroll to today's date
  const scrollToToday = useCallback(() => {
    // Reset loading state to prevent any ongoing loads
    isLoadingRef.current = true;
    
    // Recreate the initial state centered on today
    const today = new Date();
    currentDateRef.current = new Date(today);
    
    // Reset date range tracking
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - (Math.floor(INITIAL_LOAD_MONTHS / 2) + BUFFER_MONTHS));
    dateRangeRef.current.oldest = new Date(startDate);
    
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + (Math.floor(INITIAL_LOAD_MONTHS / 2) + BUFFER_MONTHS));
    dateRangeRef.current.newest = new Date(endDate);
    
    // Load fresh months centered on today
    const freshMonths: MonthData[] = [];
    const tempDate = new Date(startDate);
    
    for (let i = 0; i < INITIAL_LOAD_MONTHS + (BUFFER_MONTHS * 2); i++) {
      freshMonths.push(getMonthData(tempDate, workouts));
      tempDate.setMonth(tempDate.getMonth() + 1);
    }
    
    // Reset the current month index
    currentMonthIndex.current = BUFFER_MONTHS + Math.floor(INITIAL_LOAD_MONTHS / 2);
    
    // Update state with fresh months
    setMonths(freshMonths);
    
    // Delay the scroll to ensure the list has rendered
    InteractionManager.runAfterInteractions(() => {
      // Find today's position in the fresh months
      const todayDate = today.getDate();
      const currentMonthData = freshMonths[currentMonthIndex.current];
      
      if (currentMonthData) {
        // Find the day index for today
        const todayDayIndex = currentMonthData.days.findIndex(
          day => day.isCurrentMonth && day.date === todayDate
        );
        
        if (todayDayIndex !== -1) {
          // Center the specific day
          const offset = centerDayOffset(currentMonthIndex.current, todayDayIndex);
          
          // Scroll to today's position
          flatListRef.current?.scrollToOffset({
            offset,
            animated: true
          });
        } else {
          // Fallback to centering the month
          const offset = centerOffset(currentMonthIndex.current);
          flatListRef.current?.scrollToOffset({
            offset,
            animated: true
          });
        }
        
        // Notify parent of the current month
        if (onMonthChange) {
          onMonthChange(currentMonthData);
        }
      }
      
      // Reset loading flag
      isLoadingRef.current = false;
    });
  }, [centerOffset, centerDayOffset, onMonthChange, workouts]);

  // Handle initial scroll to center the current month/day
  useEffect(() => {
    if (!initialScrollComplete.current) {
      initialScrollComplete.current = true;
      
      // Delay initial scroll to ensure rendering is complete
      InteractionManager.runAfterInteractions(() => {
        // Find today's position
        const { monthIndex, dayIndex } = findTodayPosition();
        
        if (dayIndex !== -1) {
          // Center the specific day if found
          const offset = centerDayOffset(monthIndex, dayIndex);
          flatListRef.current?.scrollToOffset({
            offset,
            animated: false
          });
        } else {
          // Fallback to centering the month
          const offset = centerOffset(currentMonthIndex.current);
          flatListRef.current?.scrollToOffset({
            offset,
            animated: false
          });
        }
      });
    }
  }, [centerOffset, centerDayOffset, findTodayPosition]);

  // Handle scroll to index failures
  const handleScrollToIndexFailed = useCallback((info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const offset = getCumulativeOffset(info.index);
    flatListRef.current?.scrollToOffset({
      offset,
      animated: false,
    });

    // Try again with animation after a short delay
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 100);
  }, [getCumulativeOffset]);

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