import React from 'react';
import { View, TouchableOpacity, TextInput, ViewProps, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSection } from '@/components/ThemedSection';
import { GripVertical, Trash2, ChevronDown, Plus, Check, X, HelpCircle } from 'lucide-react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Exercise } from '@/types/Exercise';
import ExerciseSets from './ExerciseSets';
import ExerciseAdditionalOptions from './ExerciseAdditionalOptions';
import ExerciseSelectModal from './ExerciseSelectModal';

interface ExerciseItemProps {
  item: Exercise;
  index: number;
  isActive: boolean;
  drag: () => void;
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (id: string, field: string, value: string | number) => void;
  onToggleSetsMode: (id: string, allEqual: boolean) => void;
  onAddSetToExercise: (id: string) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, field: string, value: string | number) => void;
  onToggleExpandedView: (exerciseId: string, setIndex?: number) => void;
  showExerciseDropdown: string | null;
  setShowExerciseDropdown: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExercises: any[];
  availableExercises: any[];
  setFilteredExercises: (exercises: any[]) => void;
  selectExercise: (exerciseId: string, selectedExercise: any) => void;
  setShowRpeTooltip: (id: string | null) => void;
  showDragHandle?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  item, 
  index, 
  isActive, 
  drag,
  onRemoveExercise,
  onUpdateExercise,
  onToggleSetsMode,
  onAddSetToExercise,
  onUpdateSet,
  onToggleExpandedView,
  showExerciseDropdown,
  setShowExerciseDropdown,
  searchQuery,
  setSearchQuery,
  filteredExercises,
  availableExercises,
  setFilteredExercises,
  selectExercise,
  setShowRpeTooltip,
  showDragHandle = true
}) => {
  // Theme colors
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const accentColor = useThemeColor('brand');
  const accentTextColor = useThemeColor('brandText');
  const subtleBackground = useThemeColor('backgroundSubtleContrast');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');
  const borderStrongerColor = useThemeColor('borderStronger');

  const exerciseContent = (
    <ThemedSection style={{
    //   marginBottom: 4,
      paddingHorizontal: SPACING.pageHorizontalInside,
      paddingVertical: SPACING.pageHorizontalInside,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.pageHorizontalInside,
        alignItems: 'center',
      }}>
        {/* Exercise Name Dropdown */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderColor: borderStrongerColor,
            borderWidth: 1,
            borderRadius: 10,
            height: 42,
            flex: 1,
          }}
          onPress={() => {
            setSearchQuery('');
            setFilteredExercises(availableExercises);
            setShowExerciseDropdown(item.id);
          }}
        >
          <ThemedText style={[
            item.name ? { fontSize: 16, fontWeight: '400' } : { fontSize: 16, fontWeight: '400', opacity: 0.5 },
            { lineHeight: 0 }
          ]}>
            {item.name || "Select an exercise"}
          </ThemedText>
          <ChevronDown size={20} color={textColorMuted} />
        </TouchableOpacity>

        
      </View>

      {/* Exercise dropdown in a Modal */}
      <ExerciseSelectModal
        visible={showExerciseDropdown === item.id}
        onClose={() => setShowExerciseDropdown(null)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredExercises={filteredExercises}
        onSelectExercise={(exercise) => selectExercise(item.id, exercise)}
      />

      {/* Toggle for "All sets are the same" */}
      <View style={{ marginVertical: SPACING.pageVerticalInside + 4 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => onToggleSetsMode(item.id, !item.allSetsEqual)}
        >
          <View style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
            borderColor: item.allSetsEqual ? accentColor : borderStrongerColor,
            backgroundColor: item.allSetsEqual ? accentColor : contrastBackgroundColor,
          }}>
            {item.allSetsEqual ?
              <Check size={14} color={accentTextColor} strokeWidth={2} /> :
              <X size={14} color={textColor} strokeWidth={2} />
            }
          </View>
          <ThemedText style={{ fontSize: 14, fontWeight: '400' }}>All sets are the same</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Exercise Sets Information */}
      <ExerciseSets
        exercise={item}
        onUpdateExercise={onUpdateExercise}
        onUpdateSet={onUpdateSet}
        onAddSetToExercise={onAddSetToExercise}
        setShowRpeTooltip={setShowRpeTooltip}
      />

      {/* Expand/collapse button for additional options */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        //   marginVertical: 4,
          paddingVertical: 4
        }}
        onPress={() => onToggleExpandedView(item.id)}
      >
        <ThemedText style={{
          color: textColorMuted,
          fontSize: 14,
          marginRight: 3,
        //   fontWeight: '500'
        }}>
          {item.showExpanded ? "Hide" : "Show"} additional options
        </ThemedText>
        <ChevronDown
          size={16}
          strokeWidth={1.9}
          color={textColorMuted}
          style={{
            transform: [{ rotate: item.showExpanded ? '180deg' : '0deg' }]
          }}
        />
      </TouchableOpacity>

      {/* Expanded additional options */}
      {item.showExpanded && (
        <ExerciseAdditionalOptions 
          exercise={item}
          onUpdateExercise={onUpdateExercise}
        />
      )}
    </ThemedSection>
  );

  // If we don't want to show the drag handle, just return the content
  if (!showDragHandle) {
    return exerciseContent;
  }

  // Otherwise, return the content wrapped in the drag decorator
  return (
    <ScaleDecorator activeScale={1.03}>
      <Pressable 
        onResponderRelease={(evt) => {
          // Allow events to propagate to parent scroll view
          evt.stopPropagation();
        }}
        hitSlop={{ top: 5, bottom: 5, left: 0, right: 0 }}
        style={({ pressed }) => ({
          marginBottom: SPACING.pageHorizontalInside,
          opacity: isActive ? 0.7 : pressed ? 0.9 : 1,
          margin: isActive ? 8 : 0,
          zIndex: isActive ? 999 : 1,
          overflow: 'visible',
        })}
      >
        <TouchableOpacity
          onPressIn={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            drag();
          }}
          style={{
            flexDirection: 'row',
            gap: SPACING.pageHorizontalInside,
            alignItems: 'center',
            marginBottom: SPACING.pageHorizontalInside,
            padding: 10,
            borderRadius: 8,
            backgroundColor: 'transparent'
          }}
          delayLongPress={100}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <GripVertical
            size={18}
            color={isActive ? accentColor : textColorMuted}
          />
          <ThemedText style={{ fontSize: 16 }}>#{index + 1}</ThemedText>
          <ThemedText style={{ fontSize: 16 }}>{item.name}</ThemedText>
        </TouchableOpacity>
        
        {exerciseContent}
      </Pressable>
    </ScaleDecorator>
  );
};

export default ExerciseItem; 