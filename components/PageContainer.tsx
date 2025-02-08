import React from "react";
import { ThemedView } from "./ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SPACING } from "@/constants/Spacing";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { View } from "react-native";

export function PageContainer({ children }: { children?: React.ReactNode }) {
    const insets = useSafeAreaInsets();
    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    return <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{
            paddingHorizontal: SPACING.pageHorizontal,
            paddingTop: SPACING.headerHeight + insets.top,
        }}
    >
        <ThemedView>
            {children}
            {/* Since adding padding to the bottom of the scroll view doesn't work properly,
                we need to add a view to the bottom of the scroll view */}
            <View style={{ paddingBottom: SPACING.navHeight + insets.bottom }} />
        </ThemedView>
    </Animated.ScrollView>


}