// Enum types from schema
export enum RoutineType {
  Strength = 'Strength',
  Endurance = 'Endurance',
  Flexibility = 'Flexibility',
  Balance = 'Balance',
  Mobility = 'Mobility'
}

export enum SkillLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  AllLevels = 'AllLevels'
}

export enum TargetMuscle {
  Chest = 'Chest',
  Back = 'Back',
  Legs = 'Legs',
  Shoulders = 'Shoulders',
  Arms = 'Arms',
  Core = 'Core'
}

export enum UserRoutineRole {
  Creator = 'Creator',
  Participant = 'Participant'
}

// Types for queries and mutations
export interface User {
  id: number;
  username: string;
  profilePictureUrl?: string;
}

export interface Exercise {
  id: number;
  name: string;
  targetMuscle: TargetMuscle;
  iconUrl: string;
  posterUrl?: string;
  instructions?: any; // JSON
  cues?: any; // JSON
  overview?: string;
}

export interface Set {
  setNumber: number;
  reps?: number;
  restPause?: number;
  rpe?: number;
  rir?: number;
  tempo?: number;
  weight?: number;
  showExpanded?: boolean;
}

export interface RoutineExercise {
  exerciseId: number;
  sets: Set[] | any; // JSON
  restTime?: number;
  order: number;
  rir?: number;
  notes?: string;
  exercise?: Exercise;
}

export interface UserRoutine {
  role: UserRoutineRole;
  user?: User;
}

export interface Routine {
  id: number;
  name: string;
  type: RoutineType;
  skillLevel?: SkillLevel;
  createdAt: string;
  updatedAt: string;
  routineExercises?: RoutineExercise[];
  userRoutines?: UserRoutine[];
}

export interface PaginatedRoutines {
  routines: Routine[];
  totalCount: number;
  hasMore: boolean;
}

// Input types for mutations
export interface CreateRoutineInput {
  name: string;
  type: RoutineType;
  skillLevel?: SkillLevel;
  exercises: RoutineExerciseInput[];
}

export interface UpdateRoutineInput {
  name?: string;
  type?: RoutineType;
  skillLevel?: SkillLevel;
  exercises?: RoutineExerciseInput[];
}

export interface RoutineExerciseInput {
  exerciseId: number;
  sets: Set[] | any; // JSON
  restTime?: number;
  order: number;
  rir?: number;
  notes?: string;
}

// Map from frontend exercise format to backend format
export function mapExerciseToRoutineExerciseInput(
  exercise: any, 
  index: number
): RoutineExerciseInput {
  // Convert ID safely - ensure it's a safe integer for GraphQL
  let exerciseId: number;
  try {
    // Check if the ID is a valid number that fits within GraphQL Int limits
    // GraphQL Int type represents a signed 32-bit integer (max value: 2147483647)
    const MAX_INT_32 = 2147483647;
    
    if (typeof exercise.id === 'number' && exercise.id < MAX_INT_32) {
      exerciseId = exercise.id;
    } else if (typeof exercise.id === 'string' && !isNaN(Number(exercise.id))) {
      // If it's a string that can be converted to a number
      const numId = Number(exercise.id);
      // Check if the number is within safe bounds for GraphQL Int
      if (numId < MAX_INT_32) {
        exerciseId = numId;
      } else {
        // For timestamp-based IDs or other large numbers, use index-based fallback
        exerciseId = (index + 1);
      }
    } else {
      // For auto-generated IDs or invalid formats, use a simple number
      exerciseId = (index + 1); 
    }
  } catch (error) {
    console.warn('Error converting exercise ID, using fallback:', error);
    exerciseId = (index + 1); // Fallback to a simple index-based ID
  }

  return {
    exerciseId,
    sets: exercise.multipleSets || [],
    restTime: exercise.restPause,
    order: index,
    rir: exercise.rir,
    notes: exercise.notes
  };
}

// Map from backend format to frontend exercise format
export function mapRoutineExerciseToExercise(
  routineExercise: RoutineExercise
): any {
  if (!routineExercise.exercise) {
    return null;
  }
  
  return {
    id: routineExercise.exerciseId.toString(),
    name: routineExercise.exercise.name,
    allSetsEqual: false, // Always use multiple sets mode with the API
    showRpe: true,
    showExpanded: false,
    multipleSets: Array.isArray(routineExercise.sets) 
      ? routineExercise.sets
      : [{ setNumber: 1, reps: 10, restPause: routineExercise.restTime }],
    restPause: routineExercise.restTime,
    rir: routineExercise.rir,
    notes: routineExercise.notes
  };
} 