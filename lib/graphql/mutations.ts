import { gql } from '@apollo/client';

// Create a new routine
export const CREATE_ROUTINE = gql`
  mutation CreateRoutine($input: CreateRoutineInput!) {
    createRoutine(input: $input) {
      id
      name
      type
      skillLevel
      updatedAt
      createdAt
      routineExercises {
        exerciseId
        sets
        restTime
        order
        rir
        notes
        exercise {
          id
          name
        }
      }
      userRoutines {
        role
      }
    }
  }
`;

// Update an existing routine
export const UPDATE_ROUTINE = gql`
  mutation UpdateRoutine($id: Int!, $input: UpdateRoutineInput!) {
    updateRoutine(id: $id, input: $input) {
      id
      name
      type
      skillLevel
      updatedAt
      createdAt
      routineExercises {
        exerciseId
        sets
        restTime
        order
        rir
        notes
        exercise {
          id
          name
        }
      }
      userRoutines {
        role
      }
    }
  }
`;

// Delete a routine
export const DELETE_ROUTINE = gql`
  mutation DeleteRoutine($id: Int!) {
    deleteRoutine(id: $id)
  }
`;

export const CREATE_WORKOUT = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) {
      id
      date
      routineId
      status
      completedExercises {
        id
        exerciseId
        completed
        actualSets
        actualReps
        actualWeight
        actualDuration
        actualDistance
        actualCalories
        notes
      }
    }
  }
`;

// Session Mutations
export const CREATE_SESSION = gql`
  mutation CreateSession($name: String, $routineId: Int, $date: String) {
    createSession(name: $name, routineId: $routineId, date: $date) {
      id
      name
      routineId
      date
      duration
      userId
    }
  }
`;

export const UPDATE_SESSION = gql`
  mutation UpdateSession($id: Int!, $name: String, $duration: Int, $notes: String) {
    updateSession(id: $id, name: $name, duration: $duration, notes: $notes) {
      id
      name
      duration
      notes
    }
  }
`;

export const DELETE_SESSION = gql`
  mutation DeleteSession($id: Int!) {
    deleteSession(id: $id)
  }
`;

// Session Exercise Mutations
export const CREATE_SESSION_EXERCISE = gql`
  mutation CreateSessionExercise($sessionId: Int!, $exerciseId: Int!) {
    createSessionExercise(sessionId: $sessionId, exerciseId: $exerciseId) {
      id
      sessionId
      exerciseId
    }
  }
`;

export const DELETE_SESSION_EXERCISE = gql`
  mutation DeleteSessionExercise($id: Int!) {
    deleteSessionExercise(id: $id)
  }
`;

// Session Set Mutations
export const CREATE_SESSION_SET = gql`
  mutation CreateSessionSet($sessionExerciseId: Int!, $setNumber: Int!, $reps: Int, $weight: Float) {
    createSessionSet(sessionExerciseId: $sessionExerciseId, setNumber: $setNumber, reps: $reps, weight: $weight) {
      id
      sessionExerciseId
      setNumber
      reps
      weight
    }
  }
`;

export const UPDATE_SESSION_SET = gql`
  mutation UpdateSessionSet($id: Int!, $reps: Int, $weight: Float) {
    updateSessionSet(id: $id, reps: $reps, weight: $weight) {
      id
      reps
      weight
    }
  }
`;

export const DELETE_SESSION_SET = gql`
  mutation DeleteSessionSet($id: Int!) {
    deleteSessionSet(id: $id)
  }
`; 