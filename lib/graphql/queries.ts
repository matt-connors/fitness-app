import { gql } from '@apollo/client';

// User routines query with pagination
export const GET_USER_ROUTINES = gql`
  query GetUserRoutines(
    $userId: Int!
    $skip: Int = 0
    $take: Int = 10
    $type: String
    $skillLevel: String
  ) {
    userRoutines(
      userId: $userId
      skip: $skip
      take: $take
      type: $type
      skillLevel: $skillLevel
    ) {
      routines {
        id
        name
        type
        skillLevel
        createdAt
        updatedAt
        userRoutines {
          role
        }
      }
      totalCount
      hasMore
    }
  }
`;

// Get detailed information about a specific routine
export const GET_ROUTINE_DETAILS = gql`
  query GetRoutineDetails($id: Int!) {
    routine(id: $id) {
      id
      name
      type
      skillLevel
      createdAt
      updatedAt
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
          targetMuscle
          iconUrl
        }
      }
      userRoutines {
        role
        user {
          id
          username
          profilePictureUrl
        }
      }
    }
  }
`;

// Get basic exercise information
export const GET_EXERCISE_BASIC_INFO = gql`
  query GetExerciseBasicInfo($id: Int!) {
    exercise(id: $id) {
      id
      name
      targetMuscle
      iconUrl
    }
  }
`;

// Get detailed exercise information
export const GET_EXERCISE_DETAILS = gql`
  query GetExerciseDetails($id: Int!) {
    exercise(id: $id) {
      id
      name
      targetMuscle
      iconUrl
      posterUrl
      instructions
      cues
      overview
    }
  }
`;

// Session Queries
export const GET_SESSION = gql`
  query GetSession($id: Int!) {
    session(id: $id) {
      id
      userId
      routineId
      name
      date
      duration
      notes
    }
  }
`;

export const GET_SESSION_EXERCISES = gql`
  query GetSessionExercises($sessionId: Int!) {
    sessionExercises(sessionId: $sessionId) {
      id
      sessionId
      exerciseId
      exercise {
        id
        name
        targetMuscle
        iconUrl
      }
    }
  }
`;

export const GET_SESSION_SETS = gql`
  query GetSessionSets($sessionExerciseId: Int!) {
    sessionSets(sessionExerciseId: $sessionExerciseId) {
      id
      sessionExerciseId
      setNumber
      reps
      weight
    }
  }
`; 