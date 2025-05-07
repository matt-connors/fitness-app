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
import { RoutineType } from '@/lib/graphql/types';
import { RoutineCard } from '@/components/routine/RoutineCard';
import { SearchOverlay } from '@/components/routine/SearchOverlay';
import { LibraryContent } from '@/components/routine/LibraryContent';
import { debounce } from '@/utils/debounce';
import { useLibraryRoutines } from '@/hooks/useLibraryRoutines';
import { useLibrarySearch } from '@/hooks/useLibrarySearch';
import { useActionMenu } from '@/hooks/useActionMenu';

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
    const searchInputRef = useRef<TextInput>(null);
    
    // State for active tab
    const [activeTab, setActiveTab] = useState<'routines' | 'regiments'>('routines');
    
    // Use custom hooks
    const search = useLibrarySearch();
    const routines = useLibraryRoutines(activeTab, search.selectedType);
    const actionMenu = useActionMenu();
    
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
        // In a real app, you'd save this to user data
        console.log(`Saved workout: ${workout.name} to user workouts`);
        // You would implement actual saving logic here
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
