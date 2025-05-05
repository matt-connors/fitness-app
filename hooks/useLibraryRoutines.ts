import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useQuery, useMutation, NetworkStatus } from '@apollo/client';
import { DELETE_ROUTINE } from '@/lib/graphql/mutations';
import { GET_USER_ROUTINES } from '@/lib/graphql/queries';
import { PaginatedRoutines, RoutineType, SkillLevel, UserRoutineRole } from '@/lib/graphql/types';
import { INITIAL_PLATFORM_WORKOUTS, generatePlatformWorkouts } from '@/constants/MockData';

// Constants
const CURRENT_USER_ID = 1;
const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

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
  // Set a flag in a module-level variable
  console.log('[Cache] Routine created or edited, marking for refresh');
  // @ts-ignore
  global._routineCreatedOrEdited = true;
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
  
  // Use Apollo's useQuery hook with optimized configuration
  const { data, loading, error, refetch, networkStatus } = useQuery(GET_USER_ROUTINES, {
    variables: {
      userId: CURRENT_USER_ID,
      skip: 0,
      take: ITEMS_PER_PAGE,
      type: selectedType || undefined,
    },
    // Use cache-first for initial load, but ensure network refresh
    fetchPolicy: activeTab === 'routines' ? 'cache-and-network' : 'cache-only',
    // Important: Return partial data to show UI faster
    returnPartialData: true,
    skip: activeTab !== 'routines',
    notifyOnNetworkStatusChange: true,
    // Add default static data to the cache if empty
    onCompleted: (data) => {
      console.log(`Query completed with ${data?.userRoutines?.routines?.length || 0} routines`);
    }
  });
  
  // Determine if data is updating (vs initial load)
  const isUpdating = networkStatus === NetworkStatus.refetch || 
                    networkStatus === NetworkStatus.poll;
  
  // Extract user routines from query data without mock data fallback
  const userRoutines: PaginatedRoutines = data?.userRoutines || { 
    routines: [], 
    totalCount: 0, 
    hasMore: false 
  };
  
  // GraphQL mutation for deleting routines
  const [deleteRoutine] = useMutation(DELETE_ROUTINE);
  
  // Load more platform workouts (without mock data)
  const loadMorePlatformWorkouts = useCallback(async () => {
    if (isLoadingMore || !hasMoreWorkouts) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = graphqlPage + 1;
      
      if (nextPage >= 5) {
        setHasMoreWorkouts(false);
      }
      
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
  
  // Enhanced focus-related handlers with better timing and error handling
  const refreshOnFocus = useCallback(() => {
    console.log('[Focus] Event triggered');
    
    // Check if we just created/edited a routine and need to refresh
    // @ts-ignore
    if (global._routineCreatedOrEdited) {
      console.log('[Focus] Refreshing after routine creation/edit');
      // @ts-ignore
      global._routineCreatedOrEdited = false;
      // Perform the refresh
      refetch().catch(err => {
        console.error('[Focus] Error refreshing after creation/edit:', err);
      });
      // Update last refresh time
      lastRefreshRef.current = Date.now();
      return;
    }
    
    // Smarter refresh logic with timeout protection
    if (activeTab === 'routines') {
      const now = Date.now();
      
      if (now - lastRefreshRef.current > REFRESH_INTERVAL_MS) {
        console.log('[Focus] Refreshing data after time interval');
        lastRefreshRef.current = now;
        
        // Add timeout protection for the refetch
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Refresh timeout')), 10000);
        });
        
        Promise.race([refetch(), timeoutPromise])
          .catch(err => {
            console.error('[Focus] Refresh error or timeout:', err);
          });
      } else {
        console.log('[Focus] Skipping refresh, data is fresh');
      }
    }
  }, [activeTab, refetch]);
  
  // Add AppState listener for more reliable foreground/background detection
  useEffect(() => {
    if (activeTab !== 'routines') return;
    
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[AppState] App came to foreground, checking refresh');
        refreshOnFocus();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [activeTab, refreshOnFocus]);
  
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
  
  return {
    userRoutines,
    allPlatformWorkouts,
    fetching: loading && !isUpdating, // Only true for initial load
    isRefreshing: false, // Don't show pull-to-refresh indicator
    isUpdating, // New property to show inline "updating..." text
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