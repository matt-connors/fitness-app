import React, { useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Plus, HelpCircle, Trash2 } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { Exercise } from '@/types/Exercise';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface ExerciseSetsProps {
  exercise: Exercise;
  onUpdateExercise: (id: string, field: string, value: string | number) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, field: string, value: string | number | undefined) => void;
  onAddSetToExercise: (id: string) => void;
  setShowRpeTooltip: (id: string | null) => void;
  setShowRirTooltip?: (id: string | null) => void;
  onRemoveSet?: (exerciseId: string, setIndex: number) => void;
}

const ExerciseSets: React.FC<ExerciseSetsProps> = ({
  exercise,
  onUpdateExercise,
  onUpdateSet,
  onAddSetToExercise,
  setShowRpeTooltip,
  setShowRirTooltip,
  onRemoveSet
}) => {
  // Theme colors
  const textColor = useThemeColor('text');
  const textColorMuted = useThemeColor('textMuted');
  const accentColor = useThemeColor('brand');
  const contrastBackgroundColor = useThemeColor('backgroundContrast');
  const subBackgroundColor = useThemeColor('backgroundSubtleContrast');
  const borderStrongerColor = useThemeColor('borderStronger');
  const backgroundColor = useThemeColor('background');
  const deleteButtonColor = '#FF3B30'; // iOS-like red color for delete
  const screenWidth = Dimensions.get('window').width;

  // Create animated values for each set
  const animatedValues = useRef(new Map()).current;
  const hasFeedbackTriggered = useRef(new Map()).current;
  
  // Reset/initialize animation values when sets change
  useEffect(() => {
    if (exercise.multipleSets) {
      // Create or update animation values for current sets
      exercise.multipleSets.forEach((_, index) => {
        if (!animatedValues.has(index)) {
          animatedValues.set(index, new Animated.Value(0));
          hasFeedbackTriggered.set(index, false);
        }
      });
    }
  }, [exercise.multipleSets?.length]);

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
                  style={{ marginLeft: 2, padding: 4 }}
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
          alignItems: 'flex-start',
          marginBottom: 5,
          gap: SPACING.pageHorizontalInside,
        }}>
          {/* Set # header */}
          <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '500', color: textColorMuted }}>
              {/* Set # */}
            </ThemedText>
          </View>

          {/* Reps header */}
          <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '500', color: textColorMuted }}>
              Reps
            </ThemedText>
          </View>

          {/* RPE/Weight header */}
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
          </View>
        </View>

        {exercise.multipleSets?.map((set, index) => {
          // Get the animation value for this row, or create a new one
          const translateX = animatedValues.get(index) || new Animated.Value(0);
          
          // Handle gesture event
          const onGestureEvent = Animated.event(
            [{ nativeEvent: { translationX: translateX } }],
            { useNativeDriver: false }
          );

          // Handle state changes for the gesture
          const onHandlerStateChange = (event: any) => {
            if (event.nativeEvent.oldState === State.ACTIVE) {
              const { translationX } = event.nativeEvent;
              const threshold = -screenWidth * 0.4; // 40% of screen width as threshold
              
              if (translationX < threshold) {
                // User passed threshold - delete the set
                Animated.timing(translateX, {
                  toValue: -screenWidth,
                  duration: 200,
                  useNativeDriver: false
                }).start(() => {
                  if (onRemoveSet && exercise.id) {
                    onRemoveSet(exercise.id, index);
                    // Reset animation value after deletion
                    translateX.setValue(0);
                    hasFeedbackTriggered.set(index, false);
                  }
                });
              } else {
                // User did not pass threshold - reset position with a smooth, natural motion
                Animated.timing(translateX, {
                  toValue: 0,
                  duration: 280, // Slightly slower return animation
                  useNativeDriver: false,
                  // Using a more linear easing for a smoother return
                }).start(() => {
                  // Reset feedback trigger after animation completes
                  hasFeedbackTriggered.set(index, false);
                });
              }
            } else if (event.nativeEvent.state === State.ACTIVE) {
              // During active drag - provide haptic feedback at threshold and handle right "wall" effect
              const { translationX } = event.nativeEvent;
              const threshold = -screenWidth * 0.4;
              const hasTriggered = hasFeedbackTriggered.get(index) || false;
              
              // Haptic feedback at delete threshold
              if (translationX < threshold && !hasTriggered) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                hasFeedbackTriggered.set(index, true);
              } else if (translationX >= threshold && hasTriggered) {
                hasFeedbackTriggered.set(index, false);
              }
              
              // Provide slight resistance effect when trying to swipe right
              if (translationX > 0) {
                // Apply resistance - the further right you go, the more resistance
                translateX.setValue(Math.min(8, translationX * 0.15));
                
                // Optional: add subtle haptic feedback when hitting the "wall"
                if (translationX > 20 && !hasTriggered) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  hasFeedbackTriggered.set(index, true);
                }
              }
            }
          };

          // Calculate the limited translation X value (prevents right swipe)
          const limitedTranslateX = translateX.interpolate({
            inputRange: [-screenWidth, 0, 1],
            outputRange: [-screenWidth, 0, 0], // Clamp positive values to 0 to create a "wall" effect
            extrapolate: 'clamp'
          });
          
          // Calculate the red background width based on the translation
          const deleteButtonWidth = translateX.interpolate({
            inputRange: [-screenWidth, -screenWidth * 0.4, 0],
            outputRange: [screenWidth, screenWidth * 0.4, 0],
            extrapolate: 'clamp'
          });

          return (
            <View 
              key={`set-${index}`} 
              style={{
                marginBottom: index === exercise.multipleSets!.length - 1 ? SPACING.pageHorizontalInside * 1.5 : SPACING.pageHorizontalInside,
                overflow: 'hidden', // Ensure overflow is hidden
                borderRadius: 6, // Add a border radius that matches inputs
              }}
            >
              {/* Row container with relative positioning */}
              <View style={{ position: 'relative' }}>
                {/* Red delete background - adjust to prevent corners from showing */}
                <Animated.View 
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 9, // Move it more to the left
                    width: deleteButtonWidth,
                    backgroundColor: deleteButtonColor,
                    justifyContent: 'center',
                    alignItems: 'flex-start', // Change to left alignment
                    paddingLeft: 15, // Add left padding instead of right
                    zIndex: -1, // Place behind inputs to hide red corners
                    marginRight: -3,
                    overflow: 'hidden',
                  }}
                >
                  <Trash2 size={20} color="white" />
                </Animated.View>
                
                {/* Main row content */}
                <PanGestureHandler
                  onGestureEvent={onGestureEvent}
                  onHandlerStateChange={onHandlerStateChange}
                  activeOffsetX={[-10, 10]}
                  failOffsetY={[-5, 5]}
                >
                  <Animated.View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: SPACING.pageHorizontalInside,
                      transform: [{ translateX: limitedTranslateX }],
                      backgroundColor: 'transparent',
                      zIndex: 1, // Ensure inputs are above the delete background
                      // Add a slight padding to the row to ensure no gaps
                      paddingRight: 1,
                    }}
                  >
                    {/* Set Number Label */}
                    <View style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: 42,
                      backgroundColor: 'transparent',
                      zIndex: 1
                    }}>
                      <ThemedText style={{ fontSize: 16, fontWeight: '400' }}>
                        Set #{set.setNumber}
                      </ThemedText>
                    </View>

                    {/* Reps Input */}
                    <View style={{
                      flex: 1,
                      zIndex: 1,
                      overflow: 'hidden', // Ensure any background overflow is hidden
                    }}>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderRadius: 6,
                          paddingHorizontal: 12,
                          height: 42,
                          fontSize: 16,
                          color: textColor,
                          borderColor: borderStrongerColor,
                          backgroundColor: subBackgroundColor,
                        }}
                        keyboardType="number-pad"
                        placeholder="Any"
                        placeholderTextColor={textColorMuted}
                        value={set.reps?.toString() || ''}
                        onChangeText={(value) => onUpdateSet(exercise.id, index, 'reps', value === '' ? undefined : parseInt(value) || 0)}
                      />
                    </View>

                    {/* RPE or Weight Input based on showRpe */}
                    <View style={{
                      flex: 1,
                      zIndex: 1,
                      overflow: 'hidden', // Ensure any background overflow is hidden
                    }}>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderRadius: 6,
                          paddingHorizontal: 12,
                          height: 42,
                          fontSize: 16,
                          color: textColor,
                          borderColor: borderStrongerColor,
                          backgroundColor: subBackgroundColor,
                        }}
                        keyboardType="number-pad"
                        placeholder="Any"
                        placeholderTextColor={textColorMuted}
                        value={exercise.showRpe
                          ? set.rpe?.toString() || ''
                          : set.weight?.toString() || ''}
                        onChangeText={(value) => {
                          if (exercise.showRpe) {
                            onUpdateSet(exercise.id, index, 'rpe', value === '' ? undefined : parseInt(value) || 0);
                          } else {
                            onUpdateSet(exercise.id, index, 'weight', value === '' ? undefined : parseInt(value) || 0);
                          }
                        }}
                      />
                    </View>
                  </Animated.View>
                </PanGestureHandler>
              </View>
            </View>
          );
        })}

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
          onPress={() => {
            // When adding a set, ensure we have room for its animation
            onAddSetToExercise(exercise.id);
          }}
          activeOpacity={0.7}
          delayPressIn={100}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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