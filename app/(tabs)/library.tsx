import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Keyboard, Modal, FlatList, Animated, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlatformPressable } from '@react-navigation/elements';
import { SPACING } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PlusCircle, Search, X, Star, User, BookOpen, Clock, Trash2, Plus, History, BicepsFlexed } from 'lucide-react-native';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { PageContainer } from '@/components/PageContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedSection } from '@/components/ThemedSection';

// Mock data for different sections
const RECENT_ROUTINES = [
    { id: 'r1', name: 'Full Body Strength', type: 'Strength', exercises: 12, duration: '45 min', lastUsed: '3 days ago', source: 'user' },
    { id: 'r2', name: 'HIIT Cardio', type: 'Cardio', exercises: null, duration: '30 min', lastUsed: '1 week ago', source: 'platform' },
];

const USER_CREATED_WORKOUTS = [
    { id: 'u1', name: 'Full Body Strength', type: 'Strength', exercises: 12, duration: '45 min', source: 'user' },
    { id: 'u2', name: 'Upper/Lower Split', type: 'Strength', exercises: 8, duration: '40 min', source: 'user' },
    { id: 'u3', name: 'Push/Pull/Legs', type: 'Strength', exercises: 15, duration: '50 min', source: 'user' },
    { id: 'u4', name: 'Yoga Flow', type: 'Flexibility', exercises: null, duration: '35 min', source: 'user' },
];

