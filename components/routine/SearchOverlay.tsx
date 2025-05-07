import React, { useRef, RefObject } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { FilterChips } from './FilterChips';
import { SearchBar } from '@/components/ui/SearchBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routine } from '@/lib/graphql/types';
import { ThemedSection } from '@/components/ThemedSection';

interface SearchOverlayProps {
  visible: boolean;
  opacity: Animated.Value;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClear: () => void;
  onCancel: () => void;
  filterChipsData: Array<{ id: string, name: string }>;
  selectedFilterId: string | null;
  isAllChipSelected: boolean;
  onChipPress: (id: string) => void;
  userRoutines: Routine[];
  platformRoutines: any[];
  fetching: boolean;
  error: Error | undefined;
  hasMoreRoutines: boolean;
  onLoadMore: () => void;
  onRoutinePress: (routine: any) => void;
  onSaveToLibrary: (routine: any) => void;
  onSearchSelection?: (query: string) => void;
  onRetry: () => void;
  searchRef: RefObject<TextInput>;
  renderUserRoutineItem: ({ item, index }: { item: any, index: number }) => JSX.Element;
  renderPlatformRoutineItem: ({ item, index }: { item: any, index: number }) => JSX.Element;
}

export const SearchOverlay = ({
  visible,
  opacity,
  searchQuery,
  onSearchChange,
  onClear,
  onCancel,
  filterChipsData,
  selectedFilterId,
  isAllChipSelected,
  onChipPress,
  userRoutines,
  platformRoutines,
  fetching,
  error,
  hasMoreRoutines,
  onLoadMore,
  onRoutinePress,
  onSaveToLibrary,
  onSearchSelection,
  onRetry,
  searchRef,
  renderUserRoutineItem,
  renderPlatformRoutineItem
}: SearchOverlayProps) => {
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor('brand');
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const textColorSubtle = useThemeColor('textSecondary');
  const overlayBgColor = useThemeColor('background');
  const inputBgColor = useThemeColor('background');
  const borderColor = useThemeColor('border');

  const hasResults = userRoutines.length > 0 || platformRoutines.length > 0;

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={[styles.sectionTitle, {
        color: textColorSubtle
      }]}>{title}</ThemedText>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.persistentSearchOverlay,
        {
          opacity,
          backgroundColor: overlayBgColor,
          display: visible ? 'flex' : 'none'
        }
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={10}
      >
        <View style={[styles.searchHeader, { paddingTop: 28 }]}>
          <SearchBar
            ref={searchRef}
            active={true}
            value={searchQuery}
            onChangeText={onSearchChange}
            onClear={() => onClear()}
            placeholder="Search Routines..."
            style={styles.searchInputContainer}
          />
          <TouchableOpacity
            onPress={onCancel}
            style={styles.cancelButton}
          >
            <ThemedText style={[styles.cancelText, { color: textColor }]}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Workout Type Chips in Search View - more compact */}
        <View style={styles.filterChipsContainer}>
          <FilterChips
            data={filterChipsData}
            selectedId={selectedFilterId}
            isAllSelected={isAllChipSelected}
            onChipPress={onChipPress}
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Error loading routines: {error.message}
            </ThemedText>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={onRetry}
            >
              <ThemedText style={{ color: accentColor }}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : fetching && !hasResults ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <ThemedText style={styles.loadingText}>Searching routines...</ThemedText>
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={() => (
              <>
                {!hasResults && (
                  <View style={styles.noResultsContainer}>
                    <ThemedText style={styles.noResultsText}>
                      {searchQuery ? 
                        `No routines found matching "${searchQuery}"` :
                        `No ${selectedFilterId || ''} routines found`}
                    </ThemedText>
                  </View>
                )}

                {userRoutines.length > 0 && (
                  <View style={styles.sectionContainer}>
                    {renderSectionHeader('Your Routines')}
                    <ThemedSection>
                      <FlatList
                        data={userRoutines}
                        renderItem={renderUserRoutineItem}
                        keyExtractor={item => item.id.toString()}
                        scrollEnabled={false}
                      />
                    </ThemedSection>
                  </View>
                )}
              </>
            )}
            data={platformRoutines.length > 0 ? [{ id: 'header' }] : []}
            renderItem={() => (
              <View style={styles.sectionContainer}>
                {renderSectionHeader('Routine Library')}
                <ThemedSection>
                  <FlatList
                    data={platformRoutines}
                    renderItem={renderPlatformRoutineItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                  />
                </ThemedSection>
              </View>
            )}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => (
              fetching && hasResults ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={accentColor} />
                  <ThemedText style={styles.loadingText}>Loading more routines...</ThemedText>
                </View>
              ) : null
            )}
            contentContainerStyle={{ 
            //   paddingTop: 8,
              paddingBottom: 50,
              flexGrow: !hasResults ? 1 : undefined
            }}
          />
        )}
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  persistentSearchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: 42
  },
  searchInputContainer: {
    flex: 1,
  },
  cancelButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  cancelText: {
    fontSize: 16,
  },
  filterChipsContainer: {
    // marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    marginTop: 14,
    marginBottom: 4,
    fontWeight: '500',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingFooter: {
    padding: 10,
    alignItems: 'center',
  },
  noResultsContainer: {
    paddingTop: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 