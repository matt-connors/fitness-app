import { View, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import { SPACING } from '@/constants/Spacing';
import { ThemedText } from '../ThemedText';
import { usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import React from 'react';

const LabelMapping = {
    '/': 'Home',
    '/workouts': 'Workouts',
    '/library': 'Library',
    '/settings': 'Settings',
}

export function Header() {
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor('background');
    const pathname = usePathname();
    const isDarkMode = useColorScheme() === 'dark';

    const title = LabelMapping[pathname as keyof typeof LabelMapping] || 'Overview';

    const transparentColor = backgroundColor + 'ee'

    return (
        <>
            <View style={styles.container}>
                <LinearGradient
                    colors={[backgroundColor, transparentColor]}
                    style={[
                        styles.background,
                        {
                            height: SPACING.headerHeight + insets.top,
                            bottom: 0
                        }

                    ]}
                    locations={[0, 1]}
                />
                <View style={[styles.content, { marginTop: insets.top }]}>
                    {/* <PlatformPressable
                    onPress={() => {
                        // Handle profile button press
                    }}
                    style={[styles.profileButton, {
                        backgroundColor: backgroundSubtleContrast,
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
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    {/* <Image
                    source={isDarkMode ? darkLogo : lightLogo}
                    style={styles.logo}
                    contentFit="contain"
                /> */}

                </View>
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
    title: {
        fontSize: 26,
        fontWeight: '500',
        lineHeight: 0
    },
    logo: {
        height: 26,
        width: 150,
    },
    content: {
        height: SPACING.headerHeight,
        paddingHorizontal: SPACING.pageHorizontal,
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
        gap: 10,
        // backgroundColor: 'red',
    },
    profileButton: {
        width: 32,
        height: 32,
        borderRadius: 24,
        overflow: 'hidden',
        // borderWidth: 1,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
}); 