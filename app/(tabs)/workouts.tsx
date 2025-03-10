import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Calendar, CalendarHeader } from '@/components/ui/Calendar';
import React, { useState, useCallback, useRef } from 'react';
import { SPACING } from '@/constants/Spacing';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Standard header measurements
const HEADER_HEIGHT = 60; // Main header row height
const HEADER_CONTENT_HEIGHT = 30; // Estimated height of calendar day headers

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function WorkoutsScreen() {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return MONTHS[now.getMonth()];
    });
    const calendarRef = useRef<{ scrollToToday: () => void }>(null);
    const accentColor = useThemeColor('brand');
    const insets = useSafeAreaInsets();

    const handleMonthChange = useCallback((monthData: { month: number; year: number }) => {
        const currentYear = new Date().getFullYear();
        setCurrentMonth(
            monthData.year === currentYear
                ? MONTHS[monthData.month]
                : `${MONTHS[monthData.month]} ${monthData.year}`
        );
    }, []);

    const handleScrollToToday = () => {
        calendarRef.current?.scrollToToday();
    };

    // Prepare the Today button for the header
    const todayButton = (
        <PlatformPressable 
            style={[styles.todayButton, { backgroundColor: accentColor }]} 
            onPress={handleScrollToToday}
        >
            <ThemedText style={styles.todayButtonText}>Today</ThemedText>
        </PlatformPressable>
    );

    // Prepare the calendar header as additional content
    const calendarHeaderContent = (
        <View style={styles.calendarHeader}>
            <CalendarHeader />
        </View>
    );

    // Calculate the top padding needed for the calendar based on our header height
    const calendarTopPadding = insets.top + HEADER_HEIGHT + HEADER_CONTENT_HEIGHT;

    return (
        <ThemedView style={styles.screen}>
            <StandardHeader 
                title={currentMonth}
                rightContent={todayButton}
                additionalContent={calendarHeaderContent}
            />
            
            {/* Use a View with padding instead of PageContainer to avoid nested ScrollViews */}
            <View style={[styles.container, { paddingTop: calendarTopPadding }]}>
                <Calendar 
                    ref={calendarRef}
                    onMonthChange={handleMonthChange} 
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: SPACING.pageHorizontal,
    },
    todayButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
    },
    todayButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    calendarHeader: {
        paddingHorizontal: SPACING.pageHorizontalInside,
    }
});
