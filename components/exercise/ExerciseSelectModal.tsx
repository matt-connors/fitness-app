import React from 'react';
import { View, Modal, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Search } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';

interface ExerciseSelectModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExercises: any[];
  onSelectExercise: (exercise: any) => void;
}

const ExerciseSelectModal: React.FC<ExerciseSelectModalProps> = ({
  visible,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredExercises,
  onSelectExercise
}) => {
  // Theme colors
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const textColorSubtle = useThemeColor('textSecondary');
  const backgroundColor = useThemeColor('background');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');
  const borderStrongerColor = useThemeColor('borderStronger');

  const renderExerciseItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.pageHorizontalInside,
        // marginBottom: SPACING.pageVerticalInside,
        borderTopWidth: index > 0 ? 0.5 : 0,
        borderTopColor: contrastBackgroundColor
      }}
      onPress={() => {
        onSelectExercise(item);
        onClose();
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ThemedText 
          style={{
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 20,
            marginBottom: 3,
          }} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {item.name}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemedText 
            style={{
              fontSize: 12,
              lineHeight: 16,
              color: textColorSubtle
            }} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {item.muscle} • {item.equipment}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.pageHorizontalInside,
      }}>
        <View style={{
          width: '100%',
          maxHeight: '60%',
          borderRadius: 12,
          borderWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: SPACING.pageHorizontalInside,
          paddingBottom: 0,
          backgroundColor,
          borderColor: borderStrongerColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 10,
            borderWidth: 1,
            height: 40,
            paddingHorizontal: 12,
            backgroundColor: contrastBackgroundColor,
          }}>
            <Search size={18} color={textColorMuted} style={{ marginRight: 15, marginLeft: 5 }} />
            <TextInput
              style={{
                flex: 1,
                height: '100%',
                fontSize: 16,
                padding: 0,
                color: textColor
              }}
              placeholder="Search exercises..."
              placeholderTextColor={textColorMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoFocus={true}
            />
          </View>

          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            style={{
              paddingTop: SPACING.pageHorizontalInside
            }}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <View style={{
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                height: 120
              }}>
                <ThemedText style={{
                  fontSize: 15,
                  textAlign: 'center',
                  color: textColorMuted
                }}>
                  {searchQuery
                    ? "No exercises found matching your search"
                    : "Start typing to search exercises"}
                </ThemedText>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default ExerciseSelectModal; 