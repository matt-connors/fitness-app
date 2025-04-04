import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock exercise data for testing (to be replaced with API fetch)
const EXERCISE_DATA = [
  { id: 'e1', name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { id: 'e2', name: 'Squats', muscle: 'Legs', equipment: 'Barbell' },
  { id: 'e3', name: 'Deadlifts', muscle: 'Back', equipment: 'Barbell' },
  { id: 'e4', name: 'Pull Ups', muscle: 'Back', equipment: 'Bodyweight' },
  { id: 'e5', name: 'Push Ups', muscle: 'Chest', equipment: 'Bodyweight' },
  { id: 'e6', name: 'Lunges', muscle: 'Legs', equipment: 'Bodyweight' },
  { id: 'e7', name: 'Bicep Curls', muscle: 'Arms', equipment: 'Dumbbell' },
  { id: 'e8', name: 'Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'e9', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
  { id: 'e10', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine' },
];

// Keys for AsyncStorage
const EXERCISE_CACHE_KEY = 'exercise_data_cache';
const EXERCISE_CACHE_TIMESTAMP_KEY = 'exercise_data_cache_timestamp';

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Fetch exercises from API or cache
 * @returns Promise with exercise data
 */
export const fetchExercises = async () => {
  try {
    // Check cache timestamp
    const cachedTimestamp = await AsyncStorage.getItem(EXERCISE_CACHE_TIMESTAMP_KEY);
    const now = new Date().getTime();
    
    // If cache is valid and not expired
    if (cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION) {
      const cachedData = await AsyncStorage.getItem(EXERCISE_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    // If cache is invalid or expired, fetch from API
    // const response = await fetch('https://your-api-endpoint/exercises');
    // const data = await response.json();
    
    // For now, use mock data (replace with actual API call later)
    const data = EXERCISE_DATA;
    
    // Cache the data
    await AsyncStorage.setItem(EXERCISE_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(EXERCISE_CACHE_TIMESTAMP_KEY, now.toString());
    
    return data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    
    // If error occurs, try to return cached data if available
    try {
      const cachedData = await AsyncStorage.getItem(EXERCISE_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Error reading from cache:', cacheError);
    }
    
    // If all fails, return mock data
    return EXERCISE_DATA;
  }
};

/**
 * Force refresh the exercise data cache
 * @returns Promise with latest exercise data
 */
export const refreshExercises = async () => {
  try {
    // In a real app, fetch from API
    // const response = await fetch('https://your-api-endpoint/exercises');
    // const data = await response.json();
    
    // For now, use mock data
    const data = EXERCISE_DATA;
    
    // Update cache with new data
    const now = new Date().getTime();
    await AsyncStorage.setItem(EXERCISE_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(EXERCISE_CACHE_TIMESTAMP_KEY, now.toString());
    
    return data;
  } catch (error) {
    console.error('Error refreshing exercises:', error);
    return EXERCISE_DATA;
  }
};

/**
 * Search exercises by name
 * @param query Search query string
 * @returns Filtered exercise list
 */
export const searchExercises = async (query: string) => {
  const exercises = await fetchExercises();
  
  if (!query) return exercises;
  
  const normalizedQuery = query.toLowerCase().trim();
  return exercises.filter((exercise: any) => 
    exercise.name.toLowerCase().includes(normalizedQuery) ||
    exercise.muscle.toLowerCase().includes(normalizedQuery) ||
    exercise.equipment.toLowerCase().includes(normalizedQuery)
  );
}; 