import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, AppState, AppStateStatus } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Calendar, CalendarHeader, CalendarRef } from '@/components/calendar';
import { MONTHS, MOCK_WORKOUTS, MonthData, CalendarDay } from '@/app/models/calendar';
import { SPACING } from '@/constants/Spacing';
import { PlatformPressable } from '@react-navigation/elements';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Standard header measurements
const HEADER_HEIGHT = 60; // Main header row height
const HEADER_CONTENT_HEIGHT = 30; // Estimated height of calendar day headers

export default function WorkoutsScreen() {
    // Use the current month for initial state
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return MONTHS[now.getMonth()];
    });
    
    const [currentYear, setCurrentYear] = useState(() => {
        return new Date().getFullYear();
    });

    const calendarRef = useRef<CalendarRef>(null);
    const appState = useRef(AppState.currentState);
    const accentColor = useThemeColor('brand');
    const insets = useSafeAreaInsets();

    // Handle app state changes (to reset when coming back to the app)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground, refresh today if needed
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();
                
                // Check if today's month is different from what we're viewing
                if (currentYear !== new Date().getFullYear() || currentMonth !== new Date().getMonth()) {
                    // Reset view to today
                    calendarRef.current?.scrollToToday();
                }
            }
            
            appState.current = nextAppState;
        });
        
        return () => {
            subscription.remove();
        };
    }, []);

    // Handle month changes in the calendar
    const handleMonthChange = useCallback((monthData: MonthData) => {
        const thisYear = new Date().getFullYear();
        setCurrentYear(monthData.year);
        
        // Display year in title only if it's not the current year
        setCurrentMonth(
            monthData.year === thisYear
                ? MONTHS[monthData.month]
                : `${MONTHS[monthData.month]} ${monthData.year}`
        );
    }, []);

    // Handle pressing a day in the calendar
    const handleDayPress = useCallback((day: CalendarDay) => {
        if (day.workout) {
            console.log('Workout pressed:', day.workout);
            // You could navigate to workout details or show a modal here
        } else if (day.isCurrentMonth) {
            console.log('Day selected:', day.fullDate);
            // Handle empty day selection (e.g., to create a new workout)
        }
    }, []);

    // Scroll calendar to today's date
    const handleScrollToToday = useCallback(() => {
        calendarRef.current?.scrollToToday();
    }, []);

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
                    selectedDate={new Date()}
                    workouts={MOCK_WORKOUTS}
                    onMonthChange={handleMonthChange}
                    onDayPress={handleDayPress}
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
        // paddingHorizontal: SPACING.pageHorizontal,
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
