import React from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSection } from '@/components/ThemedSection';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Plus } from 'lucide-react-native';
import { Routine } from '@/lib/graphql/types';

interface UserRoutinesListProps {
  routines: Routine[];
  fetching: boolean;
  graphqlPage: number;
  renderRoutineCard: (routine: any, index: number) => JSX.Element;
  onCreateRoutinePress: () => void;
  sectionTitle: string;
  isLoading?: boolean;
  isStale?: boolean;
  isUpdating?: boolean;
}

export const UserRoutinesList = ({
  routines,
  fetching,
  graphqlPage,
  renderRoutineCard,
  onCreateRoutinePress,
  sectionTitle,
  isLoading = false,
  isStale = false,
  isUpdating = false
}: UserRoutinesListProps) => {
  const accentColor = useThemeColor('brand');
  const textColor = useThemeColor('text');
  const textColorSubtle = useThemeColor('textSecondary');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');
  const updateColor = useThemeColor('brand');

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <ThemedText style={[styles.sectionTitle, { color: textColorSubtle }]}>
          {sectionTitle}
        </ThemedText>
        
        {isUpdating && (
          <ThemedText 
            style={[styles.updatingText, { color: updateColor }]}
          >
            updating...
          </ThemedText>
        )}
      </View>
    </View>
  );

  return (
    <View>
      {renderSectionHeader()}
      <ThemedSection style={styles.section}>
        <View>
          {routines.length === 0 ? (
            (fetching && !isUpdating && graphqlPage === 0) ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={accentColor} />
                <ThemedText style={styles.loadingText}>Loading routines...</ThemedText>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyListText}>
                  You haven't created any routines yet
                </ThemedText>
              </View>
            )
          ) : (
            routines.map((routine, index) => 
              <React.Fragment key={`routine-${routine.id || index}`}>
                {renderRoutineCard(routine, index)}
              </React.Fragment>
            )
          )}
          <TouchableOpacity
            style={[
              styles.createWorkoutButton, 
              { backgroundColor: contrastBackgroundColor }
            ]}
            onPress={onCreateRoutinePress}
          >
            <Plus size={20} color={textColor} strokeWidth={1.7} />
            <ThemedText style={[styles.createWorkoutText, { color: textColor }]}>
              Create Routine
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  updatingText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.pageHorizontal,
  },
  emptyListText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
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
  }
}); 