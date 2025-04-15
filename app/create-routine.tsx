import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
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

export default function CreateRoutineScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const routineData = params.workout ? JSON.parse(decodeURIComponent(String(params.workout))) as RoutineData : null;

    // State management
    const [routineName, setRoutineName] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [showExerciseDropdown, setShowExerciseDropdown] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [availableExercises, setAvailableExercises] = useState<any[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [routineNameError, setRoutineNameError] = useState(false);
    const [showRpeTooltip, setShowRpeTooltip] = useState<string | null>(null);

    // Theme colors
    const textColor = useThemeColor('text');
    const textColorMuted = useThemeColor('textMuted');
    const accentColor = useThemeColor('brand');
    const accentTextColor = useThemeColor('brandText');
    const contrastBackgroundColor = useThemeColor('backgroundContrast');
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

    // Initialize with data if available
    useEffect(() => {
        if (routineData) {
            setRoutineName(routineData.name || '');
            // If this was a real app, we'd load exercises for this routine
            // For now, we'll just create a few placeholder exercises
            if (routineData.type === 'Strength') {
                setExercises([
                    { id: '1', name: 'Bench Press', sets: 3, reps: 10, allSetsEqual: true, showRpe: true, rpe: 7, showExpanded: false, multipleSets: [{ setNumber: 1, reps: 10, restPause: 60, rpe: 7, tempo: 0, weight: 135, showExpanded: false }] },
                    { id: '2', name: 'Squats', sets: 4, reps: 8, allSetsEqual: true, showRpe: true, rpe: 8, showExpanded: false, multipleSets: [{ setNumber: 1, reps: 8, restPause: 90, rpe: 8, tempo: 0, weight: 185, showExpanded: false }] },
                    { id: '3', name: 'Deadlifts', sets: 3, reps: 6, allSetsEqual: true, showRpe: true, rpe: 9, showExpanded: false, multipleSets: [{ setNumber: 1, reps: 6, restPause: 120, rpe: 9, tempo: 0, weight: 225, showExpanded: false }] }
                ]);
            } else if (routineData.type === 'Cardio') {
                setExercises([
                    { id: '1', name: 'Sprints', sets: 6, reps: 30, allSetsEqual: true, showRpe: true, rpe: 7, showExpanded: false, multipleSets: [{ setNumber: 1, reps: 30, restPause: 30, rpe: 7, tempo: 0, weight: 0, showExpanded: false }] },
                    { id: '2', name: 'Jump Rope', sets: 3, reps: 60, allSetsEqual: true, showRpe: true, rpe: 6, showExpanded: false, multipleSets: [{ setNumber: 1, reps: 60, restPause: 45, rpe: 6, tempo: 0, weight: 0, showExpanded: false }] }
                ]);
            } else if (routineData.type === 'Core') {
                setExercises([
                    { id: '1', name: 'Crunches', sets: 3, reps: 15, allSetsEqual: true, showRpe: true, rpe: 6, showExpanded: false, multipleSets: [{ setNumber: 1, reps: 15, restPause: 30, rpe: 6, tempo: 0, weight: 0, showExpanded: false }] },
                    { id: '2', name: 'Planks', sets: 3, reps: 45, allSetsEqual: true, showRpe: true, rpe: 8, showExpanded: false, multipleSets: [{ setNumber: 1, reps: 45, restPause: 30, rpe: 8, tempo: 0, weight: 0, showExpanded: false }] }
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
            <View style={{ marginBottom: SPACING.pageHorizontalInside }}>
                {/* Drag handle as a separate component */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPressIn={(e) => {
                            e.stopPropagation();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            drag();
                        }}
                        style={{
                            flexDirection: 'row',
                            gap: SPACING.pageHorizontalInside,
                            alignItems: 'center',
                            // marginBottom: SPACING.pageHorizontalInside,
                            padding: SPACING.pageHorizontalInside,
                            paddingVertical: SPACING.pageHorizontalInside * 1.4,
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            opacity: isActive ? 0.7 : 1,
                            flex: 1
                        }}
                        delayLongPress={100}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                            // backgroundColor: contrastBackgroundColor
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
                    showDragHandle={false} // New prop to hide the drag handle in the component
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

            {/* Exercises Section Header */}
            {/* <View style={styles.exercisesSection}>
                <ThemedText style={styles.sectionHeader}>Exercises</ThemedText>
            </View> */}
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

    // Render an empty state component when there are no exercises
    const EmptyList = () => (
        <View style={{
            paddingTop: 8,
            paddingBottom: SPACING.pageHorizontalInside
        }}>
            <View style={styles.exercisesSection}>
                <ThemedText style={styles.sectionHeader}>Exercises</ThemedText>
            </View>
        </View>
    );

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

                {/* Use StandardHeader component */}
                <StandardHeader
                    title={routineData ? "Edit Routine" : "Create Routine"}
                    rightContent={closeButton}
                />

                {/* RPE Info Tooltip */}
                <RpeTooltip
                    visible={showRpeTooltip !== null}
                    onClose={() => setShowRpeTooltip(null)}
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
                        ListEmptyComponent={EmptyList}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={8}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={true}
                        activationDistance={10}
                        dragHitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        dragItemOverflow={true}
                        autoscrollThreshold={80}
                        simultaneousHandlers={[]}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        removeClippedSubviews={false}
                        updateCellsBatchingPeriod={50}
                        onScroll={() => {}}
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
                        <ThemedText style={[styles.saveButtonText, { color: accentTextColor }]}>Save Routine</ThemedText>
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
        marginBottom: SPACING.pageHorizontalInside,
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
        // marginTop: 14,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '500',
        // marginBottom: 12,
        color: '#888',
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