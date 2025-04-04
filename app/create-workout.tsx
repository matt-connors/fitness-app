import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Stack } from 'expo-router';
import { Check, Plus, Trash2, X, ChevronDown, Clock, AlignJustify } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { PageContainer } from '@/components/PageContainer';
import { ThemedSection } from '@/components/ThemedSection';

// Mock exercise data for testing (to be replaced with API fetch and caching)
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

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  restPause?: number;
  notes?: string;
}

interface RoutineData {
  id: string;
  name: string;
  type?: string;
  date?: string;
  duration?: string;
}

export default function CreateRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const routineData = params.workout ? JSON.parse(decodeURIComponent(String(params.workout))) as RoutineData : null;
  
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme colors
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const textColorSubtle = useThemeColor('textSecondary');
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('brand');
  const accentTextColor = useThemeColor('brandText');
  const subtleBackground = useThemeColor('backgroundSubtleContrast');
  const cardBgColor = useThemeColor('backgroundContrast');
  const backgroundColor = useThemeColor('background');
  
  // Initialize with data if available
  useEffect(() => {
    if (routineData) {
      setRoutineName(routineData.name || '');
      // If this was a real app, we'd load exercises for this routine
      // For now, we'll just create a few placeholder exercises
      if (routineData.type === 'Strength') {
        setExercises([
          { id: '1', name: 'Bench Press', sets: 3, reps: 10 },
          { id: '2', name: 'Squats', sets: 4, reps: 8 },
          { id: '3', name: 'Deadlifts', sets: 3, reps: 6 }
        ]);
      } else if (routineData.type === 'Cardio') {
        setExercises([
          { id: '1', name: 'Sprints', sets: 6, reps: 30 },
          { id: '2', name: 'Jump Rope', sets: 3, reps: 60 }
        ]);
      } else if (routineData.type === 'Core') {
        setExercises([
          { id: '1', name: 'Crunches', sets: 3, reps: 15 },
          { id: '2', name: 'Planks', sets: 3, reps: 45 }
        ]);
      }
    }
  }, [routineData]);

  // Filter exercises based on search query
  const filteredExercises = EXERCISE_DATA.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const addExercise = () => {
    const newExercise = { 
      id: Date.now().toString(), 
      name: '', 
    };
    setExercises([...exercises, newExercise]);
    // Open dropdown for the new exercise
    setTimeout(() => {
      setShowExerciseDropdown(newExercise.id);
    }, 100);
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

  const selectExercise = (exerciseId: string, selectedExercise: any) => {
    updateExercise(exerciseId, 'name', selectedExercise.name);
    setShowExerciseDropdown(null);
    setSearchQuery('');
  };
  
  const handleSave = () => {
    // Save routine logic would go here
    router.back();
  };

  const handleDiscard = () => {
    // Just navigate back without saving
    router.back();
  };
  
  // Create the close button for the header
  const closeButton = (
    <TouchableOpacity onPress={handleDiscard}>
      <X size={26} color={textColor} strokeWidth={1.7} />
    </TouchableOpacity>
  );

  // Render an exercise item in the dropdown
  const renderExerciseItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.exerciseDropdownItem}
      onPress={() => selectExercise(showExerciseDropdown!, item)}
    >
      <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
      <ThemedText style={[styles.exerciseDetails, { color: textColorSubtle }]}>
        {item.muscle} • {item.equipment}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Hide the default header */}
      <Stack.Screen 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right' 
        }} 
      />
      
      {/* Use StandardHeader component */}
      <StandardHeader
        title={routineData ? "Edit Routine" : "Create Routine"}
        rightContent={closeButton}
      />
      
      <PageContainer
        hasHeader={true}
        style={styles.content}
      >
        {/* Routine Name Input - styled like library page */}
        <ThemedSection style={styles.nameSection}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Routine Name</ThemedText>
            <TextInput
              style={[styles.routineNameInput, { color: textColor }]}
              placeholder="Enter routine name"
              placeholderTextColor={textColorMuted}
              value={routineName}
              onChangeText={setRoutineName}
            />
          </View>
        </ThemedSection>
        
        {/* Exercises Section */}
        <View style={styles.exercisesSection}>
          <ThemedText style={styles.sectionHeader}>Exercises</ThemedText>
          
          {exercises.map((exercise, index) => (
            <ThemedSection key={exercise.id} style={styles.exerciseSection}>
              <View style={styles.exerciseHeader}>
                <ThemedText style={styles.exerciseNumber}>#{index + 1}</ThemedText>
                <TouchableOpacity 
                  onPress={() => removeExercise(exercise.id)}
                  hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                >
                  <Trash2 size={20} color={textColor} />
                </TouchableOpacity>
              </View>
              
              {/* Exercise Name Dropdown */}
              <TouchableOpacity 
                style={[styles.exerciseNameInput, { borderColor }]} 
                onPress={() => setShowExerciseDropdown(exercise.id)}
              >
                <ThemedText style={exercise.name ? styles.selectedExerciseName : styles.exercisePlaceholder}>
                  {exercise.name || "Select an exercise"}
                </ThemedText>
                <ChevronDown size={20} color={textColorMuted} />
              </TouchableOpacity>
              
              {showExerciseDropdown === exercise.id && (
                <View style={[styles.dropdownContainer, { backgroundColor, borderColor }]}>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={[styles.searchInput, { color: textColor }]}
                      placeholder="Search exercises..."
                      placeholderTextColor={textColorMuted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoFocus
                    />
                  </View>
                  <FlatList
                    data={filteredExercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id}
                    style={styles.dropdownList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}
              
              {/* Optional Fields Row */}
              <View style={styles.optionalFieldsRow}>
                {/* Sets Input */}
                <View style={styles.optionalField}>
                  <ThemedText style={styles.optionalFieldLabel}>Sets</ThemedText>
                  <TextInput
                    style={[styles.optionalFieldInput, { color: textColor, borderColor }]}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={textColorMuted}
                    value={exercise.sets?.toString() || ''}
                    onChangeText={(value) => updateExercise(exercise.id, 'sets', parseInt(value) || 0)}
                  />
                </View>
                
                {/* Reps Input */}
                <View style={styles.optionalField}>
                  <ThemedText style={styles.optionalFieldLabel}>Reps</ThemedText>
                  <TextInput
                    style={[styles.optionalFieldInput, { color: textColor, borderColor }]}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={textColorMuted}
                    value={exercise.reps?.toString() || ''}
                    onChangeText={(value) => updateExercise(exercise.id, 'reps', parseInt(value) || 0)}
                  />
                </View>
                
                {/* Rest Pause Input */}
                <View style={styles.optionalField}>
                  <ThemedText style={styles.optionalFieldLabel}>Rest (sec)</ThemedText>
                  <TextInput
                    style={[styles.optionalFieldInput, { color: textColor, borderColor }]}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={textColorMuted}
                    value={exercise.restPause?.toString() || ''}
                    onChangeText={(value) => updateExercise(exercise.id, 'restPause', parseInt(value) || 0)}
                  />
                </View>
              </View>
              
              {/* Notes Field */}
              <View style={styles.notesField}>
                <View style={styles.notesLabelRow}>
                  <AlignJustify size={14} color={textColorSubtle} />
                  <ThemedText style={[styles.notesLabel, { color: textColorSubtle }]}>Notes (optional)</ThemedText>
                </View>
                <TextInput
                  style={[styles.notesInput, { color: textColor, borderColor }]}
                  placeholder="Add notes about this exercise..."
                  placeholderTextColor={textColorMuted}
                  multiline
                  numberOfLines={3}
                  value={exercise.notes || ''}
                  onChangeText={(value) => updateExercise(exercise.id, 'notes', value)}
                />
              </View>
            </ThemedSection>
          ))}
          
          {/* Add Exercise Button */}
          <TouchableOpacity
            style={[styles.addExerciseButton, { backgroundColor: subtleBackground }]}
            onPress={addExercise}
          >
            <Plus size={20} color={accentColor} />
            <ThemedText style={[styles.addExerciseText, { color: accentColor }]}>
              Add Exercise
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Add padding at the bottom to ensure content isn't hidden behind save button */}
        <View style={{ height: 80 }} />
      </PageContainer>
      
      {/* Save button at bottom of screen - add background color dynamically */}
      <View style={[
        styles.bottomButtonContainer, 
        { 
          paddingBottom: insets.bottom + 15,
          backgroundColor: subtleBackground + 'F2' // Apply semi-transparent background dynamically
        }
      ]}>
        <PlatformPressable 
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: accentColor }]}
        >
          <Check size={24} color={accentTextColor}/>
          <ThemedText style={[styles.saveButtonText, { color: accentTextColor }]}>Save Routine</ThemedText>
        </PlatformPressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  nameSection: {
    marginBottom: 24,
  },
  inputContainer: {
    padding: SPACING.pageHorizontalInside,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    color: '#888',
  },
  routineNameInput: {
    fontSize: 16,
    fontWeight: '400',
    padding: 0,
  },
  exercisesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    color: '#888',
  },
  exerciseSection: {
    marginBottom: 16,
    paddingHorizontal: SPACING.pageHorizontalInside,
    paddingVertical: SPACING.pageHorizontalInside,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  exerciseNameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 16,
  },
  selectedExerciseName: {
    fontSize: 16,
    fontWeight: '400',
  },
  exercisePlaceholder: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.5,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    fontSize: 14,
    padding: 0,
  },
  dropdownList: {
    maxHeight: 150,
  },
  exerciseDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  optionalFieldsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionalField: {
    flex: 1,
    marginRight: 12,
  },
  optionalFieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: '#888',
  },
  optionalFieldInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
  },
  notesField: {
    marginTop: 4,
  },
  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  addExerciseText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '400',
  },
  bottomButtonContainer: {
    padding: SPACING.pageHorizontal,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backdropFilter: 'blur(8px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5, // Ensure it's above the PageContainer
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
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 16,
  },
}); 