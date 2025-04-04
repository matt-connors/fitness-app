import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Modal, Animated as RNAnimated, PanResponder } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Stack } from 'expo-router';
import { Check, Plus, Trash2, X, ChevronDown, Clock, AlignJustify, MoreVertical } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { PageContainer } from '@/components/PageContainer';
import { ThemedSection } from '@/components/ThemedSection';
import { fetchExercises, searchExercises } from '@/app/services/exerciseService';

// Remove the hardcoded exercise data, as we'll fetch from the service

interface Exercise {
  id: string;
  name: string;
  allSetsEqual: boolean;
  sets?: number;
  reps?: number;
  restPause?: number;
  notes?: string;
  // For multiple set case
  multipleSets?: Array<{
    setNumber: number;
    reps?: number;
    restPause?: number;
  }>;
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
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routineNameError, setRoutineNameError] = useState(false);
  
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
  const contrastBackgroundColor = useThemeColor('backgroundContrast');
  const borderStrongerColor = useThemeColor('borderStronger');
  
  // Load exercise data on mount
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      try {
        const data = await fetchExercises();
        setAvailableExercises(data);
        setFilteredExercises(data);
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExercises();
  }, []);
  
  // Initialize with data if available
  useEffect(() => {
    if (routineData) {
      setRoutineName(routineData.name || '');
      // If this was a real app, we'd load exercises for this routine
      // For now, we'll just create a few placeholder exercises
      if (routineData.type === 'Strength') {
        setExercises([
          { id: '1', name: 'Bench Press', sets: 3, reps: 10, allSetsEqual: true, multipleSets: [{ setNumber: 1, reps: 10, restPause: 60 }] },
          { id: '2', name: 'Squats', sets: 4, reps: 8, allSetsEqual: true, multipleSets: [{ setNumber: 1, reps: 8, restPause: 90 }] },
          { id: '3', name: 'Deadlifts', sets: 3, reps: 6, allSetsEqual: true, multipleSets: [{ setNumber: 1, reps: 6, restPause: 120 }] }
        ]);
      } else if (routineData.type === 'Cardio') {
        setExercises([
          { id: '1', name: 'Sprints', sets: 6, reps: 30, allSetsEqual: true, multipleSets: [{ setNumber: 1, reps: 30, restPause: 30 }] },
          { id: '2', name: 'Jump Rope', sets: 3, reps: 60, allSetsEqual: true, multipleSets: [{ setNumber: 1, reps: 60, restPause: 45 }] }
        ]);
      } else if (routineData.type === 'Core') {
        setExercises([
          { id: '1', name: 'Crunches', sets: 3, reps: 15, allSetsEqual: true, multipleSets: [{ setNumber: 1, reps: 15, restPause: 30 }] },
          { id: '2', name: 'Planks', sets: 3, reps: 45, allSetsEqual: true, multipleSets: [{ setNumber: 1, reps: 45, restPause: 30 }] }
        ]);
      }
    }
  }, [routineData]);
  
  // Handle search query changes - use debounce for better performance
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (showExerciseDropdown) {
        setIsLoading(true);
        try {
          const results = await searchExercises(searchQuery);
          setFilteredExercises(results);
        } catch (error) {
          console.error('Error searching exercises:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, showExerciseDropdown]);
  
  const addExercise = () => {
    const newExercise = { 
      id: Date.now().toString(), 
      name: '',
      allSetsEqual: true,
      multipleSets: [{ setNumber: 1, reps: undefined, restPause: undefined }]
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
    // Check if routine name is provided (required field)
    if (!routineName.trim()) {
      // Show validation error for routine name
      setRoutineNameError(true);
      return;
    }
    
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

  const handleRoutineNameChange = (text: string) => {
    setRoutineName(text);
    if (text.trim()) {
      setRoutineNameError(false);
    }
  };

  // Add function to toggle sets mode
  const toggleSetsMode = (id: string, allEqual: boolean) => {
    setExercises(
      exercises.map(exercise => 
        exercise.id === id ? 
          { 
            ...exercise, 
            allSetsEqual: allEqual,
            // If switching to all equal, take values from first set
            ...(allEqual && exercise.multipleSets?.length ? {
              sets: exercise.multipleSets.length,
              reps: exercise.multipleSets[0].reps,
              restPause: exercise.multipleSets[0].restPause
            } : {})
          } : 
          exercise
      )
    );
  };

  // Add function to add a new set to an exercise
  const addSetToExercise = (id: string) => {
    setExercises(
      exercises.map(exercise => {
        if (exercise.id === id) {
          const newMultipleSets = [...(exercise.multipleSets || [])];
          const nextSetNumber = newMultipleSets.length + 1;
          
          // Copy values from previous set as default values
          const prevSet = newMultipleSets[newMultipleSets.length - 1];
          newMultipleSets.push({
            setNumber: nextSetNumber,
            reps: prevSet?.reps,
            restPause: prevSet?.restPause
          });
          
          return { ...exercise, multipleSets: newMultipleSets };
        }
        return exercise;
      })
    );
  };

  // Add function to update a specific set
  const updateSet = (exerciseId: string, setIndex: number, field: string, value: string | number) => {
    setExercises(
      exercises.map(exercise => {
        if (exercise.id === exerciseId && exercise.multipleSets) {
          const updatedSets = [...exercise.multipleSets];
          if (updatedSets[setIndex]) {
            updatedSets[setIndex] = {
              ...updatedSets[setIndex],
              [field]: value
            };
          }
          return { ...exercise, multipleSets: updatedSets };
        }
        return exercise;
      })
    );
  };

  // Add a function to remove a specific set from an exercise
  const removeSetFromExercise = (exerciseId: string, setIndex: number) => {
    setExercises(
      exercises.map(exercise => {
        if (exercise.id === exerciseId && exercise.multipleSets && exercise.multipleSets.length > 1) {
          // Create a copy of the sets array without the removed set
          const updatedSets = [...exercise.multipleSets];
          updatedSets.splice(setIndex, 1);
          
          // Update set numbers to be sequential
          const renumberedSets = updatedSets.map((set, idx) => ({
            ...set,
            setNumber: idx + 1
          }));
          
          return { ...exercise, multipleSets: renumberedSets };
        }
        return exercise;
      })
    );
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
        {/* <ThemedText style={styles.sectionHeader}>Routine Details</ThemedText> */}
        <ThemedSection style={[styles.nameSection]}>
          <TextInput
            style={[
              styles.routineNameInput, 
              { color: textColor },
              routineNameError && styles.inputError
            ]}
            placeholder="Enter routine name"
            placeholderTextColor={textColorMuted}
            value={routineName}
            onChangeText={handleRoutineNameChange}
          />
          {routineNameError && (
            <ThemedText style={styles.errorText}>Routine name is required</ThemedText>
          )}
        </ThemedSection>
        
        {/* Exercises Section */}
        <View style={styles.exercisesSection}>
          <ThemedText style={styles.sectionHeader}>Exercises</ThemedText>
          
          {exercises.map((exercise, index) => (
            <ThemedSection key={exercise.id} style={styles.exerciseSection}>
              <View style={styles.exerciseHeader}>
                {/* Exercise Name Dropdown - now in top left */}
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderColor: borderStrongerColor, 
                    borderWidth: 1, 
                    borderRadius: 10, 
                    height: 42
                  }} 
                  onPress={() => {
                    setSearchQuery('');
                    setFilteredExercises(availableExercises);
                    setShowExerciseDropdown(exercise.id);
                  }}
                >
                  <ThemedText style={exercise.name ? styles.selectedExerciseName : styles.exercisePlaceholder}>
                    {exercise.name || "Select an exercise"}
                  </ThemedText>
                  <ChevronDown size={20} color={textColorMuted} />
                </TouchableOpacity>
                
                {/* Delete Exercise Button - now a small square in top right */}
                <TouchableOpacity 
                  style={[styles.deleteExerciseButton, { backgroundColor: contrastBackgroundColor }]}
                  onPress={() => removeExercise(exercise.id)}
                  hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                >
                  <Trash2 size={20} color={textColor} />
                </TouchableOpacity>
              </View>
              
              {/* Exercise dropdown in a Modal to avoid nesting FlatList in ScrollView */}
              <Modal
                visible={showExerciseDropdown === exercise.id}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowExerciseDropdown(null)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { backgroundColor, borderColor }]}>
                    <View style={styles.modalHeader}>
                      <ThemedText style={styles.modalTitle}>Select Exercise</ThemedText>
                      <TouchableOpacity onPress={() => setShowExerciseDropdown(null)}>
                        <X size={24} color={textColor} />
                      </TouchableOpacity>
                    </View>
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
                    
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={accentColor} />
                      </View>
                    ) : (
                      <FlatList
                        data={filteredExercises}
                        renderItem={renderExerciseItem}
                        keyExtractor={item => item.id}
                        style={styles.dropdownList}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                          <View style={styles.emptyListContainer}>
                            <ThemedText style={styles.emptyListText}>No exercises found</ThemedText>
                          </View>
                        }
                      />
                    )}
                  </View>
                </View>
              </Modal>
              
              {/* Optional Fields - Conditional based on allSetsEqual */}
              <View style={styles.setsToggleContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => toggleSetsMode(exercise.id, !exercise.allSetsEqual)}
                >
                  <View style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                    borderColor: exercise.allSetsEqual ? accentColor : borderStrongerColor,
                    backgroundColor: exercise.allSetsEqual ? accentColor : contrastBackgroundColor,
                  }}>
                    {exercise.allSetsEqual ? 
                      <Check size={14} color={accentTextColor} strokeWidth={2} /> : 
                      <X size={14} color={textColor} strokeWidth={2} />
                    }
                  </View>
                  <ThemedText style={styles.checkboxLabel}>All sets are the same</ThemedText>
                </TouchableOpacity>
              </View>
              
              {exercise.allSetsEqual ? (
                /* Original UI for single set configuration */
                <View style={styles.optionalFieldsRow}>
                  {/* Sets Input */}
                  <View style={styles.optionalField}>
                    <ThemedText style={styles.optionalFieldLabel}>Sets</ThemedText>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        fontSize: 16,
                        color: textColor,
                        borderColor: borderStrongerColor
                      } as React.CSSProperties}
                      keyboardType="number-pad"
                      placeholder="any"
                      placeholderTextColor={textColorMuted}
                      value={exercise.sets?.toString() || ''}
                      onChangeText={(value) => updateExercise(exercise.id, 'sets', parseInt(value) || 0)}
                    />
                  </View>
                  
                  {/* Reps Input */}
                  <View style={styles.optionalField}>
                    <ThemedText style={styles.optionalFieldLabel}>Reps</ThemedText>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        fontSize: 16,
                        color: textColor,
                        borderColor: borderStrongerColor
                      } as React.CSSProperties}
                      keyboardType="number-pad"
                      placeholder="any"
                      placeholderTextColor={textColorMuted}
                      value={exercise.reps?.toString() || ''}
                      onChangeText={(value) => updateExercise(exercise.id, 'reps', parseInt(value) || 0)}
                    />
                  </View>
                  
                  {/* Rest Pause Input */}
                  <View style={styles.optionalField}>
                    <ThemedText style={styles.optionalFieldLabel}>Rest (sec)</ThemedText>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        fontSize: 16,
                        color: textColor,
                        borderColor: borderStrongerColor
                      } as React.CSSProperties}
                      keyboardType="number-pad"
                      placeholder="any"
                      placeholderTextColor={textColorMuted}
                      value={exercise.restPause?.toString() || ''}
                      onChangeText={(value) => updateExercise(exercise.id, 'restPause', parseInt(value) || 0)}
                    />
                  </View>
                </View>
              ) : (
                /* Multiple sets UI with simplified set rows */
                <View>
                  {exercise.multipleSets?.map((set, index) => (
                    <View key={`set-${index}`} style={[styles.optionalFieldsRow, index > 0 && styles.additionalSetRow]}>
                      {/* Set Number Label */}
                      <View style={styles.setNumberContainer}>
                        <ThemedText style={styles.setNumberText}>Set #{set.setNumber}</ThemedText>
                      </View>
                      
                      {/* Reps Input */}
                      <View style={styles.optionalField}>
                        <ThemedText style={styles.optionalFieldLabel}>Reps</ThemedText>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            fontSize: 16,
                            color: textColor,
                            borderColor: borderStrongerColor
                          } as React.CSSProperties}
                          keyboardType="number-pad"
                          placeholder="any"
                          placeholderTextColor={textColorMuted}
                          value={set.reps?.toString() || ''}
                          onChangeText={(value) => updateSet(exercise.id, index, 'reps', parseInt(value) || 0)}
                        />
                      </View>
                      
                      {/* Rest Pause Input */}
                      <View style={styles.optionalField}>
                        <ThemedText style={styles.optionalFieldLabel}>Rest (sec)</ThemedText>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            fontSize: 16,
                            color: textColor,
                            borderColor: borderStrongerColor
                          } as React.CSSProperties}
                          keyboardType="number-pad"
                          placeholder="any"
                          placeholderTextColor={textColorMuted}
                          value={set.restPause?.toString() || ''}
                          onChangeText={(value) => updateSet(exercise.id, index, 'restPause', parseInt(value) || 0)}
                        />
                      </View>
                    </View>
                  ))}
                  
                  {/* Add Set Button */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: contrastBackgroundColor,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      height: 42,
                    }}
                    onPress={() => addSetToExercise(exercise.id)}
                  >
                    <Plus size={18} color={textColor} />
                    <ThemedText style={{ marginLeft: 6, fontWeight: '500' }}>Add Set</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Notes Field */}
              <View style={styles.notesField}>
                <View style={styles.notesLabelRow}>
                  <AlignJustify size={14} color={textColorSubtle} />
                  <ThemedText style={[styles.notesLabel, { color: textColorSubtle }]}>Notes (optional)</ThemedText>
                </View>
                <TextInput
                  style={[styles.notesInput, { color: textColor, borderColor: borderStrongerColor, fontSize: 16 }]}
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
            style={[styles.addExerciseButton, { backgroundColor: contrastBackgroundColor }]}
            onPress={addExercise}
          >
            <Plus size={20} color={textColor} />
            <ThemedText style={[styles.addExerciseText, { color: textColor }]}>
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
    marginTop: 26,
  },
  nameSection: {
  },
  routineNameInput: {
    fontSize: 16,
    fontWeight: '400',
    paddingHorizontal: 12,
    height: 42,
  },
  inputError: {
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: SPACING.pageHorizontalInside,
  },
  exercisesSection: {
    marginBottom: 24,
    marginTop: 24,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 12,
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
    alignItems: 'flex-start',
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
    fontSize: 16,
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
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 42,
    marginTop: 4,
  },
  addExerciseText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '400',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    opacity: 0.7,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  setsToggleContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  setNumberContainer: {
    flex: 1,
    marginRight: 12,
  },
  setNumberText: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 29, // Keep alignment with input fields
  },
  additionalSetRow: {
    marginTop: 8,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
    height: 42,
    borderRadius: 10,
  },
  addSetText: {
    fontSize: 14,
    marginLeft: 8,
  },
  deleteExerciseButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
}); 