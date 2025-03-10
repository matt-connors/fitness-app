import React, { useState } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { PlatformPressable } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, StopCircle, Timer, Dumbbell, XIcon, CircleStop } from 'lucide-react-native';
import { ActiveWorkoutDrawer } from './ActiveWorkoutDrawer';

interface ActiveWorkoutBarProps {
  workoutName?: string;
  elapsedTime: string;
  isPaused: boolean;
  onStop: () => void;
  onPauseResume: () => void;
  onPress: () => void;
  bottom?: number;
}

export function ActiveWorkoutBar({
  workoutName = 'Active Workout',
  elapsedTime,
  isPaused,
  onStop,
  onPauseResume,
  onPress,
  bottom = 0
}: ActiveWorkoutBarProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor('backgroundSubtleContrast');
  const textColor = useThemeColor('text');
  const accentColor = useThemeColor('brand');
  const borderColor = useThemeColor('border');

  // State to control the drawer visibility
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Open the workout drawer
  const handlePress = () => {
    setIsDrawerVisible(true);
    // Also call the original onPress for any additional logic
    onPress();
  };

  // Close the workout drawer
  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  // Calculate bottom position to be precisely above the tab bar
  const bottomPosition = bottom + SPACING.navHeight + 10;

  return (
    <>
      <Pressable 
        style={[
          styles.container, 
          { 
            backgroundColor, 
            borderTopColor: borderColor,
            bottom: bottomPosition, // Position precisely above the tab bar
          }
        ]}
        onPress={handlePress}
      >
        {/* Workout Icon */}
        <View style={styles.workoutIcon}>
          <Dumbbell size={24} color={textColor} />
        </View>
          
        {/* Workout Info */}
        <View style={styles.workoutInfo}>
          <ThemedText style={styles.workoutTitle} numberOfLines={1}>
            {workoutName}
          </ThemedText>
          <View style={styles.timeRow}>
            <ThemedText style={styles.elapsedTime}>{elapsedTime}</ThemedText>
          </View>
        </View>
          
        {/* Controls */}
        <View style={styles.controls}>
          <PlatformPressable 
            onPress={onStop}
            style={styles.actionButton}
            hitSlop={8}
          >
            <CircleStop size={26} color={textColor} strokeWidth={1.7} />
          </PlatformPressable>
            
          <PlatformPressable 
            onPress={onPauseResume} 
            style={styles.playPauseButton}
            hitSlop={8}
          >
            {isPaused ? (
              <Play size={26} fill={textColor} strokeWidth={0} />
            ) : (
              <Pause size={26} fill={textColor} strokeWidth={0} />
            )}
          </PlatformPressable>
        </View>
      </Pressable>
      
      {/* Active Workout Drawer */}
      <ActiveWorkoutDrawer
        isVisible={isDrawerVisible}
        onClose={handleCloseDrawer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.pageHorizontal,
    right: SPACING.pageHorizontal,
    // height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderRadius: 12,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  workoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  workoutInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
  elapsedTime: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 19,
    // marginLeft: 4
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 0
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 4
  },
  actionButton: {
    padding: 4,
  },
  playPauseButton: {
    width: 32,
    height: 32,
    // borderRadius: 16,
    // backgroundColor: '#1DB954', // Spotify green
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 