import { RoutineType } from '@/lib/graphql/types';

// Define a set of colors to use for workouts
export const WORKOUT_COLORS = [
  '#442A0A', // Brown
  '#072B3E', // Navy Blue
  '#292E34', // Charcoal
  '#3E1707', // Maroon
  '#073E1E', // Forest Green
  '#1C073E', // Deep Purple
  '#3E3A07', // Olive
  '#3E0721', // Burgundy
  '#07303E', // Teal
  '#2E073E', // Violet
  '#3E2207', // Rust
  '#072F3E', // Steel Blue
  '#0B3E07', // Emerald
];

// Map to store workout name to color associations
const workoutColorMap = new Map<string, string>();

/**
 * Gets a consistent color for a workout name
 * @param workoutName The name of the workout
 * @returns A color from the WORKOUT_COLORS array
 */
export function getWorkoutColor(workoutName: string): string {
  if (!workoutName) return WORKOUT_COLORS[0];
  
  // If we already assigned a color to this workout name, return it
  if (workoutColorMap.has(workoutName)) {
    return workoutColorMap.get(workoutName)!;
  }
  
  // Otherwise, assign a new color based on the map size
  const colorIndex = workoutColorMap.size % WORKOUT_COLORS.length;
  const color = WORKOUT_COLORS[colorIndex];
  workoutColorMap.set(workoutName, color);
  
  return color;
}

/**
 * Gets a default color based on workout type
 */
export function getDefaultColorForType(type: RoutineType): string {
  switch (type) {
    case RoutineType.Strength:
      return WORKOUT_COLORS[0];
    case RoutineType.Endurance:
      return WORKOUT_COLORS[1];
    case RoutineType.Flexibility:
      return WORKOUT_COLORS[2];
    case RoutineType.Balance:
      return WORKOUT_COLORS[3];
    case RoutineType.Mobility:
      return WORKOUT_COLORS[4];
    default:
      return WORKOUT_COLORS[0];
  }
} 