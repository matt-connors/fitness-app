import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';
import { ActiveWorkoutBar } from '@/components/ui/ActiveWorkoutBar';
import { useActiveWorkout, ActiveWorkoutProvider } from '@/components/ActiveWorkoutProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';

// Wrapper component that provides the ActiveWorkoutProvider
function TabLayoutContent() {
    const { 
        activeWorkout, 
        elapsedTime, 
        togglePauseWorkout, 
        stopActiveWorkout, 
        handleWorkoutBarPress 
    } = useActiveWorkout();
    const colorScheme = useColorScheme();
    const backgroundColor = useThemeColor('background');
    const borderColor = useThemeColor('border');
    
    // Show the active workout bar if there's an active workout
    const showActiveWorkoutBar = !!activeWorkout;

    // Calculate bottom space for tab bar
    const insets = useSafeAreaInsets();
    // Ensure more generous padding for bottom navigation
    const bottomSafeArea = Math.max(insets.bottom, Platform.OS === 'android' ? 15 : 20);

    return (
        <View style={styles.container}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    tabBarStyle: {
                        display: 'none', // Hide the default tab bar completely
                    },
                    // Ensure all headers are turned off globally
                    headerShown: false,
                }}
                tabBar={(props) => (
                    <View style={styles.tabContainer}>
                        <TabBar {...props} />
                    </View>
                )}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        headerShown: false,
                    }}
                />
                <Tabs.Screen
                    name="workouts"
                    options={{
                        title: 'Workouts',
                        headerShown: false,
                    }}
                />
                <Tabs.Screen
                    name="library"
                    options={{
                        title: 'Library',
                        headerShown: false,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        headerShown: false,
                    }}
                />
            </Tabs>
            
            {/* Active workout bar when needed */}
            {showActiveWorkoutBar && (
                <ActiveWorkoutBar
                    workoutName={activeWorkout?.name}
                    elapsedTime={elapsedTime}
                    isPaused={activeWorkout?.isPaused || false}
                    onStop={stopActiveWorkout}
                    onPauseResume={togglePauseWorkout}
                    onPress={handleWorkoutBarPress}
                    bottom={bottomSafeArea}
                />
            )}
        </View>
    );
}

// Default export wraps the content with the required provider
export default function TabLayout() {
    return (
        <ActiveWorkoutProvider>
            <TabLayoutContent />
        </ActiveWorkoutProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    }
});
