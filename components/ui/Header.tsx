import { View, StyleSheet, useColorScheme, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import { SPACING } from '@/constants/Spacing';
import { ThemedText } from '../ThemedText';
import { usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarFold, Calendar as CalendarIcon } from "lucide-react-native";

import React from 'react';

const LabelMapping = {
    '/': 'Home',
    // '/workouts': 'Workouts',
    '/library': 'Library',
    '/settings': 'Settings',
}

export function Header({ overrideTitle, children, onScrollToToday }: { 
    overrideTitle?: string, 
    children?: React.ReactNode,
    onScrollToToday?: () => void 
}) {
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor('backgroundSubtleContrast');
    const pathname = usePathname();
    const isDarkMode = useColorScheme() === 'dark';
    const brandColor = useThemeColor('brand');
    const textColor = useThemeColor('text');
    const [headerHeight, setHeaderHeight] = React.useState(SPACING.headerHeight + insets.top);

    const title = overrideTitle || LabelMapping[pathname as keyof typeof LabelMapping];
    const transparentColor = backgroundColor + 'aa';

    const handleLayout = (event: LayoutChangeEvent) => {
        setHeaderHeight(event.nativeEvent.layout.height);
    };

    if (!title) {
        return null;
    }

    return (
        <>
            <View style={styles.container} onLayout={handleLayout}>
                <BlurView 
                    intensity={45}
                    style={[
                        styles.background,
                        {
                            height: headerHeight,
                        }
                    ]}
                />
                <LinearGradient
                    colors={[backgroundColor, transparentColor]}
                    style={[
                        styles.background,
                        {
                            height: headerHeight,
                        }
                    ]}
                    locations={[0, 1]}
                />
                <View style={[styles.content, { marginTop: insets.top }]}>
                    <View style={styles.titleContainer}>
                        <ThemedText style={styles.title}>{title}</ThemedText>
                        {onScrollToToday && (
                            <PlatformPressable
                                onPress={onScrollToToday}
                                style={styles.todayButton}
                                pressOpacity={0.7}
                            >
                                <CalendarFold color={textColor} size={24} strokeWidth={1.7} />
                            </PlatformPressable>
                        )}
                    </View>
                    {/* <PlatformPressable
                        onPress={() => {
                            // Handle profile button press
                        }}
                        style={[styles.profileButton, {
                            // backgroundColor: backgroundSubtleContrast,
                            // borderColor: borderColor,
                        }]}
                        pressOpacity={1}
                    >
                        <Image
                            source={require('@/assets/images/profile-picture.webp')}
                            style={styles.profileImage}
                            contentFit="cover"
                        />
                    </PlatformPressable> */}
                    {/* <Image
                    source={isDarkMode ? darkLogo : lightLogo}
                    style={styles.logo}
                    contentFit="contain"
                /> */}
                </View>
                {children}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        // borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: 'rgba(140, 140, 140, 0.2)',

    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 26,
        fontWeight: '500',
        lineHeight: 0
    },
    // logo: {
    //     height: 26,
    //     width: 150,
    // },
    content: {
        minHeight: SPACING.headerHeight,
        paddingHorizontal: SPACING.pageHorizontal + SPACING.pageHorizontalInside,
        // flexDirection: 'row',
        paddingTop: 6,
        // alignItems: 'center',
        // justifyContent: 'space-between',
        // gap: 10,
        // backgroundColor: 'red',
    },
    todayButton: {
        // width: 38,
        // height: 38,
        // borderRadius: 19,
        padding: 4,
        paddingRight: 0,
        alignItems: 'center',
        justifyContent: 'center',
        // shadowColor: "red",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    // profileButton: {
    //     width: 42,
    //     height: 42,
    //     borderRadius: 24,
    //     overflow: 'hidden',
    //     // borderWidth: 1,
    // },
    // profileImage: {
    //     width: '100%',
    //     height: '100%',
    // },
}); 