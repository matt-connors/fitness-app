import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Animated,
    TouchableWithoutFeedback,
    Dimensions,
    ScrollView,
    PanResponder,
    Easing,
    TouchableOpacity,
    Alert
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { ThemedSection } from '../ThemedSection';
import { PlatformPressable } from '@react-navigation/elements';
import { useActiveWorkout } from '@/components/ActiveWorkoutProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Plus, ChevronDown, Trash2, X, MoreVertical } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import ExerciseSets from '@/components/exercise/ExerciseSets';
import RpeTooltip from '@/components/exercise/RpeTooltip';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface ActiveWorkoutDrawerProps {
    isVisible: boolean;
    onClose: () => void;
}

// Mock data for available exercises
const AVAILABLE_EXERCISES = [
    { id: '1', name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell' },
    { id: '2', name: 'Squat', muscle: 'Legs', equipment: 'Barbell' },
    { id: '3', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell' },
    { id: '4', name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell' },
    { id: '5', name: 'Pull-up', muscle: 'Back', equipment: 'Bodyweight' },
    { id: '6', name: 'Push-up', muscle: 'Chest', equipment: 'Bodyweight' },
    { id: '7', name: 'Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbell' },
    { id: '8', name: 'Tricep Extension', muscle: 'Triceps', equipment: 'Cable' },
    { id: '9', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine' },
    { id: '10', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
];

export function ActiveWorkoutDrawer({ isVisible, onClose }: ActiveWorkoutDrawerProps) {
    const insets = useSafeAreaInsets();
    const { activeWorkout, togglePauseWorkout, stopActiveWorkout, elapsedTime, updateWorkoutName } = useActiveWorkout();
    const [workoutName, setWorkoutName] = useState(() => activeWorkout?.name || 'New Workout');

    // Exercise state management
    const [exercises, setExercises] = useState<Array<{
        id: string;
        name: string;
        showRpe: boolean;
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
            showRpe: false,
            sets: [
                { id: '1-1', weight: '135', reps: '10', completed: false },
                { id: '1-2', weight: '155', reps: '8', completed: false },
                { id: '1-3', weight: '185', reps: '6', completed: false },
            ]
        },
        {
            id: '2',
            name: 'Squats',
            showRpe: false,
            sets: [
                { id: '2-1', weight: '185', reps: '10', completed: false },
                { id: '2-2', weight: '225', reps: '8', completed: false },
                { id: '2-3', weight: '245', reps: '6', completed: false },
            ]
        }
    ]);

    // Exercise dropdown management
    const [showExerciseDropdown, setShowExerciseDropdown] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredExercises, setFilteredExercises] = useState(AVAILABLE_EXERCISES);

    // Animation states
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const drawerAnim = useRef(new Animated.Value(0)).current;
    const drawerTranslateY = useRef(new Animated.Value(0)).current;

    // Scroll position tracking
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [isAtTop, setIsAtTop] = useState(true);

    // Theme colors
    const textColor = useThemeColor('text');
    const textSecondary = useThemeColor('textSecondary');
    const textMuted = useThemeColor('textMuted');
    const borderColor = useThemeColor('border');
    const borderStrongerColor = useThemeColor('borderStronger');
    const accentColor = useThemeColor('brand');
    const accentTextColor = useThemeColor('brandText');
    const subtleBackground = useThemeColor('backgroundSubtleContrast');
    const contrastBackground = useThemeColor('backgroundContrast');
    const backgroundColor = useThemeColor('background');

    const screenHeight = Dimensions.get('window').height;
    const DRAWER_HEIGHT = screenHeight;
    const CLOSE_THRESHOLD = 50;

    // Update workout name in provider when it changes
    useEffect(() => {
        if (activeWorkout && workoutName !== activeWorkout.name && activeWorkout.name !== 'New Workout') {
            setWorkoutName(activeWorkout.name);
        }
    }, [activeWorkout]);

    // Handle workout name change
    const handleWorkoutNameChange = (name: string) => {
        setWorkoutName(name);
        updateWorkoutName(name);
    };

    // Filter exercises based on search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredExercises(AVAILABLE_EXERCISES);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredExercises(
                AVAILABLE_EXERCISES.filter(exercise =>
                    exercise.name.toLowerCase().includes(query) ||
                    exercise.muscle.toLowerCase().includes(query) ||
                    exercise.equipment.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery]);

    // Track when user has started dragging
    const [isDragging, setIsDragging] = useState(false);

    // Pan responder for swipe down to close - only when at the top of the scroll
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false, // Don't take over from scroll gestures
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only handle downward swipes when at the top of the scroll
                return isAtTop && gestureState.dy > 5;
            },
            onPanResponderGrant: () => {
                setIsDragging(true);
            },
            onPanResponderMove: (_, gestureState) => {
                if (isAtTop) {
                    // Only allow downward movement (positive dy)
                    const newTranslateY = Math.max(0, gestureState.dy);
                    drawerTranslateY.setValue(newTranslateY);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                setIsDragging(false);
                if (gestureState.dy > CLOSE_THRESHOLD && isAtTop) {
                    // User swiped down past threshold, close the drawer
                    closeDrawerWithGesture();
                } else {
                    // Reset the drawer position with a spring animation
                    Animated.spring(drawerTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 7
                    }).start();
                }
            }
        })
    ).current;

    // Animation for opening and closing the drawer
    useEffect(() => {
        if (isVisible) {
            setIsAnimatingOut(false);
            drawerTranslateY.setValue(0); // Reset any gesture translation

            // Use timing with easing for smooth opening
            Animated.timing(drawerAnim, {
                toValue: 1,
                duration: 350,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            setIsAnimatingOut(true);

            // Close drawer animation
            Animated.timing(drawerAnim, {
                toValue: 0,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    setIsAnimatingOut(false);
                    drawerTranslateY.setValue(0);
                }
            });
        }
    }, [isVisible]);

    // Close drawer with gesture
    const closeDrawerWithGesture = () => {
        setIsAnimatingOut(true);

        Animated.timing(drawerAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                drawerTranslateY.setValue(0);
                setIsAnimatingOut(false);
                onClose();
            }
        });
    };

    // Handle scroll events to determine if at top
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                setIsAtTop(offsetY <= 0);
            }
        }
    );

    // Handle end workout action
    const handleEndWorkout = () => {
        closeDrawerWithGesture();
        stopActiveWorkout();
    };

    // Toggle pause/resume
    const togglePause = () => {
        togglePauseWorkout();
    };

    // Component functions for exercise management
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

    const removeSet = (exerciseId: string, setIndex: number) => {
        setExercises(
            exercises.map(exercise => {
                if (exercise.id === exerciseId) {
                    // Don't allow removing the last set
                    if (exercise.sets.length <= 1) {
                        return exercise;
                    }

                    // Remove the set at the specified index
                    const updatedSets = [...exercise.sets];
                    updatedSets.splice(setIndex, 1);

                    // Renumber the set IDs
                    updatedSets.forEach((set, idx) => {
                        set.id = `${exerciseId}-${idx + 1}`;
                    });

                    return { ...exercise, sets: updatedSets };
                }
                return exercise;
            })
        );
    };

    const addExercise = () => {
        const newId = (exercises.length + 1).toString();
        setExercises([
            ...exercises,
            {
                id: newId,
                name: 'Select an exercise',
                showRpe: false,
                sets: [
                    { id: `${newId}-1`, weight: '0', reps: '0', completed: false }
                ]
            }
        ]);

        // Open dropdown for the new exercise
        setTimeout(() => {
            setShowExerciseDropdown(newId);
        }, 100);
    };

    const updateExerciseName = (id: string, name: string) => {
        setExercises(exercises.map(exercise => {
            if (exercise.id === id) {
                return { ...exercise, name };
            }
            return exercise;
        }));
    };

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(exercise => exercise.id !== id));
    };

    const selectExercise = (exerciseId: string, selectedExercise: any) => {
        updateExerciseName(exerciseId, selectedExercise.name);
        setShowExerciseDropdown(null);
        setSearchQuery('');
    };

    // Calculate combined transform for both opening animation and drag gesture
    const combinedTransform = Animated.add(
        Animated.multiply(
            Animated.subtract(1, drawerAnim),
            DRAWER_HEIGHT
        ),
        drawerTranslateY
    );

    const [showRpeTooltip, setShowRpeTooltip] = useState<string | null>(null);
    const [showRirTooltip, setShowRirTooltip] = useState<string | null>(null);

    // Map our exercises to the Exercise type expected by ExerciseSets
    const mapExerciseForSets = (exercise: any) => {
        return {
            id: exercise.id,
            name: exercise.name,
            allSetsEqual: false, // Always use multiple sets mode in the workout
            showRpe: exercise.showRpe,
            showExpanded: false,
            multipleSets: exercise.sets.map((set: any, index: number) => ({
                setNumber: index + 1,
                reps: set.reps,
                weight: set.weight,
                rpe: undefined,
                tempo: undefined,
                completed: set.completed,
                showExpanded: false
            }))
        };
    };

    const toggleRpeMode = (exerciseId: string) => {
        setExercises(exercises.map(exercise => {
            if (exercise.id === exerciseId) {
                return {
                    ...exercise,
                    showRpe: !exercise.showRpe
                };
            }
            return exercise;
        }));
    };

    // Only render if visible or in the process of animating out
    if (!isVisible && !isAnimatingOut) {
        return null;
    }

    // Render a single exercise item
    const renderExerciseItem = (exercise: any, index: number) => {
        return (
            <View style={{
                marginBottom: SPACING.pageVertical
            }}>
                {/* Exercise Content */}
                <ThemedSection style={{
                    paddingHorizontal: SPACING.pageHorizontalInside,
                    paddingVertical: SPACING.pageHorizontalInside,
                }}>
                    {/* Exercise Name Dropdown */}
                    <View style={{
                        flexDirection: 'row',
                        gap: SPACING.pageHorizontalInside,
                        alignItems: 'center',
                    }}>
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
                                setFilteredExercises(AVAILABLE_EXERCISES);
                                setShowExerciseDropdown(exercise.id);
                            }}
                        >
                            <ThemedText style={[
                                exercise.name !== 'Select an exercise' ?
                                    { fontSize: 16, fontWeight: '400' } :
                                    { fontSize: 16, fontWeight: '400', opacity: 0.5 }
                            ]}>
                                {exercise.name}
                            </ThemedText>
                            <ChevronDown size={20} color={textMuted} />
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
                            onPress={() => removeExercise(exercise.id)}
                            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        >
                            <Trash2 size={20} color={textMuted} strokeWidth={1.7} />
                        </TouchableOpacity>
                    </View>

                    {/* Sets Section using ExerciseSets component */}
                    <View style={{ marginTop: 20 }}>
                        <ExerciseSets
                            exercise={mapExerciseForSets(exercise)}
                            onUpdateExercise={(id, field, value) => {
                                // Handle updates to the exercise
                                if (field === 'name') {
                                    updateExerciseName(id, value as string);
                                } else if (field === 'showRpe') {
                                    toggleRpeMode(id);
                                }
                            }}
                            onUpdateSet={(exerciseId, setIndex, field, value) => {
                                // Map to our local updateSet function format
                                if (field === 'reps' || field === 'weight') {
                                    updateSet(exerciseId, exercise.sets[setIndex].id, field, value.toString());
                                } else if (field === 'completed') {
                                    toggleSetCompleted(exerciseId, exercise.sets[setIndex].id);
                                }
                            }}
                            onAddSetToExercise={addSet}
                            setShowRpeTooltip={setShowRpeTooltip}
                            setShowRirTooltip={setShowRirTooltip}
                            onRemoveSet={removeSet}
                        />
                    </View>
                </ThemedSection>
            </View>
        );
    };

    // Exercise Select Modal component
    const ExerciseSelectModal = ({ visible, exerciseId }: { visible: boolean, exerciseId: string }) => {
        if (!visible) return null;

        return (
            <GestureHandlerRootView style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                zIndex: 1500, 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                pointerEvents: 'box-none'
            }}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Select Exercise</ThemedText>
                            <TouchableOpacity onPress={() => setShowExerciseDropdown(null)}>
                                <X size={24} color={textColor} strokeWidth={1.7} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { borderColor }]}>
                            <Search size={20} color={textMuted} strokeWidth={1.7} />
                            <TextInput
                                style={[styles.searchInput, { color: textColor }]}
                                placeholder="Search exercises..."
                                placeholderTextColor={textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <X size={20} color={textMuted} strokeWidth={1.7} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.exerciseList}>
                            {filteredExercises.map((exercise, index) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    style={[
                                        styles.exerciseListItem,
                                        {
                                            borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
                                            borderTopColor: borderStrongerColor
                                        }
                                    ]}
                                    onPress={() => selectExercise(exerciseId, exercise)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <ThemedText style={styles.exerciseListItemName}>
                                            {exercise.name}
                                        </ThemedText>
                                        <ThemedText style={[styles.exerciseListItemDetails, { color: textSecondary }]}>
                                            {exercise.muscle} • {exercise.equipment}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {filteredExercises.length === 0 && (
                                <View style={styles.noResultsContainer}>
                                    <ThemedText style={[styles.noResultsText, { color: textMuted }]}>
                                        No exercises found
                                    </ThemedText>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </GestureHandlerRootView>
        );
    };

    // List Footer Component (Add Exercise Button)
    const ListFooter = () => (
        <View>
            {/* Add Exercise Button */}
            <TouchableOpacity
                style={[styles.addExerciseButton, { backgroundColor: contrastBackground }]}
                onPress={addExercise}
            >
                <Plus size={20} color={textColor} strokeWidth={1.7} />
                <ThemedText style={[styles.addExerciseText, { color: textColor }]}>
                    Add Exercise
                </ThemedText>
            </TouchableOpacity>

            {/* Extra padding at the bottom */}
            <View style={{ height: 100 }} />
        </View>
    );

    return (
        <GestureHandlerRootView 
            style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                zIndex: 9999, 
                pointerEvents: isVisible || isAnimatingOut ? 'box-none' : 'none' 
            }}
        >
            <ThemedView style={[styles.container, { pointerEvents: 'box-none', opacity: isVisible || isAnimatingOut ? 1 : 0 }]}>
                <TouchableWithoutFeedback onPress={closeDrawerWithGesture}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: drawerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.7],
                                }),
                                pointerEvents: isVisible ? 'auto' : 'none',
                            },
                        ]}
                    />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            backgroundColor,
                            transform: [
                                {
                                    translateY: combinedTransform
                                },
                            ],
                            paddingBottom: insets.bottom,
                            height: DRAWER_HEIGHT,
                        },
                    ]}
                >
                    <View style={styles.drawerContent}>
                        {/* Header */}
                        <View
                            style={[
                                styles.headerSection,
                                { paddingTop: insets.top + 5 || 20 } // Ensure proper safe area spacing
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <PlatformPressable onPress={closeDrawerWithGesture} style={styles.closeButton}>
                                <ChevronDown size={24} color={textColor} strokeWidth={1.7} />
                            </PlatformPressable>

                            <TouchableOpacity
                                onPress={handleEndWorkout}
                                style={styles.endButton}
                            >
                                <ThemedText style={{ fontSize: 14, color: textColor }}>End Workout</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Workout Name and Timer */}
                        <View style={styles.workoutNameContainer}>
                            <TextInput
                                style={[styles.workoutNameInput, { color: textColor }]}
                                value={workoutName}
                                onChangeText={handleWorkoutNameChange}
                                placeholder="Workout Name"
                                placeholderTextColor={textColor + '80'}
                            />
                            <PlatformPressable onPress={togglePause}>
                                <ThemedText style={[styles.timerText, { color: textSecondary }]}>
                                    {elapsedTime}
                                </ThemedText>
                            </PlatformPressable>
                        </View>

                        {/* Main Content Area */}
                        <View style={[
                            styles.content,
                            {
                                paddingHorizontal: SPACING.pageHorizontal,
                            }
                        ]}>
                            {/* Exercises */}
                            <Animated.ScrollView
                                ref={scrollViewRef}
                                style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                                showsVerticalScrollIndicator={false}
                                onScroll={handleScroll}
                                scrollEventThrottle={16}
                                scrollEnabled={!isDragging} // Disable scrolling when dragging from the top
                            >
                                {/* Exercises Section Header */}
                                <View style={styles.exercisesSection}>
                                    <ThemedText style={[styles.sectionHeader, { color: textMuted }]}>Exercises</ThemedText>
                                </View>

                                {/* Exercise List */}
                                {exercises.map((exercise, index) => (
                                    <View key={exercise.id}>
                                        {renderExerciseItem(exercise, index)}
                                    </View>
                                ))}

                                {/* List Footer with Add Exercise button */}
                                <ListFooter />
                            </Animated.ScrollView>
                        </View>
                    </View>
                </Animated.View>
            </ThemedView>

            {/* Exercise Selection Modal */}
            {showExerciseDropdown && (
                <ExerciseSelectModal
                    visible={!!showExerciseDropdown}
                    exerciseId={showExerciseDropdown}
                />
            )}

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
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 999,
        backgroundColor: 'transparent',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 1000,
    },
    drawer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 25,
        zIndex: 1001,
    },
    drawerContent: {
        flex: 1,
    },
    headerSection: {
        paddingHorizontal: SPACING.pageHorizontal,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        padding: 4,
    },
    endButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(150, 150, 150, 0.3)',
        borderRadius: 16,
    },
    workoutNameContainer: {
        paddingHorizontal: SPACING.pageHorizontal,
        marginBottom: 22,
    },
    workoutNameInput: {
        fontSize: 28,
        fontWeight: '500',
        marginTop: 8,
        marginBottom: 8,
    },
    timerText: {
        fontSize: 16,
        fontWeight: '400'
    },
    content: {
        flex: 1,
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
    // Modal styles
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1500,
        pointerEvents: 'auto',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 30,
        zIndex: 1501,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        fontSize: 16,
    },
    exerciseList: {
        maxHeight: 400,
    },
    exerciseListItem: {
        paddingVertical: 12,
        borderTopWidth: 0.5,
    },
    exerciseListItemName: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 4,
    },
    exerciseListItemDetails: {
        fontSize: 12,
    },
    noResultsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 16,
    },
}); 