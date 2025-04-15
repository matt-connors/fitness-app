import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { X } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface RpeTooltipProps {
  visible: boolean;
  onClose: () => void;
}

const RpeTooltip: React.FC<RpeTooltipProps> = ({ visible, onClose }) => {
  const tooltipBg = useThemeColor('backgroundContrast');
  const textColor = useThemeColor('text');

  if (!visible) return null;

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
            <ThemedText style={{ fontWeight: '600', fontSize: 16 }}>Rate of Perceived Exertion (RPE)</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={textColor} />
            </TouchableOpacity>
          </View>
          <ThemedText style={{ marginBottom: 8 }}>
            RPE is a scale from 1-10 that measures how difficult an exercise feels.
          </ThemedText>
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
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default RpeTooltip; 