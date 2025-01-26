import { View, StyleSheet, Platform, Animated } from 'react-native';
import { useLinkBuilder } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { TabBarIcon, TabBarIconName } from './TabBarIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabDescriptorMap } from '@react-navigation/bottom-tabs/lib/typescript/commonjs/src/types';
import type { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';
import type { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { useRef } from 'react';
import { ThemedText } from '../ThemedText';

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

    return (
        <PlatformPressable
            href={href}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            onPress={handlePress}
            onLongPress={onLongPress}
            style={[styles.button, { transform: [{ scale }] }]}
            pressOpacity={1}
        >
            <TabBarIcon
                name={route.name as TabBarIconName}
                color={color}
                size={27}
            />
            <Text style={[styles.buttonText, { color }]}>
                {label}
            </Text>
        </PlatformPressable>
    );
};

const TabBarBackground = ({ backgroundColor, bottomInset }: { backgroundColor: string; bottomInset: number }) => {
    const { height } = useTabBarHeight(12);

    // Convert backgroundColor to rgba for transparency
    const transparentColor = backgroundColor + 'ee'

    return (
        <LinearGradient
            colors={[transparentColor, backgroundColor]}
            style={[
                styles.background,
                {
                    height: height + bottomInset,
                    bottom: 0
                }
            ]}
            locations={[0, 1]}
        />
    );
};

export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
    const { buildHref } = useLinkBuilder();
    const { height, bottomInset } = useTabBarHeight(12);
    const backgroundColor = useThemeColor('background');
    const focusedColor = useThemeColor('text');
    const unfocusedColor = useThemeColor('textSecondary');

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

    return (
        <>
            <TabBarBackground backgroundColor={backgroundColor} bottomInset={bottomInset} />
            <View style={[styles.tabBar, { height, bottom: bottomInset }]}>
                {state.routes.map((route, index) => {
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
            <NewWorkoutButton bottom={bottomInset} height={height} />
        </>
    );
}

const NewWorkoutButton = ({ bottom, height }: { bottom: number; height: number }) => {

    const color = useThemeColor('textContrast');
    const backgroundColor = useThemeColor('brand');
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        // Scale the button
        animateScale();
        // Haptic feedback
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const animateScale = () => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 0.98,
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

    return (
        <PlatformPressable
            onPress={handlePress}
            style={[styles.newWorkoutButton, {
                transform: [{ scale }],
                bottom: bottom + height + 15,
                backgroundColor
            }]}
            pressOpacity={1}
        >
            <TabBarIcon
                name={'plus'}
                color={color}
                size={26}
                strokeWidth={1.8}
            />
            <ThemedText style={{ fontWeight: '500', color }}>Start Workout</ThemedText>
        </PlatformPressable>
    );
}

const styles = StyleSheet.create({
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    tabBar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: 'transparent', // Make tab bar transparent to show gradient
    },
    button: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    buttonText: {
        fontSize: 10,
    },
    newWorkoutButton: {
        position: 'absolute',
        boxShadow: '0 0 6px rgba(0, 0, 0, 0.6)',
        right: 15,
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 18,
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        paddingLeft: 14,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
