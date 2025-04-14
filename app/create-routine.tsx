import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Modal, Animated as RNAnimated, PanResponder } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Stack } from 'expo-router';
import { Check, Plus, Trash2, X, ChevronDown, Clock, AlignJustify, MoreVertical, ChevronRight, HelpCircle, Search } from 'lucide-react-native';
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
    showRpe: boolean; // New flag to toggle between RPE and weight
    sets?: number;
    reps?: number;
    restPause?: number;
    rpe?: number;
    tempo?: number;
    weight?: number;
    showExpanded?: boolean;
    notes?: string;
    // For multiple set case
    multipleSets?: Array<{
        setNumber: number;
        reps?: number;
        restPause?: number;
        rpe?: number;
        tempo?: number;
        weight?: number;
        showExpanded?: boolean;
    }>;
}

interface RoutineData {
    id: string;
    name: string;
    type?: string;
    date?: string;
    duration?: string;
}

// Add a Tooltip component for RPE explanation
const RpeTooltip = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const tooltipBg = useThemeColor('backgroundContrast');
    const textColor = useThemeColor('text');

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={{
                    backgroundColor: tooltipBg,
                    borderRadius: 12,
                    padding: 16,
                    width: '80%',
                    maxWidth: 300,
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <ThemedText style={{ fontWeight: '600', fontSize: 16 }}>Rate of Perceived Exertion (RPE)</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <X size={20} color={textColor} />
                        </TouchableOpacity>
                    </View>
                    <ThemedText style={{ marginBottom: 8 }}>
                        RPE is a scale from 1-10 that measures how difficult an exercise feels.
                    </ThemedText>
                    <ThemedText>
                        • 10 = Maximum effort (couldn't do more reps)
                    </ThemedText>
                    <ThemedText>
                        • 7-9 = Hard but manageable
                    </ThemedText>
                    <ThemedText>
                        • 4-6 = Moderate effort
                    </ThemedText>
                    <ThemedText>
                        • 1-3 = Very easy
                    </ThemedText>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

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
    const [showRpeTooltip, setShowRpeTooltip] = useState<string | null>(null);

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
    const renderExerciseItem = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.pageHorizontalInside,
                paddingHorizontal: 16,
                borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
                borderTopColor: borderColor
            }}
            onPress={() => selectExercise(showExerciseDropdown!, item)}
        >
            <View style={{
                flex: 1,
                justifyContent: 'center'
            }}>
                <ThemedText style={{
                    fontSize: 16,
                    fontWeight: '400',
                    lineHeight: 20,
                    marginBottom: 3,
                }} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                </ThemedText>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <ThemedText style={{
                        fontSize: 12,
                        lineHeight: 16,
                        color: textColorSubtle
                    }} numberOfLines={1} ellipsizeMode="tail">
                        {item.muscle} • {item.equipment}
                    </ThemedText>
                </View>
            </View>
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

    // Add a function to remove a specific set from an exercise
    const removeSetFromExercise = (exerciseId: string, setIndex: number) => {
        // Get the exercise
        const exercise = exercises.find(ex => ex.id === exerciseId);

        // If this is the last set (set #1), remove the entire exercise
        if (exercise?.multipleSets?.length === 1 && exercise.multipleSets[0].setNumber === 1) {
            removeExercise(exerciseId);
            return;
        }

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

    // Toggle between RPE and weight input
    const toggleInputMode = (id: string) => {
        setExercises(
            exercises.map(exercise =>
                exercise.id === id ? { ...exercise, showRpe: !exercise.showRpe } : exercise
            )
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

            {/* RPE Info Tooltip */}
            <RpeTooltip
                visible={showRpeTooltip !== null}
                onClose={() => setShowRpeTooltip(null)}
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
                                        height: 42,
                                        flex: 1,
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
                                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                >
                                    <Trash2 size={20} color={textColor} />
                                </TouchableOpacity>
                            </View>

                            {/* Exercise dropdown in a Modal to avoid nesting FlatList in ScrollView */}
                            <Modal
                                visible={showExerciseDropdown === exercise.id}
                                transparent={true}
                                animationType="none"
                                onRequestClose={() => setShowExerciseDropdown(null)}
                            >
                                <View style={styles.modalOverlay}>
                                    <View style={[styles.modalContent, {
                                        backgroundColor,
                                        borderColor: borderStrongerColor,
                                        borderRadius: 12,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 6,
                                        elevation: 5
                                    }]}>


                                        <View style={[styles.searchInputContainer, {
                                            backgroundColor: 'transparent',
                                            borderColor,
                                            marginBottom: SPACING.pageHorizontalInside
                                        }]}>
                                            <Search size={18} color={textColorMuted} style={styles.searchIcon} />
                                            <TextInput
                                                style={[styles.searchInput, { color: textColor }]}
                                                placeholder="Search routines..."
                                                placeholderTextColor={textColorMuted} // 50% opacity
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                                returnKeyType="search"
                                                autoCorrect={false}
                                            />
                                        </View>

                                        {/* <View style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 12
                                        }}>
                                            <TextInput
                                                style={{
                                                    fontSize: 16,
                                                    padding: 0,
                                                    color: textColor
                                                }}
                                                placeholder="Search exercises..."
                                                placeholderTextColor={textColorMuted}
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                                autoFocus={false}
                                            />
                                        </View> */}
                                        <ThemedSection>
                                            <FlatList
                                                data={filteredExercises}
                                                renderItem={renderExerciseItem}
                                                keyExtractor={item => item.id}
                                                // style={{ maxHeight: '80%' }}
                                                keyboardShouldPersistTaps="handled"
                                                initialNumToRender={10}
                                                maxToRenderPerBatch={10}
                                                windowSize={10}
                                                removeClippedSubviews={true}
                                                ListEmptyComponent={
                                                    <View style={{
                                                        padding: 20,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        height: 120
                                                    }}>
                                                        <ThemedText style={{
                                                            fontSize: 15,
                                                            textAlign: 'center',
                                                            color: textColorMuted
                                                        }}>
                                                            {searchQuery
                                                                ? "No exercises found matching your search"
                                                                : "Start typing to search exercises"}
                                                        </ThemedText>
                                                    </View>
                                                }
                                            />
                                        </ThemedSection>

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
                                <View>
                                    <View style={styles.optionalFieldsRow}>
                                        {/* Sets Input */}
                                        <View style={styles.optionalField}>
                                            <ThemedText style={[styles.optionalFieldLabel, { color: textColorMuted }]}>Sets</ThemedText>
                                            <TextInput
                                                style={{
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    fontSize: 16,
                                                    color: textColor,
                                                    borderColor: borderStrongerColor
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="any"
                                                placeholderTextColor={textColorMuted}
                                                value={exercise.sets?.toString() || ''}
                                                onChangeText={(value) => updateExercise(exercise.id, 'sets', parseInt(value) || 0)}
                                            />
                                        </View>

                                        {/* Reps Input */}
                                        <View style={styles.optionalField}>
                                            <ThemedText style={[styles.optionalFieldLabel, { color: textColorMuted }]}>Reps</ThemedText>
                                            <TextInput
                                                style={{
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    fontSize: 16,
                                                    color: textColor,
                                                    borderColor: borderStrongerColor
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="any"
                                                placeholderTextColor={textColorMuted}
                                                value={exercise.reps?.toString() || ''}
                                                onChangeText={(value) => updateExercise(exercise.id, 'reps', parseInt(value) || 0)}
                                            />
                                        </View>

                                        {/* RPE or Weight Input based on showRpe */}
                                        <View style={styles.optionalField}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <ThemedText style={[styles.optionalFieldLabel, { color: textColorMuted }]}>
                                                    {exercise.showRpe ? "RPE %" : "Weight (lbs)"}
                                                </ThemedText>
                                                {exercise.showRpe && (
                                                    <TouchableOpacity
                                                        onPress={() => setShowRpeTooltip(exercise.id)}
                                                        style={{ marginLeft: 4, padding: 2 }}
                                                    >
                                                        <HelpCircle size={14} color={textColorMuted} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <TextInput
                                                style={{
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    fontSize: 16,
                                                    color: textColor,
                                                    borderColor: borderStrongerColor
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="any"
                                                placeholderTextColor={textColorMuted}
                                                value={exercise.showRpe
                                                    ? exercise.rpe?.toString() || ''
                                                    : exercise.weight?.toString() || ''}
                                                onChangeText={(value) => {
                                                    const intValue = parseInt(value) || 0;
                                                    if (exercise.showRpe) {
                                                        updateExercise(exercise.id, 'rpe', intValue);
                                                    } else {
                                                        updateExercise(exercise.id, 'weight', intValue);
                                                    }
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                /* Multiple sets UI with simplified set rows */
                                <View>
                                    {/* Header row - only shown once */}
                                    <View style={styles.headerRow}>
                                        <View style={styles.setNumberContainer}>
                                            {/* No heading for Set # column */}
                                        </View>
                                        <View style={styles.columnHeader}>
                                            <ThemedText style={styles.columnHeaderText}>Reps</ThemedText>
                                        </View>
                                        <View style={styles.columnHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <ThemedText style={styles.columnHeaderText}>
                                                    {exercise.showRpe ? "RPE %" : "Weight (lbs)"}
                                                </ThemedText>
                                                {exercise.showRpe && (
                                                    <TouchableOpacity
                                                        onPress={() => setShowRpeTooltip(exercise.id)}
                                                        style={{ marginLeft: 4, padding: 2 }}
                                                    >
                                                        <HelpCircle size={14} color={textColorMuted} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {exercise.multipleSets?.map((set, index) => (
                                        <View key={`set-${index}`}>
                                            <View style={[styles.optionalFieldsRow, index > 0 && styles.additionalSetRow]}>
                                                {/* Set Number Label */}
                                                <View style={styles.setNumberContainer}>
                                                    <ThemedText style={styles.setNumberText}>Set #{set.setNumber}</ThemedText>
                                                </View>

                                                {/* Reps Input */}
                                                <View style={styles.optionalField}>
                                                    <TextInput
                                                        style={{
                                                            borderWidth: 1,
                                                            borderRadius: 6,
                                                            paddingHorizontal: 12,
                                                            paddingVertical: 6,
                                                            fontSize: 16,
                                                            color: textColor,
                                                            borderColor: borderStrongerColor
                                                        }}
                                                        keyboardType="number-pad"
                                                        placeholder="any"
                                                        placeholderTextColor={textColorMuted}
                                                        value={set.reps?.toString() || ''}
                                                        onChangeText={(value) => updateSet(exercise.id, index, 'reps', parseInt(value) || 0)}
                                                    />
                                                </View>

                                                {/* RPE or Weight Input based on showRpe */}
                                                <View style={styles.optionalField}>
                                                    <TextInput
                                                        style={{
                                                            borderWidth: 1,
                                                            borderRadius: 6,
                                                            paddingHorizontal: 12,
                                                            paddingVertical: 6,
                                                            fontSize: 16,
                                                            color: textColor,
                                                            borderColor: borderStrongerColor
                                                        }}
                                                        keyboardType="number-pad"
                                                        placeholder="any"
                                                        placeholderTextColor={textColorMuted}
                                                        value={exercise.showRpe
                                                            ? set.rpe?.toString() || ''
                                                            : set.weight?.toString() || ''}
                                                        onChangeText={(value) => {
                                                            const intValue = parseInt(value) || 0;
                                                            if (exercise.showRpe) {
                                                                updateSet(exercise.id, index, 'rpe', intValue);
                                                            } else {
                                                                updateSet(exercise.id, index, 'weight', intValue);
                                                            }
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Add Set Button */}
                                    <TouchableOpacity
                                        style={[styles.addExerciseButton, {
                                            backgroundColor: contrastBackgroundColor,
                                            marginBottom: 16
                                        }]}
                                        onPress={() => addSetToExercise(exercise.id)}
                                    >
                                        <Plus size={20} color={textColor} />
                                        <ThemedText style={[styles.addExerciseText, { color: textColor }]}>
                                            Add Set
                                        </ThemedText>
                                    </TouchableOpacity>
                                    {/* <TouchableOpacity
                    style={{
                      backgroundColor: contrastBackgroundColor,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      height: 42,
                      marginBottom: 16,
                    }}
                    onPress={() => addSetToExercise(exercise.id)}
                  >
                    <Plus size={18} color={textColor} />
                    <ThemedText style={{ marginLeft: 6, fontWeight: '500' }}>Add Set</ThemedText>
                  </TouchableOpacity> */}
                                </View>
                            )}

                            {/* Expand/collapse button for additional options - moved here for both modes */}
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    // marginTop: 16,
                                    marginVertical: 4,
                                    padding: 4
                                }}
                                onPress={() => toggleExpandedView(exercise.id)}
                            >
                                <ThemedText style={{
                                    color: textColorMuted,
                                    fontSize: 16,
                                    marginRight: 4
                                }}>
                                    {exercise.showExpanded ? "Hide" : "Show"} additional options
                                </ThemedText>
                                <ChevronDown
                                    size={18}
                                    strokeWidth={1.9}
                                    color={textColorMuted}
                                    style={{
                                        transform: [{ rotate: exercise.showExpanded ? '180deg' : '0deg' }]
                                    }}
                                />
                            </TouchableOpacity>

                            {/* Expanded additional options - common for both modes */}
                            {exercise.showExpanded && (
                                <View style={styles.expandedFieldsContainer}>
                                    RPE/Weight toggle
                                    {/* <View style={styles.setsToggleContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => toggleInputMode(exercise.id)}
                >
                  <View style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                    borderColor: exercise.showRpe ? accentColor : borderStrongerColor,
                    backgroundColor: exercise.showRpe ? accentColor : contrastBackgroundColor,
                  }}>
                    {exercise.showRpe ? 
                      <Check size={14} color={accentTextColor} strokeWidth={2} /> : 
                      <X size={14} color={textColor} strokeWidth={2} />
                    }
                  </View>
                  <ThemedText style={styles.checkboxLabel}>Use RPE instead of weight</ThemedText>
                </TouchableOpacity>
              </View> */}
                                    <View style={styles.optionalFieldsRow}>
                                        {/* Rest Pause Input */}
                                        <View style={styles.optionalField}>
                                            <ThemedText style={[styles.optionalFieldLabel, { color: textColorMuted }]}>Rest (sec)</ThemedText>
                                            <TextInput
                                                style={{
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    fontSize: 16,
                                                    color: textColor,
                                                    borderColor: borderStrongerColor
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="any"
                                                placeholderTextColor={textColorMuted}
                                                value={exercise.restPause?.toString() || ''}
                                                onChangeText={(value) => updateExercise(exercise.id, 'restPause', parseInt(value) || 0)}
                                            />
                                        </View>

                                        {/* Tempo Input */}
                                        <View style={styles.optionalField}>
                                            <ThemedText style={[styles.optionalFieldLabel, { color: textColorMuted }]}>Tempo (sec)</ThemedText>
                                            <TextInput
                                                style={{
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    fontSize: 16,
                                                    color: textColor,
                                                    borderColor: borderStrongerColor
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="any"
                                                placeholderTextColor={textColorMuted}
                                                value={exercise.tempo?.toString() || ''}
                                                onChangeText={(value) => updateExercise(exercise.id, 'tempo', parseInt(value) || 0)}
                                            />
                                        </View>
                                    </View>
                                    {/* Notes Field */}
                                    <View style={styles.notesField}>
                                        <View style={styles.notesLabelRow}>
                                            {/* <AlignJustify size={14} color={textColorSubtle} /> */}
                                            <ThemedText style={[styles.notesLabel, { color: textColorMuted }]}>Notes</ThemedText>
                                        </View>
                                        <TextInput
                                            style={{
                                                borderWidth: 1,
                                                borderRadius: 6,
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                fontSize: 16,
                                                color: textColor,
                                                borderColor: borderStrongerColor,
                                                textAlignVertical: 'top',
                                                minHeight: 80
                                            }}
                                            placeholder="Add notes about this exercise..."
                                            placeholderTextColor={textColorMuted}
                                            multiline
                                            numberOfLines={3}
                                            value={exercise.notes || ''}
                                            onChangeText={(value) => updateExercise(exercise.id, 'notes', value)}
                                        />
                                    </View>
                                </View>
                            )}
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
                    <Check size={24} color={accentTextColor} />
                    <ThemedText style={[styles.saveButtonText, { color: accentTextColor }]}>Save Routine</ThemedText>
                </PlatformPressable>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    searchInputContainer: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        height: 40,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 10 + 5,
        marginLeft: 5,
        // opacity: 0.7,
    },
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
        gap: SPACING.pageHorizontalInside,
        alignItems: 'center',
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        padding: 0,
    },
    dropdownList: {
        maxHeight: '70%',
    },
    exerciseDropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.pageHorizontalInside,
        paddingHorizontal: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    optionalFieldsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: SPACING.pageHorizontalInside,
    },
    optionalField: {
        flex: 1,
    },
    optionalFieldLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 4,
    },
    optionalFieldInput: {
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        fontSize: 16,
        color: '#000',
        borderColor: '#ccc',
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
        justifyContent: 'center',
        height: 120,
    },
    emptyListText: {
        fontSize: 15,
        textAlign: 'center',
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.pageHorizontalInside,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 12,
        borderWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: SPACING.pageHorizontalInside,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    setsToggleContainer: {
        marginVertical: SPACING.pageVerticalInside + 4,
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
    expandButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        marginLeft: 4,
        backgroundColor: 'transparent',
    },
    expandedFieldsContainer: {
        marginTop: 6,
        paddingTop: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    columnHeader: {
        flex: 1,
        marginRight: 12,
    },
    columnHeaderText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#888',
    },
    deleteSetButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        marginLeft: 4,
        backgroundColor: 'transparent',
    },
    routineInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    routineName: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 20,
        marginBottom: 3,
    },
    routineMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        lineHeight: 16,
    },
}); 