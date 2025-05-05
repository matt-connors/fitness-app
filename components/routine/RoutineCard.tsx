import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MoreVertical, Plus } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { PlatformPressable } from '@react-navigation/elements';
import { SPACING } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Routine } from '@/lib/graphql/types';
import { RECENT_ROUTINES } from '@/constants/MockData';

interface RoutineCardProps {
  item: any;
  index: number;
  onPress: (routine: any) => void;
  onMenuPress?: (routine: any) => void;
  onAddToLibrary?: (routine: any) => void;
  type?: 'platform' | 'user';
}

export const RoutineCard = ({
  item,
  index,
  onPress,
  onMenuPress,
  onAddToLibrary,
  type = 'user'
}: RoutineCardProps) => {
  const textColorSubtle = useThemeColor('textSecondary');
  const textColorMuted = useThemeColor('textMuted');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');

  const isUserRoutine = type === 'user' || 
    (item.userRoutines && item.userRoutines.some((ur: any) => ur.role === 'Creator'));

  return (
    <PlatformPressable
      style={[styles.routineCard, {
        borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
      }]}
      onPress={() => onPress(item)}
    >
      <View style={styles.routineInfo}>
        <ThemedText style={styles.routineName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </ThemedText>
        <View style={styles.routineMetaRow}>
          <ThemedText style={[styles.metaText, { color: textColorSubtle }]} numberOfLines={1} ellipsizeMode="tail">
            {item.type}
            {item.exercises ? ` • ${item.exercises} exercises` : 
              item.routineExercises ? ` • ${item.routineExercises.length} exercises` : 
              item.duration ? ` • ${item.duration}` : ''}
            {RECENT_ROUTINES.some(r => r.id === item.id) && item.lastUsed ? ` • ${item.lastUsed}` : ''}
            {item.difficulty ? ` • ${item.difficulty}` : 
              item.skillLevel ? ` • ${item.skillLevel}` : ''}
          </ThemedText>
        </View>
      </View>

      {/* Ellipsis menu for user-created workouts */}
      {isUserRoutine && onMenuPress && (
        <TouchableOpacity
          style={[styles.actionButton]}
          onPress={(e) => {
            e.stopPropagation();
            onMenuPress(item);
          }}
        >
          <MoreVertical size={18} color={textColorMuted} strokeWidth={1.7} />
        </TouchableOpacity>
      )}

      {/* Add button for platform routines */}
      {type === 'platform' && onAddToLibrary && (
        <TouchableOpacity
          style={[styles.actionButton, styles.circleButton, { backgroundColor: contrastBackgroundColor }]}
          onPress={(e) => {
            e.stopPropagation();
            onAddToLibrary(item);
          }}
        >
          <Plus size={18} color={textColorMuted} strokeWidth={1.7} />
        </TouchableOpacity>
      )}
    </PlatformPressable>
  );
};

const styles = StyleSheet.create({
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.pageHorizontalInside,
    borderTopColor: 'rgba(100, 100, 100, 0.5)',
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
}); 