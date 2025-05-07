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