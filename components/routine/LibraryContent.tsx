import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { TabSwitcher } from '@/components/ui/TabSwitcher';
import { RefreshIndicator } from '@/components/ui/RefreshIndicator';
import { UserRoutinesList } from './UserRoutinesList';
import { PlatformRoutinesList } from './PlatformRoutinesList';
import { EmptyRegimentsView } from './EmptyRegimentsView';
import { SPACING } from '@/constants/Spacing';
import { PaginatedRoutines } from '@/lib/graphql/types';

interface LibraryContentProps {
  activeTab: 'routines' | 'regiments';
  onTabChange: (tabId: string) => void;
  onSearchPress: () => void;
  fetching: boolean;
  isRefreshing: boolean;
  userRoutines: PaginatedRoutines;
  graphqlPage: number;
  renderRoutineCard: (routine: any, index: number) => JSX.Element;
  renderPlatformRoutineCard: (item: any, index: number) => JSX.Element;
  onCreateRoutinePress: () => void;
  allPlatformWorkouts: any[];
  isLoadingMore: boolean;
  onEndReached: () => void;
  isUserRoutinesLoading?: boolean;
  isStale?: boolean;
}

export const LibraryContent = ({
  activeTab,
  onTabChange,
  onSearchPress,
  fetching,
  isRefreshing,
  userRoutines,
  graphqlPage,
  renderRoutineCard,
  renderPlatformRoutineCard,
  onCreateRoutinePress,
  allPlatformWorkouts,
  isLoadingMore,
  onEndReached,
  isUserRoutinesLoading = false,
  isStale = false
}: LibraryContentProps) => {
  // Only show refresh indicator for explicit refresh actions, not initial loads or background refreshes
  const shouldShowRefreshIndicator = isRefreshing && !isUserRoutinesLoading;
  
  // DEBUG: Log what data this component is receiving
  console.log('LibraryContent receiving:', {
    userRoutinesCount: userRoutines.routines.length,
    isUserRoutinesLoading,
    isStale,
    fetching,
    isRefreshing,
    shouldShowRefreshIndicator
  });
  
  // Log the first routine if available
  if (userRoutines.routines.length > 0) {
    console.log('First routine in LibraryContent:', userRoutines.routines[0].name);
  } else {
    console.log('No routines in LibraryContent');
  }
  
  return (
    <View style={styles.contentContainer}>
      {/* Tab switcher */}
      {/* TEMP: DISABLED FOR NOW */}
      {/* <TabSwitcher
        tabs={[
          { id: 'routines', label: 'Routines' },
          { id: 'regiments', label: 'Regiments' }
        ]}
        activeTab={activeTab}
        onTabChange={onTabChange}
        style={{ marginBottom: SPACING.pageHorizontal }}
      /> */}

      {/* Render content based on active tab */}
      {activeTab === 'routines' ? (
        <>
          {/* Search bar */}
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="Search Routines..."
            active={false}
            onPressIn={onSearchPress}
            style={{ marginBottom: 28, marginTop: 12 }}
          />

          {/* Only show small loading indicator for explicit refreshes, not background fetches */}
          {shouldShowRefreshIndicator && (
            <RefreshIndicator 
              fetching={isRefreshing} 
            />
          )}

          {/* Always show content, even while fetching */}
          <ScrollView style={styles.scrollContainer}>
            {/* User Created Workouts Section (from GraphQL) */}
            <UserRoutinesList
              routines={userRoutines.routines}
              fetching={fetching}
              graphqlPage={graphqlPage}
              renderRoutineCard={renderRoutineCard}
              onCreateRoutinePress={onCreateRoutinePress}
              sectionTitle="Your Routines"
              isLoading={isUserRoutinesLoading}
              isStale={isStale && fetching} // Only show stale indicator when actually fetching
            />

            {/* Platform Workouts Section (from mock data) */}
            <PlatformRoutinesList
              data={allPlatformWorkouts}
              isLoading={isLoadingMore}
              onEndReached={onEndReached}
              renderItem={renderPlatformRoutineCard}
              sectionTitle="Routine Library"
            />
          </ScrollView>
        </>
      ) : (
        <EmptyRegimentsView />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: SPACING.pageHorizontal
  },
  scrollContainer: {
    flex: 1,
  }
}); 