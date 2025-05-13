import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Animated,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    ScrollView,
    Pressable,
    useColorScheme,
    PanResponder,
    Easing,
    Alert,
    ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from '../ThemedText';
import { ThemedSection } from '../ThemedSection';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { PlatformPressable } from '@react-navigation/elements';
import { Search, X, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useActiveWorkout } from '@/components/ActiveWorkoutProvider';
import { useQuery } from '@apollo/client';
import { GET_ROUTINE_DETAILS, GET_USER_ROUTINES } from '@/lib/graphql/queries';

interface WorkoutDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectRoutine: (routine: any) => void;
    onStartEmptyWorkout: () => void;
    hasActiveWorkout?: boolean;
}

export function WorkoutDrawer({
    isVisible,
    onClose,
    onSelectRoutine,
    onStartEmptyWorkout,
    hasActiveWorkout = false
}: WorkoutDrawerProps) {
    // Only return null if never opened - improves performance
    const hasEverBeenVisible = useRef(false);
    if (isVisible) {
        hasEverBeenVisible.current = true;
    }
    if (!isVisible && !hasEverBeenVisible.current) {
        return null;
    }

    // Main component content
    return <WorkoutDrawerContent 
        isVisible={isVisible} 
        onClose={onClose} 
        onSelectRoutine={onSelectRoutine} 
        onStartEmptyWorkout={onStartEmptyWorkout}
        hasActiveWorkout={hasActiveWorkout}
    />;
}

