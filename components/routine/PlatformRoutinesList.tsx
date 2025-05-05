import React from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSection } from '@/components/ThemedSection';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';

interface PlatformRoutinesListProps {
  data: any[];
  isLoading: boolean;
  onEndReached: () => void;
  renderItem: (item: any, index: number) => JSX.Element;
  sectionTitle: string;
}

export const PlatformRoutinesList = ({
  data,
  isLoading,
  onEndReached,
  renderItem,
  sectionTitle
}: PlatformRoutinesListProps) => {
  const accentColor = useThemeColor('brand');
  const textColorSubtle = useThemeColor('textSecondary');

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <ThemedText style={[styles.sectionTitle, { color: textColorSubtle }]}>
        {sectionTitle}
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.section}>
      {renderSectionHeader()}
      <ThemedSection style={styles.section}>
        <FlatList
          data={data}
          renderItem={({ item, index }) => renderItem(item, index)}
          keyExtractor={item => item.id}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          scrollEnabled={false} // Disable scrolling since parent ScrollView handles it
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={15}
          removeClippedSubviews={true}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={accentColor} />
                <ThemedText style={styles.loadingText}>Loading more workouts...</ThemedText>
              </View>
            ) : null
          }
        />
      </ThemedSection>
    </View>
  );
};

const styles = StyleSheet.create({
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
  loadingFooter: {
    padding: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  }
}); 