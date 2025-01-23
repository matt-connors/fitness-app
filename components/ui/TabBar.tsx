import { View, StyleSheet, Platform } from 'react-native';
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

    return (
        <PlatformPressable
            href={href}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.button}
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
        </>
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
});