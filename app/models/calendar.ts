import { SPACING } from "@/constants/Spacing";
import { Dimensions } from "react-native";

// Calendar data types
export interface WorkoutEvent {
  id: string;
  label: string;
  color: string;
  date: Date;
  duration?: number; // in minutes
}

export interface CalendarDay {
  date: number;
  fullDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  workout?: WorkoutEvent;
}

export interface MonthData {
  month: number;
  year: number;
  days: CalendarDay[];
  id: string;
  height: number;
}

// Calendar constants
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = MONTHS.map(month => month.slice(0, 3));

// Layout constants
export const CELL_ASPECT_RATIO = 1.5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CELL_WIDTH = (SCREEN_WIDTH - (SPACING.pageHorizontal * 2) - (SPACING.pageHorizontalInside * 2)) / 7;
export const CELL_HEIGHT = CELL_WIDTH * CELL_ASPECT_RATIO;
export const MONTH_PADDING = 40; // Padding for month header and spacing
export const MONTH_SPACING = 40; // Vertical spacing between months
export const BASE_MONTH_HEIGHT = (CELL_HEIGHT * 6) + MONTH_PADDING + MONTH_SPACING; // Maximum possible height

// Helper functions
export function createDate(year: number, month: number, day: number = 1): Date {
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthHeight(year: number, month: number): number {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDays = firstDay + daysInMonth;
  const rows = Math.ceil(totalDays / 7);
  return (CELL_HEIGHT * rows) + MONTH_PADDING + MONTH_SPACING;
}

export function getCalendarDays(year: number, month: number, workouts: WorkoutEvent[] = []): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = createDate(year, month);
  const firstDayOfMonth = firstDay.getDay();
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const days: CalendarDay[] = [];

  // Previous month's days
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevMonthDay = daysInPrevMonth - firstDayOfMonth + i + 1;
    const fullDate = createDate(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, prevMonthDay);
    
    days.push({
      date: prevMonthDay,
      fullDate,
      isCurrentMonth: false,
      isToday: fullDate.getTime() === today.getTime(),
    });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = createDate(year, month, i);
    const isToday = fullDate.getTime() === today.getTime();
    
    // Find workout for this day - improved comparison logic
    let foundWorkout: WorkoutEvent | undefined;
    
    for (const workout of workouts) {
      const workoutDate = new Date(workout.date);
      
      // Normalize dates for comparison (remove time component)
      const normalizedWorkoutDate = new Date(
        workoutDate.getFullYear(),
        workoutDate.getMonth(),
        workoutDate.getDate()
      );
      
      const normalizedFullDate = new Date(
        fullDate.getFullYear(),
        fullDate.getMonth(),
        fullDate.getDate()
      );
      
      if (normalizedWorkoutDate.getTime() === normalizedFullDate.getTime()) {
        foundWorkout = workout;
        break;
      }
    }

    days.push({
      date: i,
      fullDate,
      isCurrentMonth: true,
      isToday,
      workout: foundWorkout
    });
  }

  // Next month's days to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    const fullDate = createDate(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
    
    days.push({
      date: i,
      fullDate,
      isCurrentMonth: false,
      isToday: fullDate.getTime() === today.getTime(),
    });
  }

  return days;
}

export function getMonthData(date: Date, workouts: WorkoutEvent[] = []): MonthData {
  const month = date.getMonth();
  const year = date.getFullYear();
  return {
    month,
    year,
    days: getCalendarDays(year, month, workouts),
    id: `${year}-${month}`,
    height: getMonthHeight(year, month)
  };
}

export function getInitialMonths(currentDate: Date, workouts: WorkoutEvent[] = []): MonthData[] {
  const months: MonthData[] = [];
  const startDate = new Date(currentDate);
  startDate.setMonth(startDate.getMonth() - 3); // Start 3 months before

  for (let i = 0; i < 7; i++) { // Load 7 months (3 before, current, 3 after)
    months.push(getMonthData(startDate, workouts));
    startDate.setMonth(startDate.getMonth() + 1);
  }

  return months;
} 