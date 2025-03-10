import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Platform } from 'react-native';
import { useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/useThemeColor';
import { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { TabBarIcon, TabBarIconName } from './TabBarIcons';
import { WorkoutDrawer } from './WorkoutDrawer';
import { ThemedText } from '../ThemedText';
import { SPACING } from '@/constants/Spacing';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useActiveWorkout } from '@/components/ActiveWorkoutProvider';
import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import { BottomTabDescriptorMap } from '@react-navigation/bottom-tabs/lib/typescript/commonjs/src/types';

interface Route {
    key: string;
    name: string;
    params?: object;
}

interface TabBarProps {
    state: TabNavigationState<ParamListBase>;
    descriptors: BottomTabDescriptorMap;
    navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
    insets: EdgeInsets;
}

interface TabItemProps {
    route: Route;
    isFocused: boolean;
    focusedColor: string;
    unfocusedColor: string;
    onPress: () => void;
    onLongPress: () => void;
    href: string;
    label: string;
    accessibilityLabel?: string;
    testID?: string;
}

const LabelMapping = {
    index: 'Home',
    workouts: 'Workouts',
    library: 'Library',
    settings: 'Settings',
}

const TabItem = ({
    route,
    isFocused,
    focusedColor,
    unfocusedColor,
    onPress,
    onLongPress,
    href,
    label,
    accessibilityLabel,
    testID
}: TabItemProps) => {
    if (route.name === 'active-workout') {
        return null;
    }

    const color = isFocused ? focusedColor : unfocusedColor;
    const scale = useRef(new Animated.Value(1)).current;

    const animateScale = () => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 0.95,
                useNativeDriver: true,
                speed: 550
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 550
            })
        ]).start();
    };

    const handlePress = () => {
        animateScale();
        onPress();
    };

    // Use the correct icon name based on the route
    const getIconName = (routeName: string): TabBarIconName => {
        if (routeName === 'index') return 'index';
        if (routeName === 'workouts') return 'workouts';
        if (routeName === 'library') return 'library';
        if (routeName === 'settings') return 'settings';
        return 'index'; // Default fallback
    };

    return (
        <PlatformPressable
            href={href}
            onPress={handlePress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            style={[
                styles.button,
                { transform: [{ scale }] }
            ]}
            pressOpacity={1}
        >
            <TabBarIcon
                name={getIconName(route.name)}
                color={isFocused ? focusedColor : unfocusedColor}
                size={27}
                strokeWidth={1.6}
            />
            <Text
                style={[
                    styles.buttonText,
                    { color: isFocused ? focusedColor : unfocusedColor }
                ]}
            >
                {label}
            </Text>
        </PlatformPressable>
    );
};

const TabBarBackground = ({ backgroundColor, bottomInset }: { backgroundColor: string; bottomInset: number }) => {
    const isDark = useThemeColor('background') === '#151718';
    const shouldUseBlur = Platform.OS === 'ios';
    
    return (
        <View
            style={[
                styles.tabBarBackground,
                {
                    backgroundColor: shouldUseBlur ? 'transparent' : backgroundColor,
                    height: SPACING.navHeight + bottomInset + 10,
                }
            ]}
        >
            {shouldUseBlur && (
                <BlurView
                    intensity={40}
                    style={StyleSheet.absoluteFill}
                    tint={isDark ? 'dark' : 'light'}
                />
            )}
        </View>
    );
};

