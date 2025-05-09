import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Plus, PlusCircle, X } from 'lucide-react-native';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { PageContainer } from '@/components/PageContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { SPACING } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RoutineType, SkillLevel, CreateRoutineInput, mapExerciseToRoutineExerciseInput } from '@/lib/graphql/types';
import { RoutineCard } from '@/components/routine/RoutineCard';
import { SearchOverlay } from '@/components/routine/SearchOverlay';
import { LibraryContent } from '@/components/routine/LibraryContent';
import { debounce } from '@/utils/debounce';
import { useLibraryRoutines, markRoutinesNeedRefresh } from '@/hooks/useLibraryRoutines';
import { useLibrarySearch } from '@/hooks/useLibrarySearch';
import { useActionMenu } from '@/hooks/useActionMenu';
import { useMutation } from '@apollo/client';
import { CREATE_ROUTINE } from '@/lib/graphql/mutations';

// Define workout types for filtering
const WORKOUT_TYPES = [
    { id: 'all', name: 'All' },
    { id: RoutineType.Strength, name: 'Strength' },
    { id: RoutineType.Endurance, name: 'Endurance' },
    { id: RoutineType.Flexibility, name: 'Flexibility' },
    { id: RoutineType.Balance, name: 'Balance' },
    { id: RoutineType.Mobility, name: 'Mobility' }
];

