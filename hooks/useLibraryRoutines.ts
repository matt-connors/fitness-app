import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { DELETE_ROUTINE } from '@/lib/graphql/mutations';
import { GET_USER_ROUTINES } from '@/lib/graphql/queries';
import { PaginatedRoutines, RoutineType, SkillLevel, UserRoutineRole } from '@/lib/graphql/types';
import { INITIAL_PLATFORM_WORKOUTS, generatePlatformWorkouts } from '@/constants/MockData';

// Constants
const CURRENT_USER_ID = 1;
const ITEMS_PER_PAGE = 10;

// FIXED static data - never changes
const STATIC_ROUTINES: PaginatedRoutines = {
  routines: [
    { 
      id: 1, 
      name: "Upper Body Strength", 
      type: RoutineType.Strength,
      skillLevel: SkillLevel.Intermediate,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
      userRoutines: [{ role: UserRoutineRole.Creator }],
    },
    { 
      id: 2, 
      name: "Core Workout", 
      type: RoutineType.Strength, 
      skillLevel: SkillLevel.Beginner,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
      userRoutines: [{ role: UserRoutineRole.Creator }],
    },
    { 
      id: 3, 
      name: "HIIT Cardio", 
      type: RoutineType.Endurance,
      skillLevel: SkillLevel.Advanced,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
      userRoutines: [{ role: UserRoutineRole.Creator }],
    }
  ],
  totalCount: 3,
  hasMore: false
};

/**
 * Marks the routine cache as needing a refresh.
 * Call this function after creating or editing a routine.
 */
export function markRoutinesNeedRefresh() {
  // Intentionally empty - we'll let Apollo handle cache invalidation
  console.log('[Cache] Routine created or edited, Apollo will handle cache updates');
}

/**
 * Custom hook for managing library routines
 */
