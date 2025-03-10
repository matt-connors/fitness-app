import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUTS_STORAGE_KEY = 'fitness_app_workouts';

export type SavedWorkout = {
  id: string;
  name: string;
  exercises: Array<any>;
  startTime: Date;
  endTime?: Date;
  elapsedSeconds: number;
  isPaused: boolean;
};

export function useWorkoutData() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workouts from storage on mount
  useEffect(() => {
    loadWorkouts();
  }, []);

  // Load saved workouts from AsyncStorage
  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const savedWorkoutsJson = await AsyncStorage.getItem(WORKOUTS_STORAGE_KEY);
      
      if (savedWorkoutsJson) {
        // Parse the JSON and convert date strings back to Date objects
        const parsedWorkouts = JSON.parse(savedWorkoutsJson);
        const workoutsWithDates = parsedWorkouts.map((workout: any) => ({
          ...workout,
          startTime: new Date(workout.startTime),
          endTime: workout.endTime ? new Date(workout.endTime) : undefined
        }));
        
        setWorkouts(workoutsWithDates);
      }
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save a new workout to storage
  const saveWorkout = async (workout: SavedWorkout) => {
    try {
      // Add to local state
      const updatedWorkouts = [...workouts, workout];
      setWorkouts(updatedWorkouts);
      
      // Save to AsyncStorage (convert Date objects to strings for JSON serialization)
      const workoutsToSave = updatedWorkouts.map(w => ({
        ...w,
        startTime: w.startTime.toISOString(),
        endTime: w.endTime ? w.endTime.toISOString() : undefined
      }));
      
      await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workoutsToSave));
      return true;
    } catch (error) {
      console.error('Failed to save workout:', error);
      return false;
    }
  };

  // Delete a workout by ID
  const deleteWorkout = async (workoutId: string) => {
    try {
      const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
      setWorkouts(updatedWorkouts);
      
      // Save updated list to AsyncStorage
      const workoutsToSave = updatedWorkouts.map(w => ({
        ...w,
        startTime: w.startTime.toISOString(),
        endTime: w.endTime ? w.endTime.toISOString() : undefined
      }));
      
      await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workoutsToSave));
      return true;
    } catch (error) {
      console.error('Failed to delete workout:', error);
      return false;
    }
  };

  // Update an existing workout
  const updateWorkout = async (updatedWorkout: SavedWorkout) => {
    try {
      const updatedWorkouts = workouts.map(w => 
        w.id === updatedWorkout.id ? updatedWorkout : w
      );
      
      setWorkouts(updatedWorkouts);
      
      // Save to AsyncStorage
      const workoutsToSave = updatedWorkouts.map(w => ({
        ...w,
        startTime: w.startTime.toISOString(),
        endTime: w.endTime ? w.endTime.toISOString() : undefined
      }));
      
      await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workoutsToSave));
      return true;
    } catch (error) {
      console.error('Failed to update workout:', error);
      return false;
    }
  };

  return {
    workouts,
    isLoading,
    saveWorkout,
    deleteWorkout,
    updateWorkout,
    loadWorkouts
  };
} 