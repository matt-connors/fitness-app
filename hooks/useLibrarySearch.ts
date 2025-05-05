import { useState, useCallback, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { debounce } from '@/utils/debounce';
import { Routine } from '@/lib/graphql/types';
import { generatePlatformWorkouts } from '@/constants/MockData';

const ITEMS_PER_PAGE = 10;

export function useLibrarySearch() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAllChipSelected, setIsAllChipSelected] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Search pagination states
  const [isLoadingMoreResults, setIsLoadingMoreResults] = useState(false);
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true);
  const [searchPage, setSearchPage] = useState(1);

  // Handle search query changes
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

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
    }).start();
    
    return shouldFocusInput;
  }, [overlayOpacity]);

  const hideSearchOverlay = useCallback(() => {
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
  const handleChipPress = useCallback((typeId: string, resetCallback?: () => void) => {
    // Prevent re-triggering the same chip selection
    if (typeId === 'all' && isAllChipSelected) return;
    if (typeId !== 'all' && selectedType === typeId) return;

    if (typeId === 'all') {
      // Show all workouts without type filtering
      setSelectedType(null);
      setIsAllChipSelected(true);
      // Reset search pagination
      setSearchPage(1);
      setHasMoreSearchResults(true);
      
      // Reset GraphQL pagination if callback provided
      if (resetCallback) resetCallback();
    } else {
      // Apply type filter
      setSelectedType(typeId);
      setIsAllChipSelected(false);
      // Reset search pagination
      setSearchPage(1);
      setHasMoreSearchResults(true);
      
      // Reset GraphQL pagination if callback provided
      if (resetCallback) resetCallback();
    }

    // Make sure search overlay is shown
    if (!isSearching) {
      showSearchOverlay(false); // Don't focus input when selecting chips
    }
  }, [isSearching, showSearchOverlay, isAllChipSelected, selectedType]);

  // Filter results based on search query and selected type
  const filterResults = useCallback((userRoutines: Routine[], platformWorkouts: any[]) => {
    const query = searchQuery.toLowerCase();
    const typeFilter = selectedType ? selectedType.toLowerCase() : null;

    const userResults = userRoutines.filter(
      workout => {
        const matchesQuery = !query ||
          workout.name.toLowerCase().includes(query) ||
          workout.type.toLowerCase().includes(query);

        const matchesType = !typeFilter ||
          workout.type.toLowerCase() === typeFilter;

        return matchesQuery && matchesType;
      }
    );

    const platformResults = platformWorkouts.filter(
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
  }, [searchQuery, selectedType]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async (allPlatformWorkouts: any[]) => {
    if (isLoadingMoreResults || !hasMoreSearchResults) return;

    setIsLoadingMoreResults(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const nextPage = searchPage + 1;

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

    // Return the new results
    setSearchPage(nextPage);
    setIsLoadingMoreResults(false);
    
    return moreResults;
  }, [isLoadingMoreResults, hasMoreSearchResults, searchPage, searchQuery, selectedType]);

  // Debounced load more function
  const debouncedLoadMoreSearch = useCallback(
    debounce((allPlatformWorkouts: any[], setAllPlatformWorkouts: (workouts: any[]) => void) => {
      if (!isLoadingMoreResults && hasMoreSearchResults) {
        loadMoreSearchResults(allPlatformWorkouts).then(
          moreResults => {
            if (moreResults && moreResults.length > 0) {
              setAllPlatformWorkouts([...allPlatformWorkouts, ...moreResults]);
            }
          }
        );
      }
    }, 300),
    [loadMoreSearchResults, isLoadingMoreResults, hasMoreSearchResults]
  );

  return {
    // State
    searchQuery,
    isSearching,
    selectedType,
    isAllChipSelected,
    overlayOpacity,
    isLoadingMoreResults,
    hasMoreSearchResults,
    searchPage,
    
    // Functions
    setSearchQuery,
    handleSearchChange,
    showSearchOverlay,
    hideSearchOverlay,
    handleChipPress,
    filterResults,
    loadMoreSearchResults,
    debouncedLoadMoreSearch
  };
} 