export function useLibraryRoutines(
  activeTab: 'routines' | 'regiments',
  selectedType: string | null
) {
  // Simple state for platform workouts
  const [allPlatformWorkouts] = useState(INITIAL_PLATFORM_WORKOUTS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true);
  const [graphqlPage, setGraphqlPage] = useState(0);
  
  // Use Apollo's useQuery hook directly
  const { data, loading, error, refetch } = useQuery(GET_USER_ROUTINES, {
    variables: {
      userId: CURRENT_USER_ID,
      skip: 0,
      take: ITEMS_PER_PAGE,
      type: selectedType || undefined,
    },
    fetchPolicy: activeTab === 'routines' ? 'cache-and-network' : 'cache-only',
    skip: activeTab !== 'routines',
    notifyOnNetworkStatusChange: true,
    // Critical: add initial static data when loading to avoid empty screens
    onCompleted: (data) => {
      console.log(`Query completed with ${data?.userRoutines?.routines?.length || 0} routines`);
    }
  });
  
  // Extract user routines from query data with fallback to static data for immediate rendering
  const userRoutines: PaginatedRoutines = data?.userRoutines || 
    // Use static data as a fallback only for the first load
    (loading && activeTab === 'routines' ? STATIC_ROUTINES : { 
      routines: [], 
      totalCount: 0, 
      hasMore: false 
    });
  
  // GraphQL mutation for deleting routines
  const [deleteRoutine] = useMutation(DELETE_ROUTINE);
  
  // Load more platform workouts (mock data, unchanged)
  const loadMorePlatformWorkouts = useCallback(async () => {
    if (isLoadingMore || !hasMoreWorkouts) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = graphqlPage + 1;
      const newWorkouts = generatePlatformWorkouts(ITEMS_PER_PAGE, graphqlPage * ITEMS_PER_PAGE);
      
      if (nextPage >= 5) {
        setHasMoreWorkouts(false);
      }
      
      // Since we're using a constant now, don't update
      console.log(`[Mock] Would add ${newWorkouts.length} more platform workouts`);
      setGraphqlPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreWorkouts, graphqlPage]);
  
  // Load more routines
  const loadMoreRoutines = useCallback(() => {
    if (loading || !userRoutines.hasMore) return;
    
    const nextPage = graphqlPage + 1;
    setGraphqlPage(nextPage);
    
    // We'll keep this simplified for now and not implement pagination
    console.log('Pagination not fully implemented in simplified version');
  }, [loading, userRoutines.hasMore, graphqlPage]);
  
  // Handle delete routine
  const handleDeleteRoutine = useCallback(async (routineId: number, routineName: string) => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        "Delete Routine",
        `Are you sure you want to delete "${routineName}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false)
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteRoutine({ 
                  variables: { id: routineId },
                  update: (cache) => {
                    // Remove the deleted routine from cache
                    const cacheId = `Routine:${routineId}`;
                    cache.evict({ id: cacheId });
                    cache.gc();
                    
                    // Update the userRoutines query in cache directly
                    const cacheKey = cache.identify({
                      __typename: 'Query',
                    });
                    
                    // Get existing data from cache
                    const existingData = cache.readQuery<{
                      userRoutines: PaginatedRoutines
                    }>({
                      query: GET_USER_ROUTINES,
                      variables: {
                        userId: CURRENT_USER_ID,
                        skip: 0,
                        take: ITEMS_PER_PAGE,
                        type: selectedType || undefined,
                      }
                    });
                    
                    if (existingData && existingData.userRoutines) {
                      // Update routines list by removing the deleted routine
                      const updatedRoutines = {
                        ...existingData.userRoutines,
                        routines: existingData.userRoutines.routines.filter(
                          (r) => r.id !== routineId
                        ),
                        totalCount: existingData.userRoutines.totalCount - 1
                      };
                      
                      // Write the updated data back to cache
                      cache.writeQuery({
                        query: GET_USER_ROUTINES,
                        variables: {
                          userId: CURRENT_USER_ID,
                          skip: 0,
                          take: ITEMS_PER_PAGE,
                          type: selectedType || undefined,
                        },
                        data: {
                          userRoutines: updatedRoutines
                        }
                      });
                    }
                  }
                });
                
                // No need to refetch as we've updated the cache directly
                resolve(true);
              } catch (error) {
                console.error('Error deleting routine:', error);
                Alert.alert("Error", "Failed to delete routine");
                reject(error);
              }
            }
          }
        ]
      );
    });
  }, [deleteRoutine, selectedType]);
  
  // Track last refresh time
  const lastRefreshRef = useRef(Date.now());
  
  // Focus-related handlers - simplified
  const refreshOnFocus = useCallback(() => {
    console.log('[Focus] Event triggered');
    
    // Only refetch if we're on the routines tab AND it's been more than 5 minutes
    if (activeTab === 'routines') {
      const now = Date.now();
      const fiveMinutesMs = 5 * 60 * 1000;
      
      if (now - lastRefreshRef.current > fiveMinutesMs) {
        console.log('[Focus] Refreshing data after 5+ minutes');
        lastRefreshRef.current = now;
        refetch();
      } else {
        console.log('[Focus] Skipping refresh, data is fresh');
      }
    }
  }, [activeTab, refetch]);
  
  // No-op function for blur events
  const resetFocusFlag = useCallback(() => {
    console.log('[Blur] Event triggered');
  }, []);
  
  // Simple tab switching
  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    
    // Reset pagination when switching tabs
    setGraphqlPage(0);
  }, [activeTab]);
  
  // Reset pagination
  const resetPagination = useCallback(() => {
    setGraphqlPage(0);
  }, []);
  
  // Return the same interface as before but with simplified implementation
  return {
    userRoutines,
    allPlatformWorkouts,
    fetching: loading,
    isRefreshing: loading,
    isLoadingMore,
    error,
    hasMoreRoutines: userRoutines.hasMore,
    hasMoreWorkouts,
    graphqlPage,
    refreshOnFocus,
    resetFocusFlag,
    loadMorePlatformWorkouts,
    loadMoreRoutines,
    handleDeleteRoutine,
    handleTabChange,
    resetPagination,
    reexecuteRoutinesQuery: refetch
  };
} 