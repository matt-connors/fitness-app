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
    // Check if the exercise has an exerciseId from a selection dropdown
    if (exercise.exerciseId && typeof exercise.exerciseId === 'number') {
      // Use the exerciseId directly when available
      exerciseId = exercise.exerciseId;
    } else if (typeof exercise.id === 'number') {
      // Use numeric id as-is
      exerciseId = exercise.id;
    } else if (typeof exercise.id === 'string') {
      if (exercise.id.includes('temp-')) {
        // Handle temporary IDs created during the UI workflow (e.g., "temp-123456")
        // In this case we need to ensure we have a valid exerciseId from selection
        if (exercise.name && typeof exercise.name === 'string') {
          // Try to extract exerciseId from the name if it's a selection
          // This is a fallback assuming the name might contain the ID
          const match = exercise.name.match(/^(\d+)\s*[:-]/);
          if (match) {
            exerciseId = parseInt(match[1], 10);
          } else {
            // If we can't extract a valid ID, use the index plus a small offset
            exerciseId = (index + 1);
          }
        } else {
          exerciseId = (index + 1);
        }
      } else if (!isNaN(Number(exercise.id))) {
        // If it's a string that can be converted to a number, use that
        exerciseId = Number(exercise.id);
      } else {
        // Fall back to index-based ID
        exerciseId = (index + 1);
      }
    } else {
      // For any other cases, use a simple number
      exerciseId = (index + 1);
    }
  } catch (error) {
    console.warn('Error converting exercise ID, using fallback:', error);
    exerciseId = (index + 1); // Fallback to a simple index-based ID
  }

  // Make sure exerciseId is a valid number
  if (isNaN(exerciseId) || !isFinite(exerciseId) || exerciseId <= 0) {
    exerciseId = (index + 1);
  }

  // Construct the proper set array
  let sets = [];
  if (Array.isArray(exercise.multipleSets) && exercise.multipleSets.length > 0) {
    sets = exercise.multipleSets;
  } else if (exercise.sets && exercise.reps) {
    // Handle the case where we have single set data
    const reps = typeof exercise.reps === 'string' ? parseInt(exercise.reps, 10) : exercise.reps;
    sets = [{
      setNumber: 1,
      reps: reps || undefined,
      weight: exercise.weight || undefined,
      rpe: exercise.rpe || undefined,
      rir: exercise.rir || undefined,
      tempo: exercise.tempo || undefined,
      restPause: exercise.restPause || undefined
    }];
  }

  return {
    exerciseId,
    sets,
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

// Session types
export interface Session {
  id: number;
  userId: number;
  routineId?: number;
  name?: string;
  date: string;
  duration?: number;
  notes?: string;
}

export interface SessionExercise {
  id: number;
  sessionId: number;
  exerciseId: number;
  exercise?: Exercise;
}

export interface SessionSet {
  id: number;
  sessionExerciseId: number;
  setNumber: number;
  reps?: number;
  weight?: number;
}

// Also add a helper to map from local exercise format to SessionSet
export interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

// Map from frontend exercise/set to backend SessionSet
export function mapExerciseSetToSessionSet(
  set: ExerciseSet,
  sessionExerciseId: number,
  setIndex: number
): Omit<SessionSet, 'id'> {
  return {
    sessionExerciseId,
    setNumber: setIndex + 1,
    reps: set.reps ? parseInt(set.reps, 10) : undefined,
    weight: set.weight ? parseFloat(set.weight) : undefined
  };
}

// Map from backend format to frontend exercise set format
export function mapSessionSetToExerciseSet(
  sessionSet: SessionSet
): ExerciseSet {
  return {
    id: sessionSet.id.toString(),
    weight: sessionSet.weight?.toString() || '0',
    reps: sessionSet.reps?.toString() || '0',
    completed: false
  };
}

// Map from frontend exercise to SessionExercise format
export function mapExerciseToSessionExerciseInput(
  exercise: any,
  sessionId: number
): { sessionId: number, exerciseId: number } {
  // Similar to mapExerciseToRoutineExerciseInput but simpler
  let exerciseId: number;
  
  // Try to convert exercise ID to a valid number
  if (typeof exercise.id === 'number') {
    exerciseId = exercise.id;
  } else if (typeof exercise.id === 'string' && !isNaN(Number(exercise.id))) {
    exerciseId = Number(exercise.id);
  } else {
    // Fallback
    exerciseId = 1;
  }

  return {
    sessionId,
    exerciseId
  };
}

// Map from backend SessionExercise to frontend exercise format
export function mapSessionExerciseToExercise(
  sessionExercise: SessionExercise,
  sets: SessionSet[] = []
): any {
  if (!sessionExercise.exercise) {
    return null;
  }
  
  return {
    id: sessionExercise.id.toString(),
    name: sessionExercise.exercise.name,
    showRpe: false,
    sets: sets.map(set => mapSessionSetToExerciseSet(set))
  };
} 