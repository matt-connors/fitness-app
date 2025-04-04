import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from '../ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { LinearGradient } from 'expo-linear-gradient';

// Define standard header height
const HEADER_ROW_HEIGHT = 60;

interface StandardHeaderProps {
    title: string;
    rightContent?: ReactNode;
    additionalContent?: ReactNode;
    blurIntensity?: number;
}

export function StandardHeader({
    title,
    rightContent,
    additionalContent,
    blurIntensity = 40,
}: StandardHeaderProps) {
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor('backgroundSubtleContrast');
    const textColor = useThemeColor('text');
    const borderColor = useThemeColor('border');

    // Determine if we should use a blur effect
    // Blur looks best on iOS, while solid background may be better for Android
    const shouldUseBlur = Platform.OS === 'ios';

    return (
        <View style={[
            styles.container,
            {
                paddingTop: insets.top,
                // backgroundColor: shouldUseBlur ? 'transparent' : backgroundColor,
                backgroundColor,
                borderBottomColor: borderColor,
            }
        ]}>
            {/* {shouldUseBlur && (
                <>
                    <BlurView
                        intensity={40}
                        style={StyleSheet.absoluteFill}
                    // tint={isDark ? 'dark' : 'light'}
                    />
                    <LinearGradient
                        colors={[backgroundColor, backgroundColor + '80']}
                        style={StyleSheet.absoluteFill}
                        locations={[1, 0]}
                    />
                </>
            )} */}

            {/* Main header row with title and right content - fixed height */}
            <View style={styles.headerRow}>
                <ThemedText
                    style={styles.title}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </ThemedText>

                {rightContent && (
                    <View style={styles.rightContent}>
                        {rightContent}
                    </View>
                )}
            </View>

            {/* Optional additional content area */}
            {additionalContent && (
                <View style={styles.additionalContent}>
                    {additionalContent}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomWidth: 1,
    },
    headerRow: {
        height: HEADER_ROW_HEIGHT,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.pageHorizontal,
    },
    title: {
        fontSize: 26, // Slightly reduced font size
        fontWeight: '400',
        paddingTop: 4, // Prevent top cutoff
        flex: 1, // Allow title to fill available space
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginLeft: 10, // Add space between title and buttons
    },
    additionalContent: {
        paddingHorizontal: SPACING.pageHorizontal,
        paddingBottom: 12,
    }
}); 