// Generate platform workouts for pagination testing
const generatePlatformWorkouts = (count: number, startIndex: number = 0) => {
    const types = ['Strength', 'Cardio', 'Flexibility', 'Yoga', 'CrossFit', 'HIIT', 'Program'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
    const baseWorkouts = [
        { name: 'Beginner Strength', type: 'Strength', category: 'Strength' },
        { name: 'HIIT Cardio Blast', type: 'Cardio', category: 'Cardio' },
        { name: 'Advanced Yoga Flow', type: 'Flexibility', category: 'Yoga' },
        { name: 'Core Crusher', type: 'Strength', category: 'Core' },
        { name: '30-Day Transformation', type: 'Program', category: 'Program' },
        { name: 'CrossFit WOD', type: 'CrossFit', category: 'CrossFit' },
        { name: 'Full Body Burn', type: 'HIIT', category: 'HIIT' },
        { name: 'Mobility Flow', type: 'Flexibility', category: 'Mobility' },
        { name: 'Leg Day', type: 'Strength', category: 'Legs' },
        { name: 'Upper Body Focus', type: 'Strength', category: 'Upper Body' },
    ];

    return Array.from({ length: count }).map((_, i) => {
        const index = i + startIndex;
        const base = baseWorkouts[index % baseWorkouts.length];
        const workoutNumber = Math.floor(index / baseWorkouts.length) + 1;
        return {
            id: `platform_${index + 1}_${Date.now()}`,  // Ensure globally unique IDs by adding timestamp
            name: `${base.name}${workoutNumber > 1 ? ' ' + workoutNumber : ''}`,
            type: base.type,
            exercises: Math.floor(Math.random() * 15) + 5,
            duration: `${Math.floor(Math.random() * 40) + 15} min`,
            difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
            category: base.category,
            source: 'platform'
        };
    });
};

// Initial set of platform workouts (equivalent to first page)
const INITIAL_PLATFORM_WORKOUTS = generatePlatformWorkouts(10, 0);

// Mock data for recent searches
const RECENT_SEARCHES = [
    { id: 's1', query: 'Full Body', timestamp: '2023-09-15T12:30:00Z' },
    { id: 's2', query: 'HIIT', timestamp: '2023-09-14T10:15:00Z' },
    { id: 's3', query: 'Strength Training', timestamp: '2023-09-12T08:45:00Z' },
];

// Workout types for chips
const WORKOUT_TYPES = [
    { id: 'all', name: 'All' },
    { id: 'strength', name: 'Strength' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'flexibility', name: 'Flexibility' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'crossfit', name: 'CrossFit' },
    { id: 'hiit', name: 'HIIT' },
    { id: 'program', name: 'Program' },
];

// Custom debounce implementation
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function (...args: Parameters<T>) {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

export default function LibraryScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'routines' | 'regiments'>('routines');

    // State to track if "All" is explicitly selected - set to true by default
    const [isAllChipSelected, setIsAllChipSelected] = useState(true);

    // Derived search state
    const hasSearchQuery = searchQuery.length > 0;
    const hasSelectedType = selectedType !== null;
    // Remove recent from derived states - always default to All
    const isAllSelected = !hasSelectedType;

    // Pagination states
    const [allPlatformWorkouts, setAllPlatformWorkouts] = useState(INITIAL_PLATFORM_WORKOUTS);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true);
    const [page, setPage] = useState(1);

    // For search results pagination
    const [isLoadingMoreResults, setIsLoadingMoreResults] = useState(false);
    const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true);
    const [searchPage, setSearchPage] = useState(1);

    const insets = useSafeAreaInsets();
    const searchInputRef = useRef<TextInput>(null);

    // Refs for FlatLists
    const platformWorkoutsListRef = useRef<FlatList>(null);
    const searchResultsListRef = useRef<FlatList>(null);

    // Animation values
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    // Theme colors
    const accentColor = useThemeColor('brand');
    const borderColor = useThemeColor('border');
    const cardBgColor = useThemeColor('backgroundSubtleContrast');
    const textColor = useThemeColor('text');
    const textColorContrast = useThemeColor('textContrast');
    const accentTextColor = useThemeColor('brandText');
    const textColorSubtle = useThemeColor('textSecondary');
    const textColorMuted = useThemeColor('textMuted');
    const inputBgColor = useThemeColor('background');
    const overlayBgColor = useThemeColor('background');
    const contrastBackgroundColor = useThemeColor('backgroundContrast');

    // Calculate the header height including insets
    const headerHeight = SPACING.headerHeight + insets.top;

    const handleCreateRoutine = () => {
        router.push('/create-routine');
    };

    const handleRoutinePress = (routine: any) => {
        router.push({
            pathname: '/create-routine',
            params: { workout: JSON.stringify(routine) }
        });
    };

    // Search handling
    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    // Keep this function to save recent searches in the background for analytics/future use
    const handleSearchSelection = (query: string) => {
        setSearchQuery(query);
        // Save to recent searches
        const existingIndex = recentSearches.findIndex(item => item.query === query);
        const newRecentSearches = [...recentSearches];

        if (existingIndex >= 0) {
            // Move to top if exists
            const item = newRecentSearches.splice(existingIndex, 1)[0];
            item.timestamp = new Date().toISOString();
            newRecentSearches.unshift(item);
        } else {
            // Add new search
            newRecentSearches.unshift({
                id: `s${Date.now()}`,
                query,
                timestamp: new Date().toISOString()
            });
        }

        // Keep only most recent searches (limit to 5)
        setRecentSearches(newRecentSearches.slice(0, 5));
    };

    // Remove a recent search
    const removeRecentSearch = (id: string) => {
        setRecentSearches(recentSearches.filter(item => item.id !== id));
    };

    // Animate search overlay in and out
    const showSearchOverlay = useCallback((shouldFocusInput = true) => {
        setIsSearching(true);
        // Reset search pagination state
        setSearchPage(1);
        setHasMoreSearchResults(true);
        setIsLoadingMoreResults(false);
        // Ensure "All" is selected by default
        setIsAllChipSelected(true);
        setSelectedType(null);

        Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            if (shouldFocusInput && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        });
    }, [overlayOpacity]);

    const hideSearchOverlay = useCallback(() => {
        Keyboard.dismiss();
        Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setIsSearching(false);
            setSearchQuery('');
            setSearchPage(1);
            setSelectedType(null);
            setIsAllChipSelected(true);
        });
    }, [overlayOpacity]);

    // Handle chip selection
    const handleChipPress = useCallback((typeId: string) => {
        // Prevent re-triggering the same chip selection
        if (typeId === 'all' && isAllChipSelected) return;
        if (typeId !== 'all' && selectedType === typeId) return;

        if (typeId === 'all') {
            // Show all workouts without type filtering
            setSelectedType(null);
            setIsAllChipSelected(true);
            // Keep any existing search query
            setSearchPage(1);
            setHasMoreSearchResults(true);

            // Make sure search overlay is shown
            if (!isSearching) {
                showSearchOverlay(false);
            }
        } else {
            // Apply type filter
            setSelectedType(typeId);
            setIsAllChipSelected(false);
            setSearchPage(1);
            setHasMoreSearchResults(true);

            // Make sure search overlay is shown
            if (!isSearching) {
                showSearchOverlay(false); // Don't focus input when selecting chips
            }
        }
    }, [isSearching, showSearchOverlay, isAllChipSelected, selectedType]);

    // Filter results based on search query and selected type
    const filteredResults = useCallback(() => {
        const query = searchQuery.toLowerCase();
        const typeFilter = selectedType ? selectedType.toLowerCase() : null;

        const userResults = USER_CREATED_WORKOUTS.filter(
            workout => {
                const matchesQuery = !query ||
                    workout.name.toLowerCase().includes(query) ||
                    workout.type.toLowerCase().includes(query);

                const matchesType = !typeFilter ||
                    workout.type.toLowerCase() === typeFilter;

                return matchesQuery && matchesType;
            }
        );

        const platformResults = allPlatformWorkouts.filter(
            workout => {
                const matchesQuery = !query ||
                    workout.name.toLowerCase().includes(query) ||
                    workout.type.toLowerCase().includes(query) ||
                    (workout.category && workout.category.toLowerCase().includes(query));

                const matchesType = !typeFilter ||
                    workout.type.toLowerCase() === typeFilter;

                return matchesQuery && matchesType;
            }
        );

        return { userWorkouts: userResults, platformWorkouts: platformResults };
    }, [searchQuery, selectedType, allPlatformWorkouts]);

    // Create Button for the header
    const createButton = (
        <PlatformPressable
            style={[styles.createButton, { borderColor }]}
            onPress={handleCreateRoutine}
        >
            <Plus size={26} color={textColor} strokeWidth={1.7} />
            {/* <ThemedText style={[styles.createButtonText, { color: accentColor }]}>
                Create
            </ThemedText> */}
        </PlatformPressable>
    );

    // Remove a workout from recent routines
    const removeFromRecentRoutines = (id: string) => {
        // In a real app, you'd remove this from user data
        console.log(`Removed workout: ${id} from recent routines`);
        // You would implement actual removal logic here
    };

    // Add function to save a platform workout to user workouts
    const saveToUserWorkouts = (workout: any) => {
        // In a real app, you'd save this to user data
        console.log(`Saved workout: ${workout.name} to user workouts`);
        // You would implement actual saving logic here
    };

    // Render a workout/routine card
    const renderWorkoutCard = (item: any, index: number) => (
        <PlatformPressable
            key={item.id}
            style={[styles.routineCard, {
                borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
            }]}
            onPress={() => handleRoutinePress(item)}
        >
            {/* {RECENT_ROUTINES.some(r => r.id === item.id) && (
                <View style={[styles.iconContainer, { backgroundColor: contrastBackgroundColor }]}>
                    <Clock size={22} color={textColorMuted} strokeWidth={1.6} />
                </View>
            )} */}

            <View style={styles.routineInfo}>
                <ThemedText style={styles.routineName} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                </ThemedText>
                <View style={styles.routineMetaRow}>
                    <ThemedText style={[styles.metaText, { color: textColorSubtle }]} numberOfLines={1} ellipsizeMode="tail">
                        {item.type}
                        {item.exercises ? ` • ${item.exercises} exercises` : item.duration ? ` • ${item.duration}` : ''}
                        {RECENT_ROUTINES.some(r => r.id === item.id) && item.lastUsed ? ` • ${item.lastUsed}` : ''}
                        {item.difficulty ? ` • ${item.difficulty}` : ''}
                    </ThemedText>
                </View>
            </View>

            {/* Action buttons with appropriate styling */}
            {RECENT_ROUTINES.some(r => r.id === item.id) && (
                <TouchableOpacity
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: contrastBackgroundColor }]}
                    onPress={() => removeFromRecentRoutines(item.id)}
                >
                    <X size={18} color={textColorMuted} strokeWidth={1.8} />
                </TouchableOpacity>
            )}

            {item.source === 'platform' && !RECENT_ROUTINES.some(r => r.id === item.id) && (
                <TouchableOpacity
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: contrastBackgroundColor }]}
                    onPress={() => saveToUserWorkouts(item)}
                >
                    <Plus size={18} color={textColorMuted} strokeWidth={1.7} />
                </TouchableOpacity>
            )}
        </PlatformPressable>
    );

    const renderSearchResultItem = (item: any, type: string, index: number = 0) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.routineCard, {
                borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0
            }]}
            onPress={() => {
                handleSearchSelection(item.name);
                handleRoutinePress(item);
                hideSearchOverlay();
            }}
        >
            <View style={styles.routineInfo}>
                <ThemedText style={styles.routineName} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                </ThemedText>
                <View style={styles.routineMetaRow}>
                    <ThemedText style={[styles.metaText, { color: textColorSubtle }]} numberOfLines={1} ellipsizeMode="tail">
                        {item.type}
                        {item.exercises ? ` • ${item.exercises} exercises` : item.duration ? ` • ${item.duration}` : ''}
                        {RECENT_ROUTINES.some(r => r.id === item.id) && item.lastUsed ? ` • ${item.lastUsed}` : ''}
                        {item.difficulty ? ` • ${item.difficulty}` : ''}
                    </ThemedText>
                </View>
            </View>

            {/* Add button only for platform routines in search results */}
            {type === 'platform' && (
                <TouchableOpacity
                    style={[styles.actionButton, styles.circleButton, { backgroundColor: contrastBackgroundColor }]}
                    onPress={(e) => {
                        e.stopPropagation();
                        saveToUserWorkouts(item);
                    }}
                >
                    <Plus size={18} color={textColorMuted} strokeWidth={1.7} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    // Render section header
    const renderSectionHeader = (title: string) => (
        <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, {
                color: textColorSubtle
            }]}>{title}</ThemedText>
        </View>
    );

    // Render chips
    const renderChip = (item: { id: string, name: string }, isInSearchView: boolean) => {
        // Determine if this chip is selected based on current state
        let isSelected = false;

        if (item.id === 'all') {
            // All chip is selected if explicitly selected
            isSelected = isAllChipSelected;
        } else {
            // Type chip is selected if it matches the selected type
            isSelected = selectedType === item.id;
        }

        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.chip,
                    { backgroundColor: isSelected ? accentColor : contrastBackgroundColor }
                ]}
                onPress={() => handleChipPress(item.id)}
            >
                <ThemedText style={[
                    styles.chipText,
                    { color: isSelected ? accentTextColor : textColorMuted }
                ]}>
                    {item.name}
                </ThemedText>
            </TouchableOpacity>
        );
    };

    // Search results component
    const { userWorkouts, platformWorkouts } = filteredResults();
    const hasResults = userWorkouts.length > 0 || platformWorkouts.length > 0;

    // Determine what to show in the search view
    const shouldShowRecentSearches = false; // We no longer show recent searches
    const shouldShowResults = true; // Always show results in the search overlay

    // Load more platform workouts
    const loadMorePlatformWorkouts = useCallback(async () => {
        if (isLoadingMore || !hasMoreWorkouts) return;

        setIsLoadingMore(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const nextPage = page + 1;
        const ITEMS_PER_PAGE = 10;

        // In a real app, this would be an API call with the page parameter
        // For now, we're generating more mock data
        const newWorkouts = generatePlatformWorkouts(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

        // Check if we've reached the end (mock a maximum of 5 pages)
        if (nextPage >= 5) {
            setHasMoreWorkouts(false);
        }

        // Add new workouts to the existing list
        setAllPlatformWorkouts(prev => [...prev, ...newWorkouts]);
        setPage(nextPage);
        setIsLoadingMore(false);
    }, [isLoadingMore, hasMoreWorkouts, page]);

    // Load more search results
    const loadMoreSearchResults = useCallback(async () => {
        if (isLoadingMoreResults || !hasMoreSearchResults || !shouldShowResults) return;

        setIsLoadingMoreResults(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const nextPage = searchPage + 1;
        const ITEMS_PER_PAGE = 10;

        // In a real app, this would be an API call with the page parameter
        // For search results from the platform library
        const moreResults = generatePlatformWorkouts(ITEMS_PER_PAGE, nextPage * ITEMS_PER_PAGE)
            .filter(workout => {
                const query = searchQuery.toLowerCase();
                const typeFilter = selectedType ? selectedType.toLowerCase() : null;

                const matchesQuery = !query ||
                    workout.name.toLowerCase().includes(query) ||
                    workout.type.toLowerCase().includes(query) ||
                    (workout.category && workout.category.toLowerCase().includes(query));

                const matchesType = !typeFilter ||
                    workout.type.toLowerCase() === typeFilter;

                return matchesQuery && matchesType;
            });

        // Check if we've reached the end (mock a maximum of 5 pages for search)
        if (nextPage >= 5 || moreResults.length === 0) {
            setHasMoreSearchResults(false);
        }

        // Update search results
        setAllPlatformWorkouts(prev => [...prev, ...moreResults]);
        setSearchPage(nextPage);
        setIsLoadingMoreResults(false);
    }, [isLoadingMoreResults, hasMoreSearchResults, searchPage, searchQuery, selectedType, shouldShowResults]);

    // Debounced load more functions for better performance
    const debouncedLoadMore = useCallback(
        debounce(() => {
            if (!isLoadingMore && hasMoreWorkouts) {
                loadMorePlatformWorkouts();
            }
        }, 300),
        [loadMorePlatformWorkouts, isLoadingMore, hasMoreWorkouts]
    );

    const debouncedLoadMoreSearch = useCallback(
        debounce(() => {
            if (!isLoadingMoreResults && hasMoreSearchResults && shouldShowResults) {
                loadMoreSearchResults();
            }
        }, 300),
        [loadMoreSearchResults, isLoadingMoreResults, hasMoreSearchResults, shouldShowResults]
    );

    // Memoize renderItem functions for FlatList to prevent unnecessary re-renders
    const renderWorkoutCardMemoized = useCallback(
        ({ item, index }: { item: any; index: number }) => renderWorkoutCard(item, index),
        [renderWorkoutCard]
    );

    const renderSearchResultItemMemoized = useCallback(
        ({ item, index }: { item: any; index: number }) => renderSearchResultItem(item, 'platform', index),
        [renderSearchResultItem]
    );

    const renderUserSearchResultItemMemoized = useCallback(
        ({ item, index }: { item: any; index: number }) => renderSearchResultItem(item, 'user', index),
        [renderSearchResultItem]
    );

    // Tab switching function
    const handleTabChange = (tab: 'routines' | 'regiments') => {
        setActiveTab(tab);
    };

    return (
        <ThemedView style={styles.screen}>
            <StandardHeader
                title="Program Library"
                rightContent={createButton}
            />

            <PageContainer
                hasHeader={true}
                style={styles.container}
            >
                <View style={styles.contentContainer}>
                    {/* Tab switcher */}
                    <View style={[styles.tabContainer]}>
                        <TouchableOpacity 
                            style={[
                                styles.tabButton, 
                                activeTab === 'routines' && [styles.activeTabButton, { backgroundColor: contrastBackgroundColor }]
                            ]}
                            onPress={() => handleTabChange('routines')}
                        >
                            <ThemedText style={[
                                styles.tabText, 
                                { color: activeTab === 'routines' ? textColor : textColorMuted }
                            ]}>
                                Routines
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.tabButton, 
                                activeTab === 'regiments' && [styles.activeTabButton, { backgroundColor: contrastBackgroundColor }]
                            ]}
                            onPress={() => handleTabChange('regiments')}
                        >
                            <ThemedText style={[
                                styles.tabText, 
                                { color: activeTab === 'regiments' ? textColor : textColorMuted }
                            ]}>
                                Regiments
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Render content based on active tab */}
                    {activeTab === 'routines' ? (
                        <>
                            {/* Search bar now in main content */}
                            <TouchableOpacity
                                style={[styles.searchBarContainer, { backgroundColor: contrastBackgroundColor, borderColor }]}
                                onPress={() => showSearchOverlay(true)}
                                activeOpacity={0.7}
                            >
                                <Search size={20} color={textColorMuted} style={styles.searchIcon} strokeWidth={2} />
                                <ThemedText
                                    style={[styles.searchPlaceholder, { color: textColorMuted }]}
                                >
                                    Search Routines...
                                </ThemedText>
                            </TouchableOpacity>

                            <ScrollView style={styles.scrollContainer}>
                                {/* User Created Workouts Section */}
                                {renderSectionHeader('Saved Routines')}
                                <ThemedSection style={styles.section}>
                                    <View>

                                        {USER_CREATED_WORKOUTS.map(renderWorkoutCard)}
                                        <TouchableOpacity
                                            style={[styles.createWorkoutButton, { backgroundColor: contrastBackgroundColor }]}
                                            onPress={handleCreateRoutine}
                                        >
                                            <Plus size={20} color={textColor} strokeWidth={1.7} />
                                            <ThemedText style={[styles.createWorkoutText, { color: textColor }]}>
                                                Create Routine
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </ThemedSection>


                                {/* Platform Workouts Section */}
                                <View style={styles.section}>
                                    {renderSectionHeader('Routine Library')}
                                    <ThemedSection style={styles.section}>
                                        <FlatList
                                            data={allPlatformWorkouts}
                                            renderItem={renderWorkoutCardMemoized}
                                            keyExtractor={item => item.id}
                                            onEndReached={debouncedLoadMore}
                                            onEndReachedThreshold={0.5}
                                            scrollEnabled={false} // Disable scrolling since parent ScrollView handles it
                                            initialNumToRender={10}
                                            maxToRenderPerBatch={10}
                                            windowSize={15}
                                            removeClippedSubviews={true}
                                            ListFooterComponent={
                                                isLoadingMore ? (
                                                    <View style={styles.loadingFooter}>
                                                        <ActivityIndicator size="small" color={accentColor} />
                                                        <ThemedText style={styles.loadingText}>Loading more workouts...</ThemedText>
                                                    </View>
                                                ) : null
                                            }
                                        />
                                    </ThemedSection>
                                </View>
                            </ScrollView>
                        </>
                    ) : (
                        // Empty Regiment view - will be implemented later
                        <View style={styles.emptyRegimentContainer}>
                            <ThemedText style={styles.emptyRegimentText}>
                                Regiment features coming soon
                            </ThemedText>
                        </View>
                    )}
                </View>
            </PageContainer>

            {/* Persistent Search Overlay with opacity animation only */}
            <Animated.View
                style={[
                    styles.persistentSearchOverlay,
                    {
                        opacity: overlayOpacity,
                        backgroundColor: overlayBgColor,
                        display: isSearching ? 'flex' : 'none'
                    }
                ]}
                pointerEvents={isSearching ? 'auto' : 'none'}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={10}
                >
                    <View style={[styles.searchHeader, { paddingTop: insets.top + 8 }]}>
                        <View style={[styles.searchInputContainer, { backgroundColor: inputBgColor, borderColor }]}>
                            <Search size={18} color={textColorMuted} style={styles.searchIcon} />
                            <TextInput
                                ref={searchInputRef}
                                style={[styles.searchInput, { color: textColor }]}
                                placeholder="Search routines..."
                                placeholderTextColor={textColorMuted} // 50% opacity
                                value={searchQuery}
                                onChangeText={handleSearchChange}
                                returnKeyType="search"
                                autoCorrect={false}
                            />
                            {searchQuery ? (
                                <TouchableOpacity
                                    onPress={() => setSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <X size={16} color={textColor} />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <TouchableOpacity
                            onPress={hideSearchOverlay}
                            style={styles.cancelButton}
                        >
                            <ThemedText style={[styles.cancelText, { color: textColor }]}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Workout Type Chips in Search View - more compact */}
                    <View style={{ marginBottom: 2 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={[styles.chipsContainer, { paddingHorizontal: SPACING.pageHorizontal }]}
                        >
                            {WORKOUT_TYPES.map(type => renderChip(type, true))}
                        </ScrollView>
                    </View>

                    <ScrollView
                        style={styles.searchResultsContainer}
                        contentContainerStyle={{ paddingTop: 8 }}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="none"
                    >
                        {shouldShowResults && !hasResults && (
                            <View style={styles.noResultsContainer}>
                                <ThemedText style={styles.noResultsText}>
                                    {hasSearchQuery ?
                                        `No routines found matching "${searchQuery}"` :
                                        `No ${selectedType} routines found`}
                                </ThemedText>
                            </View>
                        )}

                        {shouldShowResults && userWorkouts.length > 0 && (

                            <View style={{ paddingHorizontal: SPACING.pageHorizontal }}>
                                {renderSectionHeader('Saved Routines')}
                                <ThemedSection style={styles.section}>
                                    <FlatList
                                        data={userWorkouts}
                                        renderItem={renderUserSearchResultItemMemoized}
                                        keyExtractor={item => item.id}
                                        scrollEnabled={false}
                                        initialNumToRender={10}
                                        maxToRenderPerBatch={10}
                                        windowSize={10}
                                        removeClippedSubviews={true}
                                    />
                                </ThemedSection>

                            </View>
                        )}

                        {shouldShowResults && platformWorkouts.length > 0 && (
                            <View style={{ paddingHorizontal: SPACING.pageHorizontal }}>
                                {renderSectionHeader('Routine Library')}
                                <ThemedSection style={styles.section}>
                                    <FlatList
                                        ref={searchResultsListRef}
                                        data={platformWorkouts}
                                        renderItem={renderSearchResultItemMemoized}
                                        keyExtractor={item => item.id}
                                        onEndReached={debouncedLoadMoreSearch}
                                        onEndReachedThreshold={0.5}
                                        scrollEnabled={false}
                                        initialNumToRender={10}
                                        maxToRenderPerBatch={10}
                                        windowSize={10}
                                        removeClippedSubviews={true}
                                        ListFooterComponent={
                                            isLoadingMoreResults ? (
                                                <View style={styles.loadingFooter}>
                                                    <ActivityIndicator size="small" color={accentColor} />
                                                    <ThemedText style={styles.loadingText}>Loading more results...</ThemedText>
                                                </View>
                                            ) : null
                                        }
                                    />
                                </ThemedSection>

                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>
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
    contentContainer: {
        flex: 1,
        paddingTop: SPACING.pageHorizontal
    },
    scrollContainer: {
        flex: 1,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        height: 42,
        paddingHorizontal: 12,
        marginBottom: 28
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        marginRight: -4,
        borderRadius: 20,
        borderStyle: 'solid',
    },
    createButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginBottom: 32
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    routineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.pageHorizontalInside,
        borderTopColor: 'rgba(100, 100, 100, 0.5)',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.pageHorizontal,
        paddingVertical: 8,
    },
    searchInputContainer: {
        flex: 1,
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
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        padding: 0,
    },
    searchPlaceholder: {
        fontSize: 16,
        fontWeight: '400',
    },
    clearButton: {
        padding: 4,
    },
    cancelButton: {
        marginLeft: 10,
        paddingHorizontal: 10,
    },
    cancelText: {
        fontSize: 16,
    },
    createWorkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        height: 42,
        marginTop: 12,
        marginBottom: SPACING.pageHorizontalInside
    },
    createWorkoutText: {
        marginLeft: 6,
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '400',
    },
    persistentSearchOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
    },
    searchResultsContainer: {
        flex: 1,
        paddingTop: 10,
    },
    recentSearchesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    clearAllText: {
        fontSize: 13,
        fontWeight: '500',
    },
    noResultsContainer: {
        paddingTop: 32,
        alignItems: 'center',
        paddingHorizontal: SPACING.pageHorizontal,
    },
    noResultsText: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center',
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
        alignSelf: 'center',
    },
    circleButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipsContainer: {
        flexDirection: 'row',
        paddingTop: 12,
        paddingBottom: 12,
    },
    chip: {
        borderRadius: 12,
        paddingHorizontal: 18,
        marginRight: 8,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '400',
    },
    loadingFooter: {
        padding: 10,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.pageHorizontal,
        // marginHorizontal: SPACING.pageHorizontal,
        // width: '100%',
        height: 42,
        borderRadius: 10,
        backgroundColor: 'rgba(100, 100, 100, 0.1)',
        padding: 5
    },
    tabButton: {
        flex: 0.5,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 0
    },
    activeTabButton: {
        borderBottomWidth: 0,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '400',
    },
    emptyRegimentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyRegimentText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
});
