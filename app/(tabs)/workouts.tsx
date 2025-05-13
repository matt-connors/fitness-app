import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, AppState, AppStateStatus, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Calendar, CalendarHeader, CalendarRef } from '@/components/calendar';
import { MONTHS, MonthData, CalendarDay } from '@/app/models/calendar';
import { SPACING } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { GET_USER_SESSIONS } from '@/lib/graphql/queries';
import { WorkoutEvent } from '@/app/models/calendar';
import { getWorkoutColor } from '@/app/utils/workoutColors';
import { useRouter } from 'expo-router';

// Standard header measurements
const HEADER_HEIGHT = 60; // Main header row height
const HEADER_CONTENT_HEIGHT = 30; // Estimated height of calendar day headers

export default function WorkoutsScreen() {
    const router = useRouter();
    
    // Use the current month for initial state
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return MONTHS[now.getMonth()];
    });
    
    const [currentYear, setCurrentYear] = useState(() => {
        return new Date().getFullYear();
    });

    // Track current date range for queries
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 31);
        return { fromDate: startDate.toISOString(), toDate: endDate.toISOString() };
    });

    const [workouts, setWorkouts] = useState<WorkoutEvent[]>([]);
    const [isScrollingToToday, setIsScrollingToToday] = useState(false);

    const calendarRef = useRef<CalendarRef>(null);
    const appState = useRef(AppState.currentState);
    const accentColor = useThemeColor('brand');
    const accentColorText = useThemeColor('brandText');
    const insets = useSafeAreaInsets();

    // Fetch sessions data using Apollo Client
    const { loading, error, data, refetch } = useQuery(GET_USER_SESSIONS, {
        variables: dateRange,
        fetchPolicy: 'cache-and-network',
    });

    // Transform session data into workout events
    useEffect(() => {
        if (data?.sessions) {
            const workoutEvents: WorkoutEvent[] = data.sessions.map((session: any) => {
                // Use routine name if available, otherwise use session name or default
                const label = session.routine?.name || session.name || 'Workout';
                
                // Get a consistent color for this workout name
                const color = getWorkoutColor(label);
                
                // Convert date string to Date object
                const sessionDate = new Date(session.date);
                
                return {
                    id: session.id.toString(),
                    label: label,
                    color: color,
                    date: sessionDate,
                    duration: session.duration,
                };
            });
            
            setWorkouts(workoutEvents);
        }
    }, [data]);

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
                    handleScrollToToday();
                }
                
                // Refetch data when app comes to foreground
                refetch();
            }
            
            appState.current = nextAppState;
        });
        
        return () => {
            subscription.remove();
        };
    }, [refetch]);

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
        
        // Update date range when scrolling far enough (adding buffer on both sides)
        const startDate = new Date(monthData.year, monthData.month - 3, 1);
        const endDate = new Date(monthData.year, monthData.month + 3, 31);
        
        setDateRange({
            fromDate: startDate.toISOString(),
            toDate: endDate.toISOString()
        });
    }, []);

    // Handle pressing a day in the calendar
    const handleDayPress = useCallback((day: CalendarDay) => {
        if (day.workout) {
            console.log('Workout pressed:', day.workout);
            
            // Navigate to workout details page - for now just use a generic path
            // We'll need to create this screen later
            router.push('/create-routine');
        } else if (day.isCurrentMonth) {
            console.log('Empty day selected:', day.fullDate);
            
            // Navigate to create session page with the selected date
            router.push({
                pathname: '/create-routine',
                params: { 
                    mode: 'create', 
                    date: day.fullDate.toISOString() 
                }
            });
        }
    }, [router]);

    // Scroll calendar to today's date with debounce
    const handleScrollToToday = useCallback(() => {
        if (isScrollingToToday) return;
        
        setIsScrollingToToday(true);
        
        try {
            if (calendarRef.current) {
                calendarRef.current.scrollToToday();
            }
        } catch (error) {
            console.error('Error scrolling to today:', error);
        }
        
        // Reset the scrolling flag after a delay
        setTimeout(() => {
            setIsScrollingToToday(false);
        }, 1000);
    }, [isScrollingToToday]);

    // Prepare the Today button for the header
    const todayButton = (
        <TouchableOpacity
            style={[
                styles.todayButton, 
                { backgroundColor: accentColor },
                isScrollingToToday && styles.todayButtonDisabled
            ]} 
            onPress={handleScrollToToday}
            disabled={isScrollingToToday}
            activeOpacity={0.7}
        >
            <ThemedText style={[styles.todayButtonText, { color: accentColorText }]}>
                Today
            </ThemedText>
        </TouchableOpacity>
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
                    workouts={workouts}
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    todayButtonDisabled: {
        opacity: 0.6,
    },
    todayButtonText: {
        fontWeight: '400',
        fontSize: 14,
    },
    calendarHeader: {
        paddingHorizontal: SPACING.pageHorizontalInside,
    }
});
