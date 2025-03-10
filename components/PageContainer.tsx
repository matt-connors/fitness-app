import React from "react";
import { ThemedView } from "./ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SPACING } from "@/constants/Spacing";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { View } from "react-native";

// Standard header measurements
const HEADER_HEIGHT = 60; // Main header row height
const HEADER_PADDING = 12; // Additional padding below header

interface PageContainerProps {
    children?: React.ReactNode;
    style?: any;
    hasHeader?: boolean; // Option to indicate if using StandardHeader
    hasHeaderContent?: boolean; // Option to indicate if header has additional content
}

export function PageContainer({ 
    children, 
    style, 
    hasHeader = false, 
    hasHeaderContent = false 
}: PageContainerProps) {
    const insets = useSafeAreaInsets();
    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    // Calculate appropriate top padding based on header presence
    const topPadding = hasHeader 
        ? insets.top + HEADER_HEIGHT + (hasHeaderContent ? HEADER_PADDING : 0)
        : 0;

    return <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={[
            {
                paddingHorizontal: SPACING.pageHorizontal,
                paddingTop: topPadding,
            },
            style
        ]}
    >
        <ThemedView>
            {children}
            {/* Add bottom padding for tabbar and safe area */}
            <View style={{ paddingBottom: SPACING.navHeight + insets.bottom }} />
        </ThemedView>
    </Animated.ScrollView>
}