import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { useActiveWorkout } from '@/components/ActiveWorkoutProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Play, Pause, Plus, BarChart } from 'lucide-react-native';
import { PageContainer } from '@/components/PageContainer';
import { useRouter } from 'expo-router';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeWorkout, togglePauseWorkout, stopActiveWorkout, elapsedTime } = useActiveWorkout();
  const [workoutName, setWorkoutName] = useState(() => activeWorkout?.name || 'Quick Workout');
  const [exercises, setExercises] = useState<Array<{
    id: string;
    name: string;
    sets: Array<{
      id: string;
      weight: string;
      reps: string;
      completed: boolean;
    }>;
  }>>([
    {
      id: '1',
      name: 'Bench Press',
      sets: [
        { id: '1-1', weight: '135', reps: '10', completed: false },
        { id: '1-2', weight: '155', reps: '8', completed: false },
        { id: '1-3', weight: '185', reps: '6', completed: false },
      ]
    },
    {
      id: '2',
      name: 'Squats',
      sets: [
        { id: '2-1', weight: '185', reps: '10', completed: false },
        { id: '2-2', weight: '225', reps: '8', completed: false },
        { id: '2-3', weight: '245', reps: '6', completed: false },
      ]
    }
  ]);
  
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('brand');
  const subtleBackground = useThemeColor('backgroundSubtleContrast');
  
  // Use the formatted time directly from the context
  const formatTime = () => {
    return elapsedTime;
  };

  const togglePause = () => {
    togglePauseWorkout();
  };

  const handleEndWorkout = () => {
    stopActiveWorkout();
    // Navigate to a specific screen rather than using back()
    router.push('/(tabs)');
  };

  const toggleSetCompleted = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => {
            if (set.id === setId) {
              return { ...set, completed: !set.completed };
            }
            return set;
          })
        };
      }
      return exercise;
    }));
  };
  
  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => {
            if (set.id === setId) {
              return { ...set, [field]: value };
            }
            return set;
          })
        };
      }
      return exercise;
    }));
  };
  
  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSetId = `${exerciseId}-${exercise.sets.length + 1}`;
        
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            { 
              id: newSetId, 
              weight: lastSet?.weight || '0', 
              reps: lastSet?.reps || '0',
              completed: false 
            }
          ]
        };
      }
      return exercise;
    }));
  };
  
  const addExercise = () => {
    const newId = (exercises.length + 1).toString();
    setExercises([
      ...exercises,
      {
        id: newId,
        name: 'New Exercise',
        sets: [
          { id: `${newId}-1`, weight: '0', reps: '0', completed: false }
        ]
      }
    ]);
  };
  
  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === id) {
        return { ...exercise, name };
      }
      return exercise;
    }));
  };
  
  return (
    <PageContainer style={{ backgroundColor: useThemeColor('background') }}>
      <View style={styles.headerSection}>
        <ThemedText style={styles.title}>Current Workout</ThemedText>
        <PlatformPressable 
          onPress={handleEndWorkout}
          style={[styles.endButton, { borderColor: borderColor }]}
        >
          <ThemedText style={styles.endButtonText}>End Workout</ThemedText>
        </PlatformPressable>
      </View>
            
      <View style={styles.workoutNameContainer}>
        <TextInput
          style={styles.workoutNameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor={textColor + '80'}
        />
        <View style={styles.timerContainer}>
          <Clock size={18} color={textColor} />
          <ThemedText style={styles.timerText}>
            {formatTime()}
          </ThemedText>
          <PlatformPressable 
            onPress={togglePause}
            style={[styles.pauseButton, { backgroundColor: accentColor }]}
          >
            {activeWorkout?.isPaused ? (
              <Play size={16} color="#fff" />
            ) : (
              <Pause size={16} color="#fff" />
            )}
          </PlatformPressable>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map((exercise, exerciseIndex) => (
          <View 
            key={exercise.id} 
            style={[styles.exerciseCard, { backgroundColor: subtleBackground }]}
          >
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNameContainer}>
                <ThemedText style={styles.exerciseNumber}>#{exerciseIndex + 1}</ThemedText>
                <TextInput
                  style={styles.exerciseNameInput}
                  value={exercise.name}
                  onChangeText={(text) => updateExerciseName(exercise.id, text)}
                />
              </View>
              <BarChart size={18} color={textColor} />
            </View>
            
            <View style={styles.setsTableHeader}>
              <ThemedText style={[styles.setsTableCell, styles.setsTableHeaderText]}>SET</ThemedText>
              <ThemedText style={[styles.setsTableCell, styles.setsTableHeaderText]}>WEIGHT</ThemedText>
              <ThemedText style={[styles.setsTableCell, styles.setsTableHeaderText]}>REPS</ThemedText>
              <ThemedText style={[styles.setsTableCell, styles.setsTableHeaderText, styles.setsTableCheckColumn]}>✓</ThemedText>
            </View>
            
            {exercise.sets.map((set, setIndex) => (
              <View 
                key={set.id} 
                style={[
                  styles.setRow,
                  set.completed && styles.completedSetRow
                ]}
              >
                <ThemedText style={styles.setsTableCell}>{setIndex + 1}</ThemedText>
                
                <View style={styles.setsTableCell}>
                  <TextInput
                    style={styles.setInput}
                    value={set.weight}
                    onChangeText={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.setsTableCell}>
                  <TextInput
                    style={styles.setInput}
                    value={set.reps}
                    onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                    keyboardType="numeric"
                  />
                </View>
                
                <PlatformPressable 
                  style={[styles.setsTableCell, styles.setsTableCheckColumn]}
                  onPress={() => toggleSetCompleted(exercise.id, set.id)}
                >
                  <View style={[styles.checkbox, set.completed && { backgroundColor: accentColor, borderColor: accentColor }]}>
                    {set.completed && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                </PlatformPressable>
              </View>
            ))}
            
            <PlatformPressable 
              style={styles.addSetButton}
              onPress={() => addSet(exercise.id)}
            >
              <Plus size={16} color={accentColor} />
              <ThemedText style={[styles.addSetText, { color: accentColor }]}>
                Add Set
              </ThemedText>
            </PlatformPressable>
          </View>
        ))}
        
        <PlatformPressable 
          style={[styles.addExerciseButton, { borderColor }]} 
          onPress={addExercise}
        >
          <Plus size={20} color={accentColor} />
          <ThemedText style={[styles.addExerciseText, { color: accentColor }]}>
            Add Exercise
          </ThemedText>
        </PlatformPressable>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: SPACING.pageHorizontal,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  workoutNameContainer: {
    paddingHorizontal: SPACING.pageHorizontal,
    marginBottom: 16,
  },
  workoutNameInput: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  endButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pauseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.pageHorizontal,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  exerciseCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  exerciseNameInput: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  setsTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(140, 140, 140, 0.2)',
    paddingBottom: 8,
    marginBottom: 12,
  },
  setsTableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  setsTableCell: {
    flex: 1,
    alignItems: 'center',
  },
  setsTableCheckColumn: {
    flex: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140, 140, 140, 0.1)',
  },
  completedSetRow: {
    opacity: 0.7,
  },
  setInput: {
    textAlign: 'center',
    minWidth: 50,
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(140, 140, 140, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  addExerciseText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
}); 