export default function LibraryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const searchInputRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
    
    // State for active tab
    const [activeTab, setActiveTab] = useState<'routines' | 'regiments'>('routines');
    
    // Use custom hooks
    const search = useLibrarySearch();
    const routines = useLibraryRoutines(activeTab, search.selectedType);
    const actionMenu = useActionMenu();
    
    // GraphQL mutation for creating routines
    const [createRoutine] = useMutation(CREATE_ROUTINE);
    
    // Use debounce for platform workout loading
    const debouncedLoadMore = useCallback(
        debounce(() => {
            if (!routines.isLoadingMore && routines.hasMoreWorkouts) {
                routines.loadMorePlatformWorkouts();
            }
        }, 300),
        [routines.loadMorePlatformWorkouts, routines.isLoadingMore, routines.hasMoreWorkouts]
    );

    // Refresh routines when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log('Library screen focused');
            routines.refreshOnFocus();
            
            return () => {
                console.log('Library screen blurred');
                routines.resetFocusFlag();
            };
        }, [routines])
    );

    // Navigation and action handlers
    const handleCreateRoutine = () => {
        router.push('/create-routine');
    };

    // Combined function for both clicking on a routine and editing from the menu
    const handleRoutinePress = useCallback((routine: any, editMode: boolean = false) => {
        console.log('Opening routine:', routine.name, editMode ? '(edit mode)' : '');
        
        // If the menu is open, close it
        if (actionMenu.menuVisible) {
            actionMenu.handleCloseMenu();
        }
        
        // Wait a moment if closing menu to avoid transition issues
        setTimeout(() => {
            router.push({
                pathname: '/create-routine',
                params: { 
                    mode: 'edit', // Always use edit mode for existing routines
                    workoutId: routine.id.toString()
                }
            });
        }, actionMenu.menuVisible ? 300 : 0);
    }, [router, actionMenu.menuVisible, actionMenu.handleCloseMenu]);

    // Add function to save a platform workout to user workouts
    const saveToUserWorkouts = (workout: any) => {
        console.log(`[${new Date().toISOString()}] Starting saveToUserWorkouts for "${workout.name}"`);
        
        // Create exercises data for the workout
        // This generates realistic exercises based on the workout type
        const generateExercisesForWorkout = (workout: any) => {
            const exerciseCount = workout.exercises || 5;
            const exercisesByType: Record<string, Array<{name: string}>> = {
                'Strength': [
                    { name: 'Bench Press' },
                    { name: 'Squats' },
                    { name: 'Deadlifts' },
                    { name: 'Pull-ups' },
                    { name: 'Push-ups' },
                    { name: 'Rows' },
                    { name: 'Shoulder Press' },
                    { name: 'Lunges' },
                    { name: 'Bicep Curls' },
                    { name: 'Tricep Extensions' }
                ],
                'Cardio': [
                    { name: 'Running' },
                    { name: 'Jump Rope' },
                    { name: 'Mountain Climbers' },
                    { name: 'Burpees' },
                    { name: 'Jumping Jacks' },
                    { name: 'High Knees' },
                    { name: 'Cycling' },
                    { name: 'Box Jumps' }
                ],
                'Flexibility': [
                    { name: 'Hamstring Stretch' },
                    { name: 'Quad Stretch' },
                    { name: 'Hip Flexor Stretch' },
                    { name: 'Child\'s Pose' },
                    { name: 'Butterfly Stretch' },
                    { name: 'Downward Dog' },
                    { name: 'Shoulder Stretch' }
                ],
                'HIIT': [
                    { name: 'Burpees' },
                    { name: 'Mountain Climbers' },
                    { name: 'Jumping Lunges' },
                    { name: 'Kettlebell Swings' },
                    { name: 'Plank Jacks' },
                    { name: 'Battle Ropes' }
                ],
                'Yoga': [
                    { name: 'Downward Dog' },
                    { name: 'Warrior Pose' },
                    { name: 'Tree Pose' },
                    { name: 'Child\'s Pose' },
                    { name: 'Cobra Pose' },
                    { name: 'Bridge Pose' }
                ],
                'CrossFit': [
                    { name: 'Box Jumps' },
                    { name: 'Wall Balls' },
                    { name: 'Thrusters' },
                    { name: 'Double Unders' },
                    { name: 'Kettlebell Swings' },
                    { name: 'Pull-ups' }
                ],
                'Mobility': [
                    { name: 'Hip Circles' },
                    { name: 'Shoulder Rotations' },
                    { name: 'Ankle Mobilization' },
                    { name: 'Wrist Circles' },
                    { name: 'Neck Rolls' },
                    { name: 'T-Spine Rotation' }
                ]
            };
            
            // Default to strength exercises if the type isn't in our map
            const defaultType = 'Strength';
            const typeExercises = exercisesByType[workout.type] || exercisesByType[defaultType];
            
            // Pick random exercises from the type list
            const selectedCount = Math.min(exerciseCount, typeExercises.length);
            const shuffled = [...typeExercises].sort(() => 0.5 - Math.random());
            const selectedExercises = shuffled.slice(0, selectedCount);
            
            console.log(`[${new Date().toISOString()}] Generated ${selectedExercises.length} exercises for "${workout.name}"`);
            
            // Convert to the format needed for our app
            return selectedExercises.map((exercise, index) => ({
                // Use timestamp + index for unique IDs that won't conflict
                id: `temp_${Date.now()}_${index}`,
                name: exercise.name,
                allSetsEqual: false,
                showRpe: true,
                showExpanded: false,
                multipleSets: Array(3).fill(0).map((_, i) => ({
                    setNumber: i + 1,
                    reps: 8 + Math.floor(Math.random() * 5), // 8-12 reps
                    weight: workout.type === 'Strength' ? 20 + Math.floor(Math.random() * 80) : undefined,
                    restPause: 60 + Math.floor(Math.random() * 60), // 60-120 seconds
                    rpe: Math.floor(Math.random() * 3) + 6, // RPE 6-8
                })),
                restPause: 60 + Math.floor(Math.random() * 60),
                order: index
            }));
        };
        
        // Map difficulty level to SkillLevel enum
        const mapDifficultyToSkillLevel = (difficulty: string): SkillLevel => {
            switch (difficulty?.toLowerCase()) {
                case 'beginner':
                    return SkillLevel.Beginner;
                case 'advanced':
                    return SkillLevel.Advanced;
                case 'intermediate':
                    return SkillLevel.Intermediate;
                case 'all levels':
                default:
                    return SkillLevel.AllLevels;
            }
        };
        
        // Map type to RoutineType enum
        const mapTypeToRoutineType = (type: string): RoutineType => {
            // Direct mappings
            if (type === 'Strength') return RoutineType.Strength;
            if (type === 'Flexibility') return RoutineType.Flexibility;
            if (type === 'Mobility') return RoutineType.Mobility;
            
            // Map other types to closest RoutineType
            if (type === 'Cardio' || type === 'HIIT' || type === 'CrossFit') {
                return RoutineType.Endurance;
            }
            if (type === 'Yoga' || type === 'Balance') {
                return RoutineType.Balance;
            }
            
            // Default
            return RoutineType.Strength;
        };
        
        console.log(`[${new Date().toISOString()}] Preparing data for "${workout.name}"`);
        
        // Generate exercise data for the workout
        const generatedExercises = generateExercisesForWorkout(workout);
        
        // Convert the generated exercises to the format needed by the GraphQL API
        const exerciseInputs = generatedExercises.map((exercise, index) => 
            mapExerciseToRoutineExerciseInput(exercise, index)
        );
        
        // Create routine input - use original name without modification
        const routineInput: CreateRoutineInput = {
            name: workout.name,
            type: mapTypeToRoutineType(workout.type),
            skillLevel: mapDifficultyToSkillLevel(workout.difficulty),
            exercises: exerciseInputs
        };
        
        console.log(`[${new Date().toISOString()}] Input data ready, showing confirmation dialog for "${workout.name}"`);
        
        // Show confirmation dialog
        Alert.alert(
            "Add to Your Routines",
            `Save "${workout.name}" to your routines?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Save",
                    onPress: () => {
                        console.log(`[${new Date().toISOString()}] User confirmed save for "${workout.name}"`);
                        
                        // Show a toast notification immediately for feedback
                        showToast(`Adding "${workout.name}" to your routines...`);
                        
                        // Let the dialog dismiss before starting the mutation
                        // This improves perceived performance
                        setTimeout(() => {
                            console.log(`[${new Date().toISOString()}] Starting GraphQL mutation for "${workout.name}"`);
                            
                            // Execute the create routine mutation
                            createRoutine({
                                variables: {
                                    input: routineInput
                                }
                            }).then(({ data, errors }) => {
                                console.log(`[${new Date().toISOString()}] GraphQL mutation completed for "${workout.name}"`);
                                
                                if (errors) {
                                    console.error('Error creating routine:', errors);
                                    showToast(`Failed to add "${workout.name}"`, 'error');
                                    return;
                                }
                                
                                if (data?.createRoutine) {
                                    console.log(`[${new Date().toISOString()}] Successfully saved "${workout.name}" to user routines`);
                                    
                                    // Mark cache for refresh
                                    console.log(`[${new Date().toISOString()}] Marking cache for refresh`);
                                    markRoutinesNeedRefresh();
                                    
                                    // Notify user of success with a non-blocking toast
                                    showToast(`"${workout.name}" added to your routines`, 'success');
                                    
                                    // Force a quick refresh
                                    routines.refreshOnFocus();
                                }
                            }).catch((error) => {
                                console.error(`[${new Date().toISOString()}] Error saving routine:`, error);
                                showToast(`Error adding "${workout.name}"`, 'error');
                            });
                        }, 300); // Short delay to ensure dialog dismisses first
                    }
                }
            ]
        );
    };
    
    // Simple toast notification function (you should replace this with a proper Toast component)
    const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        // In a real app, you'd show a non-blocking toast/snackbar
        console.log(`[TOAST] ${type.toUpperCase()}: ${message}`);
        
        // For now, we'll just log the message, but in a real app you'd use:
        // Toast.show({
        //   type: type,
        //   text1: message,
        //   visibilityTime: 2000,
        //   autoHide: true,
        //   topOffset: 60
        // });
    };

    // Handle menu actions
    const handleRemoveWorkout = useCallback(() => {
        if (actionMenu.selectedItem) {
            routines.handleDeleteRoutine(
                actionMenu.selectedItem.id,
                actionMenu.selectedItem.name
            ).then(() => {
                actionMenu.handleCloseMenu();
            });
        }
    }, [actionMenu.selectedItem, routines.handleDeleteRoutine, actionMenu.handleCloseMenu]);

    const handleEditWorkout = useCallback(() => {
        if (actionMenu.selectedItem) {
            handleRoutinePress(actionMenu.selectedItem, true);
        }
    }, [actionMenu.selectedItem, handleRoutinePress]);

    // Create Button for the header
    const createButton = (
        <TouchableOpacity
            style={[styles.createButton, { borderColor: useThemeColor('border') }]}
            onPress={handleCreateRoutine}
        >
            <Plus size={26} color={useThemeColor('text')} strokeWidth={1.7} />
        </TouchableOpacity>
    );

    // Handle chip selection with pagination reset
    const handleChipPress = useCallback((typeId: string) => {
        search.handleChipPress(typeId, routines.resetPagination);
    }, [search.handleChipPress, routines.resetPagination]);

    // Memoized render functions for FlatList
    const renderRoutineCard = useCallback((item: any, index: number) => (
        <RoutineCard
            item={item}
            index={index}
            onPress={handleRoutinePress}
            onMenuPress={actionMenu.handleOpenMenu}
        />
    ), [handleRoutinePress, actionMenu.handleOpenMenu]);

    const renderPlatformRoutineCard = useCallback((item: any, index: number) => (
        <RoutineCard
            item={item}
            index={index}
            onPress={handleRoutinePress}
            onAddToLibrary={saveToUserWorkouts}
            type="platform"
        />
    ), [handleRoutinePress, saveToUserWorkouts]);

    // Handle tab switching with routines hook
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId as 'routines' | 'regiments');
        routines.handleTabChange(tabId);
    }, [routines.handleTabChange]);

    // If there's an error loading routines and not in search mode, show error state
    if (routines.error && !search.isSearching) {
        return (
            <ThemedView style={styles.screen}>
                <StandardHeader
                    title="Program Library"
                    rightContent={createButton}
                />
                <PageContainer hasHeader={true} style={styles.container} disableScroll={true}>
                    <View style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>
                            Error loading routines: {routines.error.message}
                        </ThemedText>
                        <TouchableOpacity 
                            style={styles.retryButton}
                            onPress={() => routines.reexecuteRoutinesQuery({ requestPolicy: 'network-only' })}
                        >
                            <ThemedText style={{ color: useThemeColor('brand') }}>Retry</ThemedText>
                        </TouchableOpacity>
                    </View>
                </PageContainer>
            </ThemedView>
        );
    }

    // Get filtered search results
    const { userWorkouts, platformWorkouts } = search.isSearching 
        ? search.filterResults(routines.userRoutines.routines, routines.allPlatformWorkouts)
        : { userWorkouts: [], platformWorkouts: [] };

    return (
        <ThemedView style={styles.screen}>
            <StandardHeader
                title="Program Library"
                rightContent={createButton}
            />

            <PageContainer
                hasHeader={true}
                style={styles.container}
                disableScroll={true}
            >
                {search.isSearching ? (
                    <SearchOverlay
                        visible={search.isSearching}
                        opacity={search.overlayOpacity}
                        searchQuery={search.searchQuery}
                        onSearchChange={search.handleSearchChange}
                        onClear={() => search.setSearchQuery('')}
                        onCancel={search.hideSearchOverlay}
                        filterChipsData={WORKOUT_TYPES}
                        selectedFilterId={search.selectedType}
                        isAllChipSelected={search.isAllChipSelected}
                        onChipPress={handleChipPress}
                        userRoutines={userWorkouts}
                        platformRoutines={platformWorkouts}
                        fetching={routines.fetching}
                        error={routines.error as Error | undefined}
                        hasMoreRoutines={routines.hasMoreRoutines}
                        onLoadMore={() => search.loadMoreSearchResults(routines.allPlatformWorkouts)}
                        onRoutinePress={handleRoutinePress}
                        onSaveToLibrary={saveToUserWorkouts}
                        onRetry={() => routines.reexecuteRoutinesQuery({ requestPolicy: 'network-only' })}
                        searchRef={searchInputRef}
                        renderUserRoutineItem={({ item, index }) => renderRoutineCard(item, index)}
                        renderPlatformRoutineItem={({ item, index }) => renderPlatformRoutineCard(item, index)}
                    />
                ) : (
                    <LibraryContent
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        onSearchPress={() => {
                            const shouldFocusInput = search.showSearchOverlay(true);
                            if (shouldFocusInput && searchInputRef.current) {
                                searchInputRef.current.focus();
                            }
                        }}
                        fetching={routines.fetching}
                        isRefreshing={false} // Don't use pull-to-refresh indicator
                        isUpdating={routines.isUpdating} // New prop for updating state
                        userRoutines={routines.userRoutines}
                        graphqlPage={routines.graphqlPage}
                        renderRoutineCard={renderRoutineCard}
                        renderPlatformRoutineCard={renderPlatformRoutineCard}
                        onCreateRoutinePress={handleCreateRoutine}
                        allPlatformWorkouts={routines.allPlatformWorkouts}
                        isLoadingMore={routines.isLoadingMore}
                        onEndReached={debouncedLoadMore}
                    />
                )}
            </PageContainer>

            {/* Use the standardized ActionSheet component */}
            <ActionSheet
                visible={actionMenu.menuVisible}
                options={[
                    {
                        label: 'Edit Routine',
                        onPress: handleEditWorkout,
                    },
                    {
                        label: 'Remove Routine',
                        onPress: handleRemoveWorkout,
                        destructive: true,
                    }
                ]}
                onClose={actionMenu.handleCloseMenu}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        marginRight: -4,
        borderRadius: 20,
        borderStyle: 'solid',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.pageHorizontal,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        padding: 12,
        borderRadius: 8,
    },
});