export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
    const { buildHref } = useLinkBuilder();
    const { height, bottomInset } = useTabBarHeight(12);
    const backgroundColor = useThemeColor('background');
    const focusedColor = useThemeColor('text');
    const unfocusedColor = useThemeColor('textSecondary');
    const [isWorkoutDrawerVisible, setIsWorkoutDrawerVisible] = useState(false);
    const { startNewWorkout, activeWorkout } = useActiveWorkout();

    // Hide start workout button if there's an active workout
    const showStartWorkoutButton = !activeWorkout;

    const handlePress = (route: Route, isFocused: boolean) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate(route.name, route.params);
        }
    };

    const handleLongPress = (route: Route) => {
        navigation.emit({
            type: 'tabLongPress',
            target: route.key,
        });
    };

    // Handle workout actions
    const handleOpenWorkoutDrawer = () => {
        setIsWorkoutDrawerVisible(true);
    };

    const handleCloseWorkoutDrawer = () => {
        setIsWorkoutDrawerVisible(false);
    };

    const handleSelectRoutine = (routine: any) => {
        // Close drawer first
        setIsWorkoutDrawerVisible(false);
        
        // Navigate to selected routine with data
        navigation.navigate('create-workout', { 
            workout: routine 
        });
    };
    
    const handleStartEmptyWorkout = () => {
        // Close drawer first
        setIsWorkoutDrawerVisible(false);
        
        // Start a new workout using the context method
        startNewWorkout();
    };

    return (
        <View style={styles.container}>
            {/* Background underlay */}
            <TabBarBackground backgroundColor={backgroundColor} bottomInset={insets.bottom} />
            
            {/* Tab bar content - positioned correctly */}
            <View style={[
                styles.tabBar,
                { paddingBottom: insets.bottom }
            ]}>
                {state.routes.map((route, index) => {
                    // Skip rendering items for 'active-workout' route
                    if (route.name === 'active-workout') {
                        return null;
                    }
                    
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? options.title ?? route.name;
                    const isFocused = state.index === index;

                    return (
                        <TabItem
                            key={route.key}
                            route={route}
                            isFocused={isFocused}
                            focusedColor={focusedColor}
                            unfocusedColor={unfocusedColor}
                            onPress={() => handlePress(route, isFocused)}
                            onLongPress={() => handleLongPress(route)}
                            href={buildHref(route.name, route.params) || ''}
                            label={label as string}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarButtonTestID}
                        />
                    );
                })}
            </View>
            
            {showStartWorkoutButton && (
                <NewWorkoutButton 
                    bottom={insets.bottom} 
                    height={SPACING.navHeight} 
                    onPress={handleOpenWorkoutDrawer} 
                />
            )}
            
            <WorkoutDrawer 
                isVisible={isWorkoutDrawerVisible} 
                onClose={handleCloseWorkoutDrawer}
                onSelectRoutine={handleSelectRoutine}
                onStartEmptyWorkout={handleStartEmptyWorkout}
                hasActiveWorkout={!!activeWorkout}
            />
        </View>
    );
}

const NewWorkoutButton = ({ bottom, height, onPress }: { bottom: number; height: number; onPress: () => void }) => {
    const backgroundColor = useThemeColor('brand');
    const color = useThemeColor('textContrast');
    const scale = useRef(new Animated.Value(1)).current;

    const animateScale = () => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 0.9,
                useNativeDriver: true,
                speed: 550
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 550
            })
        ]).start();
    };

    const handlePress = () => {
        // Scale the button
        animateScale();
        // Trigger the onPress callback
        onPress();
        // Haptic feedback
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    return (
        <PlatformPressable
            onPress={handlePress}
            style={[styles.newWorkoutButton, {
                transform: [{ scale }],
                bottom: bottom + height + 25, // Increase bottom space to avoid overlap
                backgroundColor
            }]}
            pressOpacity={1}
        >
            <TabBarIcon
                name={'plus'}
                color={color}
                size={24}
                strokeWidth={1.8}
            />
            <ThemedText style={{ fontWeight: '500', fontSize: 16, color }}>Start Workout</ThemedText>
        </PlatformPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    tabBar: {
        flexDirection: 'row',
        height: SPACING.navHeight + 15,
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        paddingBottom: 6,
    },
    tabBarBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        // borderTopWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    buttonText: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
        marginBottom: 4,
    },
    newWorkoutButton: {
        position: 'absolute',
        borderRadius: 30,
        right: 20,
        height: 50, // Slightly reduce height
        paddingHorizontal: 20,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 10,
    }
});
