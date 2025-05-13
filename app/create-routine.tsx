import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, GestureResponderEvent, PanResponder, Alert, LogBox } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Stack } from 'expo-router';
import { Check, Plus, X, GripVertical, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { ThemedSection } from '@/components/ThemedSection';
import { fetchExercises, searchExercises } from '@/app/services/exerciseService';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Exercise, RoutineData } from '@/types/Exercise';
import ExerciseItem from '@/components/exercise/ExerciseItem';
import RpeTooltip from '@/components/exercise/RpeTooltip';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ROUTINE_DETAILS } from '@/lib/graphql/queries';
import { CREATE_ROUTINE, UPDATE_ROUTINE } from '@/lib/graphql/mutations';
import {
    Routine,
    RoutineType,
    SkillLevel,
    RoutineExercise,
    mapRoutineExerciseToExercise,
    mapExerciseToRoutineExerciseInput
} from '@/lib/graphql/types';

// Temporarily ignore all console logs for debugging
LogBox.ignoreAllLogs();

export default function CreateRoutineScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    // Use a ref to track if we've initialized the data
    const hasInitialized = useRef(false);

    // Check if we're in edit mode
    const isEditMode = params.mode === 'edit';
    const workoutId = params.workoutId as string | undefined;

    // State management
    const [routineName, setRoutineName] = useState('');
    const [routineType, setRoutineType] = useState<RoutineType>(RoutineType.Strength);
    const [routineSkillLevel, setRoutineSkillLevel] = useState<SkillLevel | undefined>(undefined);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [showExerciseDropdown, setShowExerciseDropdown] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [availableExercises, setAvailableExercises] = useState<any[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [routineNameError, setRoutineNameError] = useState(false);
    const [showRpeTooltip, setShowRpeTooltip] = useState<string | null>(null);
    const [showRirTooltip, setShowRirTooltip] = useState<string | null>(null);

    // GraphQL queries and mutations
    const { loading: routineLoading, error: routineError, data: routineData } = useQuery(
        GET_ROUTINE_DETAILS,
        {
            variables: { id: parseInt(workoutId || '0', 10) },
            skip: !isEditMode || !workoutId
        }
    );

    const [createRoutine] = useMutation(CREATE_ROUTINE);
    const [updateRoutine] = useMutation(UPDATE_ROUTINE);

    // Theme colors
    const textColor = useThemeColor('text');
    const textColorMuted = useThemeColor('textMuted');
    const accentColor = useThemeColor('brand');
    const accentTextColor = useThemeColor('brandText');
    const contrastBackgroundColor = useThemeColor('backgroundContrast');
    const subBackgroundColor = useThemeColor('backgroundSubtleContrast');
    const backgroundColor = useThemeColor('background');

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

    // Load workout data from GraphQL if in edit mode
    useEffect(() => {
        if (hasInitialized.current || !isEditMode || !workoutId) return;

        if (routineLoading) return;

        if (routineError) {
            console.error('Error loading routine:', routineError);
            Alert.alert('Error', 'Failed to load routine details');
            return;
        }

        if (routineData?.routine) {
            const routine = routineData.routine;
            setRoutineName(routine.name);
            setRoutineType(routine.type as RoutineType);
            setRoutineSkillLevel(routine.skillLevel as SkillLevel);

            if (routine.routineExercises && routine.routineExercises.length > 0) {
                const routineExercises = routine.routineExercises
                    .sort((a: RoutineExercise, b: RoutineExercise) => a.order - b.order)
                    .map((re: RoutineExercise) => mapRoutineExerciseToExercise(re))
                    .filter(Boolean);

                setExercises(routineExercises);
            }

            hasInitialized.current = true;
        }
    }, [routineData, routineLoading, routineError, isEditMode, workoutId]);

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

    // Exercise management functions
    const addExercise = () => {
        const newExercise = {
            id: Date.now().toString(),
            name: '',
            allSetsEqual: true,
            showRpe: true,
            showExpanded: false,
            rpe: undefined,
            tempo: undefined,
            weight: undefined,
            multipleSets: [{
                setNumber: 1,
                reps: undefined,
                restPause: undefined,
                rpe: undefined,
                tempo: undefined,
                weight: undefined,
                showExpanded: false
            }]
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

    const updateExercise = (id: string, field: string, value: string | number | boolean) => {
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
                            restPause: exercise.multipleSets[0].restPause,
                            rpe: exercise.multipleSets[0].rpe,
                            tempo: exercise.multipleSets[0].tempo,
                            weight: exercise.multipleSets[0].weight,
                            showExpanded: exercise.multipleSets[0].showExpanded
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
                        restPause: prevSet?.restPause,
                        rpe: prevSet?.rpe,
                        tempo: prevSet?.tempo,
                        weight: prevSet?.weight,
                        showExpanded: false
                    });

                    return { ...exercise, multipleSets: newMultipleSets };
                }
                return exercise;
            })
        );
    };

    // Add function to remove a set from an exercise (for swipe to delete)
    const removeSetFromExercise = (exerciseId: string, setIndex: number) => {
        setExercises(
            exercises.map(exercise => {
                if (exercise.id === exerciseId && exercise.multipleSets) {
                    // If this is the last set, switch to all sets equal mode instead of preventing deletion
                    if (exercise.multipleSets.length <= 1) {
                        // Create a default single set mode from the last remaining set
                        return {
                            ...exercise,
                            allSetsEqual: true, // Switch back to all sets equal mode
                            sets: undefined, // Set to undefined instead of 1
                            reps: exercise.multipleSets[0].reps,
                            restPause: exercise.multipleSets[0].restPause,
                            rpe: exercise.multipleSets[0].rpe,
                            rir: exercise.multipleSets[0].rir,
                            tempo: exercise.multipleSets[0].tempo,
                            weight: exercise.multipleSets[0].weight,
                            // Keep the same sets array with just one set
                            multipleSets: [{
                                setNumber: 1,
                                reps: exercise.multipleSets[0].reps,
                                restPause: exercise.multipleSets[0].restPause,
                                rpe: exercise.multipleSets[0].rpe,
                                rir: exercise.multipleSets[0].rir,
                                tempo: exercise.multipleSets[0].tempo,
                                weight: exercise.multipleSets[0].weight,
                                showExpanded: false
                            }]
                        };
                    }

                    // Remove the set at the specified index
                    const updatedSets = [...exercise.multipleSets];
                    updatedSets.splice(setIndex, 1);

                    // Renumber the remaining sets
                    updatedSets.forEach((set, idx) => {
                        set.setNumber = idx + 1;
                    });

                    // Play haptic feedback when a set is removed
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    return { ...exercise, multipleSets: updatedSets };
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

    // Toggle the expanded view for an exercise or a specific set
    const toggleExpandedView = (exerciseId: string, setIndex?: number) => {
        setExercises(
            exercises.map(exercise => {
                if (exercise.id === exerciseId) {
                    if (setIndex !== undefined && exercise.multipleSets) {
                        // Toggle for a specific set in multiple sets mode
                        const updatedSets = [...exercise.multipleSets];
                        if (updatedSets[setIndex]) {
                            updatedSets[setIndex] = {
                                ...updatedSets[setIndex],
                                showExpanded: !updatedSets[setIndex].showExpanded
                            };
                        }
                        return { ...exercise, multipleSets: updatedSets };
                    } else {
                        // Toggle for the whole exercise in single set mode
                        return { ...exercise, showExpanded: !exercise.showExpanded };
                    }
                }
                return exercise;
            })
        );
    };

    // Save and navigation functions
    const handleSave = async () => {
        // Check if routine name is provided (required field)
        if (!routineName.trim()) {
            // Show validation error for routine name
            setRoutineNameError(true);
            return;
        }

        // Check if we have at least one exercise
        if (exercises.length === 0) {
            Alert.alert('Error', 'Please add at least one exercise to your routine');
            return;
        }

        try {
            // Map exercises to the format expected by the GraphQL API
            const exerciseInputs = exercises.map((exercise, index) => {
                // Check if the exercise has a name selected
                if (!exercise.name) {
                    throw new Error(`Exercise #${index + 1} needs a name. Please select an exercise.`);
                }
                return mapExerciseToRoutineExerciseInput(exercise, index);
            });

            // Log what we're sending for debugging
            console.log('Exercise inputs for API:', JSON.stringify(exerciseInputs, null, 2));

            // Prepare common input for both create and update operations
            const routineInput = {
                name: routineName,
                type: routineType,
                skillLevel: routineSkillLevel,
                exercises: exerciseInputs
            };

            // Log the full input
            console.log(`${isEditMode ? 'Updating' : 'Creating'} routine with:`, JSON.stringify(routineInput, null, 2));

            // Execute the appropriate mutation based on whether we're editing or creating
            if (isEditMode && workoutId) {
                try {
                    const result = await updateRoutine({
                        variables: {
                            id: parseInt(workoutId, 10),
                            input: routineInput
                        }
                    });

                    if (result.errors) {
                        console.error('GraphQL errors updating routine:', result.errors);
                        Alert.alert('Error', `Failed to update routine: ${result.errors[0]?.message || 'Unknown error'}`);
                        return;
                    }

                    console.log('Update successful:', result.data);
                } catch (error: any) {
                    // Log detailed error information
                    console.error('Error updating routine:', error);
                    
                    // Try to extract more useful information from the error
                    const errorMessage = error.toString();
                    const networkError = error.networkError 
                        ? `Network error: ${JSON.stringify(error.networkError)}` 
                        : '';
                    const graphQLErrors = error.graphQLErrors 
                        ? `GraphQL errors: ${JSON.stringify(error.graphQLErrors)}` 
                        : '';
                    
                    console.error(`Detailed error: ${errorMessage}\n${networkError}\n${graphQLErrors}`);
                    
                    Alert.alert(
                        'Error', 
                        `Failed to update routine. ${
                            error.graphQLErrors?.[0]?.message || 
                            error.networkError?.result?.errors?.[0]?.message || 
                            error.message || 
                            'Unknown error'
                        }`
                    );
                    return;
                }
            } else {
                try {
                    const result = await createRoutine({
                        variables: {
                            input: routineInput
                        }
                    });

                    if (result.errors) {
                        console.error('GraphQL errors creating routine:', result.errors);
                        Alert.alert('Error', `Failed to create routine: ${result.errors[0]?.message || 'Unknown error'}`);
                        return;
                    }

                    console.log('Create successful:', result.data);
                } catch (error: any) {
                    // Log detailed error information
                    console.error('Error creating routine:', error);
                    
                    // Try to extract more useful information from the error
                    const errorMessage = error.toString();
                    const networkError = error.networkError 
                        ? `Network error: ${JSON.stringify(error.networkError)}` 
                        : '';
                    const graphQLErrors = error.graphQLErrors 
                        ? `GraphQL errors: ${JSON.stringify(error.graphQLErrors)}` 
                        : '';
                    
                    console.error(`Detailed error: ${errorMessage}\n${networkError}\n${graphQLErrors}`);
                    
                    Alert.alert(
                        'Error', 
                        `Failed to create routine. ${
                            error.graphQLErrors?.[0]?.message || 
                            error.networkError?.result?.errors?.[0]?.message || 
                            error.message || 
                            'Unknown error'
                        }`
                    );
                    return;
                }
            }

            // Navigate back on success
            router.back();
        } catch (error: any) {
            console.error('Error saving routine:', error);
            Alert.alert('Error', `An unexpected error occurred: ${error.message || 'Unknown error'}`);
        }
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

    // Handle drag end to update exercises order
    const onDragEnd = ({ data }: { data: Exercise[] }) => {
        // Play haptic feedback on successful reorder
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Update exercises with the new order
        setExercises(data);
    };

    // Render an exercise item for the draggable list
    const renderExerciseItem = ({ item, drag, isActive, getIndex }: RenderItemParams<Exercise>) => {
        const index = getIndex() || 0;

        return (
            <View style={{
                marginBottom: index === exercises.length - 1 ? 0 : SPACING.pageHorizontalInside / 2
            }}>
                {/* Drag handle as a separate component */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onLongPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            // Let the DraggableFlatList handle all the drag logic
                            drag();
                        }}
                        delayLongPress={200}
                        style={{
                            flexDirection: 'row',
                            gap: SPACING.pageHorizontalInside,
                            alignItems: 'center',
                            padding: SPACING.pageHorizontalInside,
                            paddingVertical: SPACING.pageHorizontalInside * 1.3,
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            opacity: isActive ? 0.7 : 1,
                            flex: 1
                        }}
                        activeOpacity={0.7}
                    >
                        <GripVertical
                            size={18}
                            color={isActive ? accentColor : textColorMuted}
                        />
                        <ThemedText style={{ fontSize: 16, color: textColorMuted }}>Exercise #{index + 1}</ThemedText>
                    </TouchableOpacity>
                    {/* Delete Exercise Button */}
                    <TouchableOpacity
                        style={{
                            width: 42,
                            height: 42,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                        }}
                        onPress={() => removeExercise(item.id)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Trash2 size={20} color={textColorMuted} strokeWidth={1.7} />
                    </TouchableOpacity>
                </View>

                {/* Exercise content as a separate component not controlled by drag library */}
                <ExerciseItem
                    item={item}
                    index={index}
                    isActive={isActive}
                    drag={drag}
                    onRemoveExercise={removeExercise}
                    onUpdateExercise={updateExercise}
                    onToggleSetsMode={toggleSetsMode}
                    onAddSetToExercise={addSetToExercise}
                    onUpdateSet={updateSet}
                    onToggleExpandedView={toggleExpandedView}
                    showExerciseDropdown={showExerciseDropdown}
                    setShowExerciseDropdown={setShowExerciseDropdown}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredExercises={filteredExercises}
                    availableExercises={availableExercises}
                    setFilteredExercises={setFilteredExercises}
                    selectExercise={selectExercise}
                    setShowRpeTooltip={setShowRpeTooltip}
                    setShowRirTooltip={setShowRirTooltip}
                    showDragHandle={false} // New prop to hide the drag handle in the component
                    onRemoveSet={removeSetFromExercise}
                />
            </View>
        );
    };

    // Create a header component for the DraggableFlatList
    const ListHeader = () => (
        <View>
            {/* Routine Name Input */}
            <ThemedSection style={styles.nameSection}>
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

            {/* Routine Type Selector */}
            <ThemedText style={[styles.sectionHeader, { color: textColorMuted }]}>Routine Type</ThemedText>
            <View style={styles.typeSection}>
                <View style={styles.typeButtonsContainer}>
                    {Object.values(RoutineType).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.typeButton,
                                { backgroundColor: subBackgroundColor },
                                routineType === type && [styles.selectedTypeButton, { backgroundColor: accentColor }]
                            ]}
                            onPress={() => setRoutineType(type)}
                        >
                            <ThemedText style={[
                                styles.typeButtonText,
                                routineType === type && [styles.selectedTypeButtonText, { color: accentTextColor }]
                            ]}>
                                {type}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Skill Level Selector */}
            <ThemedText style={[styles.sectionHeader, { color: textColorMuted }]}>Skill Level</ThemedText>
            <View style={styles.skillSection}>
                <View style={styles.typeButtonsContainer}>
                    {Object.values(SkillLevel).map((level) => (
                        <TouchableOpacity
                            key={level}
                            style={[
                                styles.typeButton,
                                { backgroundColor: subBackgroundColor },
                                routineSkillLevel === level && [styles.selectedTypeButton, { backgroundColor: accentColor }]
                            ]}
                            onPress={() => setRoutineSkillLevel(
                                routineSkillLevel === level ? undefined : level
                            )}
                        >
                            <ThemedText style={[
                                styles.typeButtonText,
                                routineSkillLevel === level && [styles.selectedTypeButtonText, { color: accentTextColor }]
                            ]}>
                                {level}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Exercises Section Header */}
            <View style={styles.exercisesSection}>
                <ThemedText style={[styles.sectionHeader, { color: textColorMuted }]}>Exercises</ThemedText>
            </View>
        </View>
    );

    // Create a footer component for the DraggableFlatList
    const ListFooter = () => (
        <View>
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

            {/* Extra padding at the bottom */}
            <View style={{ height: 100 }} />
        </View>
    );

    // Loading state
    if (isEditMode && routineLoading) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ThemedText>Loading routine...</ThemedText>
            </ThemedView>
        );
    }

    // Error state
    if (isEditMode && routineError) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <ThemedText style={{ marginBottom: 16, textAlign: 'center' }}>
                    Error loading routine: {routineError.message}
                </ThemedText>
                <TouchableOpacity
                    style={{ padding: 12, backgroundColor: accentColor, borderRadius: 8 }}
                    onPress={() => {
                        // Re-execute the query
                        // Note: This is a placeholder implementation. In a real app, you might want to use a different approach
                        // to re-execute the query, such as using a refetch function or a custom query component
                    }}
                >
                    <ThemedText style={{ color: accentTextColor }}>Retry</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemedView style={[styles.container, { overflow: 'hidden' }]}>
                {/* Hide the default header */}
                <Stack.Screen
                    options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                    }}
                />

                {/* Use StandardHeader component with dynamic title based on edit/create mode */}
                <StandardHeader
                    title={isEditMode ? "Edit Routine" : "Create Routine"}
                    rightContent={closeButton}
                />

                {/* RPE Info Tooltip */}
                <RpeTooltip
                    visible={showRpeTooltip !== null}
                    onClose={() => setShowRpeTooltip(null)}
                    type="rpe"
                />

                {/* RIR Info Tooltip */}
                <RpeTooltip
                    visible={showRirTooltip !== null}
                    onClose={() => setShowRirTooltip(null)}
                    type="rir"
                />

                {/* Direct container instead of PageContainer */}
                <View style={[
                    styles.content,
                    {
                        paddingHorizontal: SPACING.pageHorizontal,
                        paddingTop: insets.top + 35
                    }
                ]}>
                    <DraggableFlatList
                        data={exercises}
                        onDragEnd={onDragEnd}
                        keyExtractor={(item) => item.id}
                        renderItem={renderExerciseItem}
                        ListHeaderComponent={ListHeader}
                        ListFooterComponent={ListFooter}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={8}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={true}
                        activationDistance={0}
                        dragHitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
                        dragItemOverflow={false}
                        autoscrollThreshold={100}
                        simultaneousHandlers={[]}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        removeClippedSubviews={false}
                        updateCellsBatchingPeriod={50}
                        contentContainerStyle={{
                            paddingBottom: insets.bottom + 80
                        }}
                    />
                </View>

                {/* Save button at bottom of screen */}
                <View style={[
                    styles.bottomButtonContainer,
                    {
                        paddingBottom: insets.bottom + 15,
                        backgroundColor: 'transparent',
                    }
                ]}
                    pointerEvents="box-none"
                >
                    <LinearGradient
                        colors={[backgroundColor, 'transparent']}
                        style={styles.gradientBackground}
                        start={{ x: 0.5, y: 1 }}
                        end={{ x: 0.5, y: 0 }}
                        pointerEvents="none"
                    />
                    <PlatformPressable
                        onPress={handleSave}
                        style={[styles.saveButton, { backgroundColor: accentColor }]}
                        pointerEvents="auto"
                    >
                        <Check size={24} color={accentTextColor} />
                        <ThemedText style={[styles.saveButtonText, { color: accentTextColor }]}>
                            {isEditMode ? "Update Routine" : "Save Routine"}
                        </ThemedText>
                    </PlatformPressable>
                </View>
            </ThemedView>
        </GestureHandlerRootView>
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
        marginTop: 24,
        marginBottom: SPACING.pageVertical + 8,
    },
    typeSection: {
        marginBottom: SPACING.pageVertical,
    },
    skillSection: {
        marginBottom: SPACING.pageVertical - 8,
    },
    typeButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        // paddingHorizontal: SPACING.pageHorizontalInside,
        // paddingVertical: SPACING.pageHorizontalInside,
    },
    typeButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedTypeButton: {
        backgroundColor: '#3498db',
    },
    typeButtonText: {
        fontSize: 14,
    },
    selectedTypeButtonText: {
        color: '#ffffff',
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
        marginTop: 14,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 12,
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
    emptyContainer: {
        marginVertical: 40,
        alignItems: 'center',
    },
    emptyListText: {
        textAlign: 'center',
        color: '#888'
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
        zIndex: 5,
    },
    gradientBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: -100,
        bottom: 0,
        zIndex: -1,
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
    }
}); 