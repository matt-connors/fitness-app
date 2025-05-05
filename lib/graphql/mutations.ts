import { gql } from '@apollo/client';

// Create a new routine
export const CREATE_ROUTINE = gql`
  mutation CreateRoutine($input: CreateRoutineInput!) {
    createRoutine(input: $input) {
      id
      name
      type
      skillLevel
      routineExercises {
        exerciseId
        sets
        restTime
        order
        rir
        notes
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
      routineExercises {
        exerciseId
        sets
        restTime
        order
        rir
        notes
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