import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Plus, HelpCircle } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Exercise } from '@/types/Exercise';

interface ExerciseSetsProps {
  exercise: Exercise;
  onUpdateExercise: (id: string, field: string, value: string | number) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, field: string, value: string | number) => void;
  onAddSetToExercise: (id: string) => void;
  setShowRpeTooltip: (id: string | null) => void;
}

const ExerciseSets: React.FC<ExerciseSetsProps> = ({
  exercise,
  onUpdateExercise,
  onUpdateSet,
  onAddSetToExercise,
  setShowRpeTooltip
}) => {
  // Theme colors
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const accentColor = useThemeColor('brand');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');
  const borderStrongerColor = useThemeColor('borderStronger');

  if (exercise.allSetsEqual) {
    return (
      <View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
          gap: SPACING.pageHorizontalInside,
        }}>
          {/* Sets Input */}
          <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '500', color: textColorMuted }}>
              Sets
            </ThemedText>
            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 12,
                height: 42,
                fontSize: 16,
                color: textColor,
                borderColor: borderStrongerColor
              }}
              keyboardType="number-pad"
              placeholder="Any"
              placeholderTextColor={textColorMuted}
              value={exercise.sets?.toString() || ''}
              onChangeText={(value) => onUpdateExercise(exercise.id, 'sets', parseInt(value) || 0)}
            />
          </View>

          {/* Reps Input */}
          <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '500', color: textColorMuted }}>
              Reps
            </ThemedText>
            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 12,
                height: 42,
                fontSize: 16,
                color: textColor,
                borderColor: borderStrongerColor
              }}
              keyboardType="number-pad"
              placeholder="Any"
              placeholderTextColor={textColorMuted}
              value={exercise.reps?.toString() || ''}
              onChangeText={(value) => onUpdateExercise(exercise.id, 'reps', parseInt(value) || 0)}
            />
          </View>

          {/* RPE or Weight Input based on showRpe */}
          <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 13, fontWeight: '500', color: textColorMuted }}>
                {exercise.showRpe ? "RPE" : "Weight (lbs)"}
              </ThemedText>
              {exercise.showRpe && (
                <TouchableOpacity
                  onPress={() => setShowRpeTooltip(exercise.id)}
                  style={{ marginLeft: 4, padding: 2 }}
                >
                  <HelpCircle size={14} color={textColorMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={{
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 12,
                height: 42,
                fontSize: 16,
                color: textColor,
                borderColor: borderStrongerColor
              }}
              keyboardType="number-pad"
              placeholder="Any"
              placeholderTextColor={textColorMuted}
              value={exercise.showRpe
                ? exercise.rpe?.toString() || ''
                : exercise.weight?.toString() || ''}
              onChangeText={(value) => {
                const intValue = parseInt(value) || 0;
                if (exercise.showRpe) {
                  onUpdateExercise(exercise.id, 'rpe', intValue);
                } else {
                  onUpdateExercise(exercise.id, 'weight', intValue);
                }
              }}
            />
          </View>
        </View>
      </View>
    );
  } else {
    // Multiple sets UI with simplified set rows
    return (
      <View>
        {/* Header row - only shown once */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            {/* No heading for Set # column */}
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '500' }}>Reps</ThemedText>
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 13, fontWeight: '500' }}>
                {exercise.showRpe ? "RPE" : "Weight (lbs)"}
              </ThemedText>
              {exercise.showRpe && (
                <TouchableOpacity
                  onPress={() => setShowRpeTooltip(exercise.id)}
                  style={{ marginLeft: 4, padding: 2 }}
                >
                  <HelpCircle size={14} color={textColorMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {exercise.multipleSets?.map((set, index) => (
          <View key={`set-${index}`}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
              gap: SPACING.pageHorizontalInside,
              marginTop: index > 0 ? 8 : 0
            }}>
              {/* Set Number Label */}
              <View style={{ flex: 1, marginRight: 12 }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '400' }}>
                  Set #{set.setNumber}
                </ThemedText>
              </View>

              {/* Reps Input */}
              <View style={{ flex: 1 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 16,
                    color: textColor,
                    borderColor: borderStrongerColor
                  }}
                  keyboardType="number-pad"
                  placeholder="Any"
                  placeholderTextColor={textColorMuted}
                  value={set.reps?.toString() || ''}
                  onChangeText={(value) => onUpdateSet(exercise.id, index, 'reps', parseInt(value) || 0)}
                />
              </View>

              {/* RPE or Weight Input based on showRpe */}
              <View style={{ flex: 1 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    height: 42,
                    fontSize: 16,
                    color: textColor,
                    borderColor: borderStrongerColor
                  }}
                  keyboardType="number-pad"
                  placeholder="Any"
                  placeholderTextColor={textColorMuted}
                  value={exercise.showRpe
                    ? set.rpe?.toString() || ''
                    : set.weight?.toString() || ''}
                  onChangeText={(value) => {
                    const intValue = parseInt(value) || 0;
                    if (exercise.showRpe) {
                      onUpdateSet(exercise.id, index, 'rpe', intValue);
                    } else {
                      onUpdateSet(exercise.id, index, 'weight', intValue);
                    }
                  }}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Add Set Button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            height: 42,
            marginTop: 4,
            marginBottom: 16,
            backgroundColor: contrastBackgroundColor
          }}
          onPress={() => onAddSetToExercise(exercise.id)}
        >
          <Plus size={20} color={textColor} />
          <ThemedText style={{ marginLeft: 8, fontSize: 16, fontWeight: '400', color: textColor }}>
            Add Set
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }
};

export default ExerciseSets; 