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
    Easing
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { useActiveWorkout } from '@/components/ActiveWorkoutProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Play, Pause, Plus, ChevronDown, Square, BarChart, CircleStop, EllipsisVertical, EllipsisIcon, Notebook, NotebookIcon, StickyNote, NotepadText } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';

interface ActiveWorkoutDrawerProps {
    isVisible: boolean;
    onClose: () => void;
}

export function ActiveWorkoutDrawer({ isVisible, onClose }: ActiveWorkoutDrawerProps) {
    const insets = useSafeAreaInsets();
    const { activeWorkout, togglePauseWorkout, stopActiveWorkout, elapsedTime, updateWorkoutName } = useActiveWorkout();
    const [workoutName, setWorkoutName] = useState(() => activeWorkout?.name || 'New Workout');
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
    const borderColor = useThemeColor('border');
    const accentColor = useThemeColor('brand');
    const subtleBackground = useThemeColor('backgroundSubtleContrast');
    const backgroundColor = useThemeColor('background');

    const screenHeight = Dimensions.get('window').height;
    // Adjust the drawer height to account for safe areas properly
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

    // Calculate combined transform for both opening animation and drag gesture
    const combinedTransform = Animated.add(
        Animated.multiply(
            Animated.subtract(1, drawerAnim),
            DRAWER_HEIGHT
        ),
        drawerTranslateY
    );

    if (!isVisible && !isAnimatingOut) {
        return null;
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={closeDrawerWithGesture}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            opacity: drawerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.7],
                            }),
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
                            <ChevronDown size={24} color={textColor} />
                        </PlatformPressable>

                        {/* <ThemedText style={styles.title}>Current Workout</ThemedText> */}

                        <PlatformPressable
                            onPress={handleEndWorkout}
                            style={styles.endButton}
                        >
                            <EllipsisIcon size={24} color={textColor} />
                        </PlatformPressable>
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
                        <View style={styles.timerContainer}>
                            <PlatformPressable
                                onPress={togglePause}
                            >
                                <ThemedText style={[styles.timerText, { color: textSecondary }]}>
                                    {elapsedTime}
                                </ThemedText>
                            </PlatformPressable>
                        </View>
                        <View style={styles.workoutNotesContainer}>
                            {/* <NotepadText size={18} color={textColor} /> */}
                            <TextInput
                                style={[styles.workoutNotesInput, { color: textSecondary }]}
                                placeholder="Add workout notes"
                                placeholderTextColor={textColor + '80'}
                            />
                        </View>

                    </View>

                    {/* Exercises */}
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={true}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        scrollEnabled={!isDragging} // Disable scrolling when dragging from the top
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
                    </Animated.ScrollView>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
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
        elevation: 20,
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
    title: {
        fontSize: 18,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
    },
    endButton: {
        padding: 4,
    },
    workoutNameContainer: {
        paddingHorizontal: SPACING.pageHorizontal,
        marginBottom: 16,
    },
    workoutNameInput: {
        fontSize: 28,
        fontWeight: '500',
        marginTop: 8,
        marginBottom: 1,
    },
    workoutNotesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 22,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 22,
    },
    timerText: {
        fontSize: 16,
        fontWeight: '400'
    },
    workoutNotesInput: {
        fontSize: 14,
        fontWeight: '400',
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