// Separate component to avoid re-rendering the parent
function WorkoutDrawerContent({
    isVisible,
    onClose,
    onSelectRoutine,
    onStartEmptyWorkout,
    hasActiveWorkout = false
}: WorkoutDrawerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const drawerAnim = useRef(new Animated.Value(0)).current;
    const drawerTranslateY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { startNewWorkout } = useActiveWorkout();
    
    // Track when the drawer becomes visible for data loading
    const [dataFetchTriggered, setDataFetchTriggered] = useState(false);

    // Fetch routines only when drawer is visible
    const { loading, error, data, refetch } = useQuery(GET_USER_ROUTINES, {
        variables: {
            userId: 1, // Current user ID
            skip: 0,
            take: 20
        },
        skip: !dataFetchTriggered, // Don't run query unless drawer opened
        fetchPolicy: 'cache-and-network'
    });

    // Theme colors
    const backgroundColor = useThemeColor('background');
    const textColor = useThemeColor('text');
    const textSecondary = useThemeColor('textSecondary');
    const textMuted = useThemeColor('textMuted');
    const borderColor = useThemeColor('border');
    const borderStrongerColor = useThemeColor('borderStronger');
    const accentColor = useThemeColor('brand');
    const accentTextColor = useThemeColor('brandText');
    const cardBgColor = useThemeColor('backgroundSubtleContrast');
    const backgroundContrast = useThemeColor('backgroundContrast');

    const screenHeight = Dimensions.get('window').height;
    const DRAWER_HEIGHT = screenHeight * 0.9;
    const CLOSE_THRESHOLD = 100;

    // Trigger data fetch when drawer becomes visible
    useEffect(() => {
        if (isVisible && !dataFetchTriggered) {
            setDataFetchTriggered(true);
        }
    }, [isVisible, dataFetchTriggered]);

    // Retrieve user routines from data safely
    const userRoutines = useMemo(() => {
        return data?.userRoutines?.routines || [];
    }, [data?.userRoutines?.routines]);

    // Memoized filtered routines to prevent unnecessary re-renders
    const filteredLibrary = useMemo(() => {
        if (!userRoutines.length) {
            return [];
        }
        
        if (searchQuery.trim() === '') {
            return userRoutines;
        }
        
        const query = searchQuery.toLowerCase();
        return userRoutines.filter((routine: any) =>
            routine.name.toLowerCase().includes(query) ||
            routine.type.toLowerCase().includes(query)
        );
    }, [userRoutines, searchQuery]);

    // Hook to fetch routine details when one is selected
    const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
    const { loading: routineDetailsLoading, data: routineDetailsData } = useQuery(GET_ROUTINE_DETAILS, {
        variables: { id: selectedRoutineId },
        skip: !selectedRoutineId,
        onCompleted: (data) => {
            if (data?.routine) {
                try {
                    // Process the routine data for ActiveWorkoutDrawer
                    const processedRoutine = prepareRoutineForWorkout(data.routine);
                    
                    // Close drawer first
                    closeDrawerWithGesture();
                    
                    // Start a new workout with the processed routine
                    // This will create a session in the backend
                    startNewWorkout(data.routine.name, data.routine.id);
                    
                    // Log success
                    console.log(`Started workout with ${processedRoutine.exercises?.length || 0} exercises`);
                    
                    // Reset the selected ID
                    setSelectedRoutineId(null);
                } catch (error) {
                    console.error("Error processing routine data:", error);
                    Alert.alert("Error", "Something went wrong processing the workout data.");
                    setSelectedRoutineId(null);
                }
            }
        },
        onError: (error) => {
            console.error("Error fetching routine details:", error);
            Alert.alert(
                "Error",
                "Failed to load workout details. Please try again.",
                [{ text: "OK" }]
            );
            setSelectedRoutineId(null);
        }
    });

    // Function to prepare routine data for ActiveWorkoutDrawer
    const prepareRoutineForWorkout = (routine: any) => {
        if (!routine.routineExercises) return routine;
        
        // Map routine exercises to the format expected by ActiveWorkoutDrawer
        // Only include exercise name and total number of sets per exercise
        const exercises = routine.routineExercises.map((exercise: any, index: number) => {
            // Get the set count from the exercise data
            // If sets is an array, use its length; if it's a number, use that; otherwise default to 3
            let numberOfSets = 3; // Default
            if (exercise.sets) {
                if (Array.isArray(exercise.sets)) {
                    numberOfSets = exercise.sets.length;
                } else if (typeof exercise.sets === 'number') {
                    numberOfSets = exercise.sets;
                }
            }
            
            // Create simple sets with just id, no weight/reps/rpe data
            const sets = Array(numberOfSets).fill(0).map((_, setIndex) => ({
                id: `${index}-${setIndex + 1}`,
                weight: '0',
                reps: '0',
                completed: false
            }));
            
            return {
                id: index.toString(),
                name: exercise.exercise.name,
                showRpe: false,
                exerciseId: exercise.exercise.id,
                sets
            };
        });
        
        return {
            ...routine,
            exercises
        };
    };

    // Check if there's an active workout
    const handleStartEmptyWorkout = () => {
        if (hasActiveWorkout) {
            Alert.alert(
                "Active Workout",
                "You already have an active workout. Would you like to end it and start a new one?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "End & Start New",
                        onPress: () => {
                            closeDrawerWithGesture();
                            onStartEmptyWorkout();
                        }
                    }
                ]
            );
        } else {
            closeDrawerWithGesture();
            onStartEmptyWorkout();
        }
    };

    // Handle selecting a routine
    const handleSelectRoutine = (routine: any) => {
        if (hasActiveWorkout) {
            Alert.alert(
                "Active Workout",
                "You already have an active workout. Would you like to end it and start a new one?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "End & Start New",
                        onPress: () => {
                            // Make sure the ID is an integer
                            setSelectedRoutineId(parseInt(routine.id.toString(), 10));
                        }
                    }
                ]
            );
        } else {
            // Make sure the ID is an integer
            setSelectedRoutineId(parseInt(routine.id.toString(), 10));
        }
    };

    // Pan responder for gesture handling
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5; // Only respond to downward movement
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow downward movement (positive dy)
                const newTranslateY = Math.max(0, gestureState.dy);
                drawerTranslateY.setValue(newTranslateY);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > CLOSE_THRESHOLD) {
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

    // Enhanced animation for opening and closing with exponential easing but no bounce
    useEffect(() => {
        if (isVisible) {
            setIsAnimatingOut(false);
            drawerTranslateY.setValue(0); // Reset any gesture translation

            // Use timing with custom easing instead of spring for smoother, non-bouncy open
            Animated.timing(drawerAnim, {
                toValue: 1,
                duration: 350,
                easing: Easing.out(Easing.exp), // Exponential easing without bounce
                useNativeDriver: true,
            }).start();
        } else {
            // Ensure we set animating out first before starting animation
            setIsAnimatingOut(true);

            // Consistent closing animation
            Animated.timing(drawerAnim, {
                toValue: 0,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    setIsAnimatingOut(false);
                    drawerTranslateY.setValue(0); // Reset any gesture movement
                }
            });
        }
    }, [isVisible]);

    // Close drawer with gesture - uses the same animation as button close
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

    // Handle the X button press - use same animation as gesture close
    const handleClosePress = () => {
        // Start the animation first, then call onClose after it finishes
        closeDrawerWithGesture();
    };

    // Clear search when drawer closes
    useEffect(() => {
        if (!isVisible) {
            setSearchQuery('');
        }
    }, [isVisible]);

    // Only render if visible or in the process of animating out
    if (!isVisible && !isAnimatingOut) {
        return null;
    }

    // Calculate combined transform for both opening animation and drag gesture
    const combinedTransform = Animated.add(
        Animated.multiply(
            Animated.subtract(1, drawerAnim),
            DRAWER_HEIGHT
        ),
        drawerTranslateY
    );

    return (
        <View style={[styles.container, { pointerEvents: 'box-none' }]}>
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
                        paddingBottom: insets.bottom + 20,
                        height: DRAWER_HEIGHT,
                    },
                ]}
            >
                {/* Drawer Handle - PanResponder attached here */}
                <View
                    style={styles.handleContainer}
                    {...panResponder.panHandlers}
                >
                    <View style={[styles.handle, { backgroundColor: textMuted }]} />
                </View>

                <View style={styles.header}>
                    <ThemedText style={styles.title}>Start Workout</ThemedText>
                    <PlatformPressable
                        onPress={handleClosePress}
                        style={styles.closeButton}
                        hitSlop={10}
                    >
                        <X size={24} color={textColor} strokeWidth={1.7} />
                    </PlatformPressable>
                </View>

                {/* Start Empty Workout Button (single button) */}
                <View style={styles.actionButtons}>
                    <PlatformPressable
                        style={[styles.startWorkoutButton, { backgroundColor: accentColor }]}
                        onPress={handleStartEmptyWorkout}
                    >
                        <View style={styles.buttonContent}>
                            <Play size={20} color={accentTextColor} strokeWidth={1.7} />
                            <ThemedText style={[styles.startButtonText, { color: accentTextColor }]}>
                                Start Empty Workout
                            </ThemedText>
                        </View>
                    </PlatformPressable>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { borderColor }]}>
                    <Search size={20} color={textMuted} strokeWidth={1.7} />
                    <TextInput
                        style={[styles.searchInput, { color: textColor }]}
                        placeholder="Search routines..."
                        placeholderTextColor={textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Library Routines Section */}
                    {loading && !data ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={accentColor} />
                            <ThemedText style={styles.loadingText}>Loading routines...</ThemedText>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <ThemedText style={styles.errorText}>
                                Error loading routines. Please try again.
                            </ThemedText>
                            <PlatformPressable
                                style={[styles.retryButton, { backgroundColor: accentColor }]}
                                onPress={() => refetch()}
                            >
                                <ThemedText style={{ color: accentTextColor }}>Retry</ThemedText>
                            </PlatformPressable>
                        </View>
                    ) : filteredLibrary.length > 0 ? (
                        <View>
                            <View style={styles.sectionHeader}>
                                <ThemedText style={[styles.sectionTitle, { color: textMuted }]}>Saved Routines</ThemedText>
                            </View>

                            <View style={{ marginHorizontal: SPACING.pageHorizontalInside }}>
                                <ThemedSection style={[styles.section, { marginHorizontal: SPACING.pageHorizontalInside }]}>
                                    {filteredLibrary.map((routine: any, index: number) => (
                                        <PlatformPressable
                                            key={routine.id}
                                            style={[
                                                styles.routineCard,
                                                {
                                                    borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
                                                    borderTopColor: 'rgba(100, 100, 100, 0.5)',
                                                }
                                            ]}
                                            onPress={() => handleSelectRoutine(routine)}
                                            disabled={routineDetailsLoading}
                                        >
                                            <View style={styles.routineInfo}>
                                                <ThemedText key={`${routine.id}-name`} style={styles.routineName} numberOfLines={1} ellipsizeMode="tail">
                                                    {routine.name}
                                                </ThemedText>
                                                <View style={styles.routineMetaRow}>
                                                    <ThemedText key={`${routine.id}-meta`} style={[styles.metaText, { color: textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
                                                        {routine.type} • {routine.skillLevel}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </PlatformPressable>
                                    ))}
                                </ThemedSection>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noResults}>
                            <ThemedText style={[styles.noResultsText, { color: textMuted }]}>
                                {searchQuery ? "No routines found" : "No saved routines"}
                            </ThemedText>
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        elevation: 999,
        backgroundColor: 'transparent',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 900,
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
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        height: 40,
        justifyContent: 'center',
        zIndex: 10,
    },
    handle: {
        width: 36,
        height: 5,
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.pageHorizontal,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '400',
    },
    closeButton: {
        padding: 4,
    },
    actionButtons: {
        marginHorizontal: SPACING.pageHorizontal,
        marginBottom: 16,
        gap: 12,
    },
    startWorkoutButton: {
        borderRadius: 12,
        padding: 14,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.pageHorizontal,
        marginBottom: 20,
        paddingHorizontal: 12,
        height: 46,
        borderWidth: 1,
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        marginBottom: 12,
        paddingHorizontal: SPACING.pageHorizontal,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    routineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.pageHorizontalInside,
        paddingHorizontal: SPACING.pageHorizontalInside,
    },
    routineInfo: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
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
    noResults: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    noResultsText: {
        fontSize: 16,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        marginBottom: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
}); 