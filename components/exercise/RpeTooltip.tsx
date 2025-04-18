import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { X } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface RpeTooltipProps {
  visible: boolean;
  onClose: () => void;
  type?: 'rpe' | 'rir';
}

const RpeTooltip: React.FC<RpeTooltipProps> = ({ visible, onClose, type = 'rpe' }) => {
  const tooltipBg = useThemeColor('backgroundContrast');
  const textColor = useThemeColor('text');

  if (!visible) return null;

  const isRpe = type === 'rpe';
  const title = isRpe ? 'Rate of Perceived Exertion (RPE)' : 'Reps in Reserve (RIR)';
  const description = isRpe 
    ? 'RPE is a scale from 1-10 that measures how difficult an exercise feels.'
    : 'RIR measures how many more reps you could have done at the end of a set.';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{
          backgroundColor: tooltipBg,
          borderRadius: 12,
          padding: 16,
          width: '80%',
          maxWidth: 300,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <ThemedText style={{ fontWeight: '600', fontSize: 16 }}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={textColor} />
            </TouchableOpacity>
          </View>
          <ThemedText style={{ marginBottom: 8 }}>
            {description}
          </ThemedText>
          {isRpe ? (
            <>
              <ThemedText>
                • 10 = Maximum effort (couldn't do more reps)
              </ThemedText>
              <ThemedText>
                • 7-9 = Hard but manageable
              </ThemedText>
              <ThemedText>
                • 4-6 = Moderate effort
              </ThemedText>
              <ThemedText>
                • 1-3 = Very easy
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText>
                • 0 = Couldn't do any more reps (max effort)
              </ThemedText>
              <ThemedText>
                • 1-2 = Could have done 1-2 more reps
              </ThemedText>
              <ThemedText>
                • 3-5 = Several more reps in the tank
              </ThemedText>
              <ThemedText>
                • 6+ = Many more reps possible (very easy)
              </ThemedText>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default RpeTooltip; 