import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Exercise } from '@/types/Exercise';
import { HelpCircle } from 'lucide-react-native';

interface ExerciseAdditionalOptionsProps {
  exercise: Exercise;
  onUpdateExercise: (id: string, field: string, value: string | number) => void;
  setShowRirTooltip?: (id: string | null) => void;
}

const ExerciseAdditionalOptions: React.FC<ExerciseAdditionalOptionsProps> = ({
  exercise,
  onUpdateExercise,
  setShowRirTooltip
}) => {
  // Theme colors
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const borderStrongerColor = useThemeColor('borderStronger');

  return (
    <View style={{ marginTop: 6, paddingTop: 6 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: SPACING.pageHorizontalInside,
      }}>
        {/* Rest Pause Input */}
        <View style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '500', color: textColorMuted }}>
            Rest (sec)
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
            value={exercise.restPause?.toString() || ''}
            onChangeText={(value) => onUpdateExercise(exercise.id, 'restPause', parseInt(value) || 0)}
          />
        </View>

        {/* RIR Input */}
        <View style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '500', color: textColorMuted, marginRight: 4 }}>
              RIR
            </ThemedText>
            <TouchableOpacity onPress={() => setShowRirTooltip && setShowRirTooltip(exercise.id)}>
              <HelpCircle size={14} color={textColorMuted} strokeWidth={1.7} />
            </TouchableOpacity>
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
            value={exercise.rir?.toString() || ''}
            onChangeText={(value) => onUpdateExercise(exercise.id, 'rir', parseInt(value) || 0)}
          />
        </View>
      </View>
      
      {/* Notes Field */}
      <View style={{ marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '500', marginLeft: 4, color: textColorMuted }}>
            Notes
          </ThemedText>
        </View>
        <TextInput
          style={{
            borderWidth: 1,
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: textColor,
            borderColor: borderStrongerColor,
            textAlignVertical: 'top',
            minHeight: 80
          }}
          placeholder="Add notes about this exercise..."
          placeholderTextColor={textColorMuted}
          multiline
          numberOfLines={3}
          value={exercise.notes || ''}
          onChangeText={(value) => onUpdateExercise(exercise.id, 'notes', value)}
        />
      </View>
    </View>
  );
};

export default ExerciseAdditionalOptions; 