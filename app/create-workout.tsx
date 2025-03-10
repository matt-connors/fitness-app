import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Header } from '@/components/ui/Header';
import { Stack } from 'expo-router';
import { ArrowLeft, Check, Plus, Trash2, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

interface WorkoutData {
  id: string;
  name: string;
  type?: string;
  date?: string;
  duration?: string;
}

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const workoutData = params.workout ? JSON.parse(decodeURIComponent(String(params.workout))) as WorkoutData : null;
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('brand');
  const subtleBackground = useThemeColor('backgroundSubtleContrast');
  
  // Initialize with data if available
  useEffect(() => {
    if (workoutData) {
      setWorkoutName(workoutData.name || '');
      // If this was a real app, we'd load exercises for this workout
      // For now, we'll just create a few placeholder exercises
      if (workoutData.type === 'Strength') {
        setExercises([
          { id: '1', name: 'Bench Press', sets: 3, reps: 10 },
          { id: '2', name: 'Squats', sets: 4, reps: 8 },
          { id: '3', name: 'Deadlifts', sets: 3, reps: 6 }
        ]);
      } else if (workoutData.type === 'Cardio') {
        setExercises([
          { id: '1', name: 'Sprints', sets: 6, reps: 30 },
          { id: '2', name: 'Jump Rope', sets: 3, reps: 60 }
        ]);
      } else if (workoutData.type === 'Core') {
        setExercises([
          { id: '1', name: 'Crunches', sets: 3, reps: 15 },
          { id: '2', name: 'Planks', sets: 3, reps: 45 }
        ]);
      }
    }
  }, [workoutData]);
  
  const addExercise = () => {
    setExercises([
      ...exercises,
      { 
        id: Date.now().toString(), 
        name: '', 
        sets: 3, 
        reps: 10 
      }
    ]);
  };
  
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };
  
  const updateExercise = (id: string, field: string, value: string | number) => {
    setExercises(
      exercises.map(exercise => 
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  };
  
  const handleSave = () => {
    // Save workout logic would go here
    router.back();
  };

  const handleDiscard = () => {
    // Just navigate back without saving
    router.back();
  };
  
  return (
    <ThemedView style={styles.container}>
      {/* Hide the default header */}
      <Stack.Screen 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right' 
        }} 
      />
      
      {/* Custom header */}
      <View style={[
        styles.headerContainer, 
        { 
          paddingTop: insets.top || 40,
          paddingBottom: 10,
        }
      ]}>
        <View style={styles.headerRow}>
          {/* Left: Back button */}
          <PlatformPressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={textColor} />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </PlatformPressable>
          
          {/* Center: Title (absolute positioning for perfect centering) */}
          <View style={styles.headerCenter}>
            <ThemedText style={styles.title}>
              {workoutData ? "Edit Workout" : "Create Workout"}
            </ThemedText>
          </View>
          
          {/* Right: X button */}
          <PlatformPressable onPress={handleDiscard} style={styles.closeButton}>
            <X size={24} color={textColor} />
          </PlatformPressable>
        </View>
      </View>
      
      <ScrollView 
        style={[styles.content, { marginTop: insets.top + 50 }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.label}>Workout Name</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor }]}
            placeholder="Enter workout name"
            placeholderTextColor={textColor + '80'}
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Exercises</ThemedText>
          
          {exercises.map((exercise, index) => (
            <View 
              key={exercise.id} 
              style={[
                styles.exerciseCard, 
                { backgroundColor: subtleBackground, borderColor }
              ]}
            >
              <View style={styles.exerciseHeader}>
                <ThemedText style={styles.exerciseNumber}>#{index + 1}</ThemedText>
                <PlatformPressable 
                  onPress={() => removeExercise(exercise.id)}
                  hitSlop={10}
                >
                  <Trash2 size={20} color={textColor} />
                </PlatformPressable>
              </View>
              
              <TextInput
                style={[styles.exerciseInput, { color: textColor }]}
                placeholder="Exercise name"
                placeholderTextColor={textColor + '80'}
                value={exercise.name}
                onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
              />
              
              <View style={styles.exerciseMeta}>
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Sets</ThemedText>
                  <TextInput
                    style={[styles.metaInput, { color: textColor, borderColor }]}
                    keyboardType="number-pad"
                    value={exercise.sets.toString()}
                    onChangeText={(value) => updateExercise(exercise.id, 'sets', parseInt(value) || 0)}
                  />
                </View>
                
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Reps</ThemedText>
                  <TextInput
                    style={[styles.metaInput, { color: textColor, borderColor }]}
                    keyboardType="number-pad"
                    value={exercise.reps.toString()}
                    onChangeText={(value) => updateExercise(exercise.id, 'reps', parseInt(value) || 0)}
                  />
                </View>
              </View>
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
        </View>
      </ScrollView>
      
      {/* Save button at bottom of screen */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 15 }]}>
        <PlatformPressable 
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: accentColor }]}
        >
          <Check size={20} color="#fff" />
          <ThemedText style={styles.saveButtonText}>Save Workout</ThemedText>
        </PlatformPressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140, 140, 140, 0.2)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.pageHorizontal,
    height: 44,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButton: {
    padding: 4,
    zIndex: 1,
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.pageHorizontal,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  exerciseInput: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  exerciseMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    marginRight: 24,
  },
  metaLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  metaInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addExerciseText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  bottomButtonContainer: {
    padding: SPACING.pageHorizontal,
    paddingBottom: 20,
    marginBottom: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
}); 