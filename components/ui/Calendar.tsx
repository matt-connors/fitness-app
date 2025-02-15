import React, { useMemo, useState, useRef, useCallback } from "react";
import { StyleSheet, View, useWindowDimensions, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ThemedText } from "../ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SPACING } from "@/constants/Spacing";

interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    workout?: {
        label: string;
        color: string;
    } | undefined;
}

interface MonthData {
    month: number;
    year: number;
    days: CalendarDay[];
    id: string;
}

interface CalendarProps {
    selectedDate?: Date;
    onSelectDate?: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Calculate month height based on aspect ratio and padding
const CELL_ASPECT_RATIO = 1.5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_WIDTH = (SCREEN_WIDTH - (SPACING.pageHorizontal * 2) - (SPACING.pageHorizontalInside * 2)) / 7;
const CELL_HEIGHT = CELL_WIDTH * CELL_ASPECT_RATIO;
const MONTH_HEIGHT = (CELL_HEIGHT * 6) + 40; // 6 rows of days + header + padding

function createDate(year: number, month: number, day: number = 1): Date {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = createDate(year, month);
    const firstDayOfMonth = firstDay.getDay();
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const days: CalendarDay[] = [];

    // Previous month's days
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({
            date: daysInPrevMonth - firstDayOfMonth + i + 1,
            isCurrentMonth: false,
            isToday: false,
        });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = createDate(year, month, i);
        const isToday = currentDate.getTime() === today.getTime();

        days.push({
            date: i,
            isCurrentMonth: true,
            isToday,
            workout: i < 15 ? [
                { label: 'Chest / Back', color: '#442A0A' },
                { label: 'Legs', color: '#072B3E' },
                { label: 'Shoulders', color: '#292E34' },
            ][Math.floor(Math.random() * 3)] : undefined
        });
    }

    // Next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: i,
            isCurrentMonth: false,
            isToday: false
        });
    }

    return days;
}

function getMonthData(date: Date): MonthData {
    return {
        month: date.getMonth(),
        year: date.getFullYear(),
        days: getCalendarDays(date.getFullYear(), date.getMonth()),
        id: `${date.getFullYear()}-${date.getMonth()}`
    };
}

function getInitialMonths(currentDate: Date): MonthData[] {
    const months: MonthData[] = [];
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 3); // Start 3 months before

    for (let i = 0; i < 7; i++) { // Load 7 months (3 before, current, 3 after)
        months.push(getMonthData(startDate));
        startDate.setMonth(startDate.getMonth() + 1);
    }

    return months;
}

export function CalendarHeader() {
    const textSecondary = useThemeColor('textSecondary');
    const backgroundColor = useThemeColor('backgroundSubtleContrast');
    const accent = useThemeColor('textSecondary');
    const text = useThemeColor('textContrast');

    return (
        <View style={styles.header}>
            {DAYS_OF_WEEK.map((day) => (
                <View key={day} style={[
                    styles.headerCell,
                ]}>
                    <ThemedText style={[
                        styles.headerText,
                    ]}>
                        {day}
                    </ThemedText>
                </View>
            ))}
        </View>
    );
}

function MonthView({ data }: { data: MonthData }) {
    return (
        <View style={styles.monthContainer}>
            <ThemedText style={styles.monthText}>
                {MONTHS[data.month]} {data.year}
            </ThemedText>
            <View style={styles.grid}>
                {data.days.map((day, index) => (
                    <CalendarCell key={index} day={day} />
                ))}
            </View>
        </View>
    );
}

function CalendarCell({ day }: { day: CalendarDay }) {
    const textColor = useThemeColor('textMuted');
    const textSecondary = useThemeColor('textSecondary');
    const backgroundColor = useThemeColor('backgroundSubtleContrast');
    const textAccent = useThemeColor('text');

    return (
        <View style={[styles.cell, {
            borderTopWidth: day.isCurrentMonth ? StyleSheet.hairlineWidth : 0,
        }]}>
            {day.isCurrentMonth ? (
                <View style={[
                    styles.cellContent,
                ]}>
                    {day.workout && (
                        <View style={[styles.workoutBadge, { backgroundColor: day.workout.color }]}>
                            <ThemedText numberOfLines={1} ellipsizeMode="clip" style={styles.workoutBadgeText}>{day.workout.label}</ThemedText>
                        </View>
                    )}
                    <ThemedText style={[
                        styles.cellText,
                        { color: textColor },
                        day.isToday && { color: textAccent }
                    ]}>
                        {day.date}
                    </ThemedText>
                </View>
            ) : (
                <View style={styles.cellContent}></View>
            )}
        </View>
    );
}

export function Calendar({ selectedDate = new Date() }: CalendarProps) {
    const [months, setMonths] = useState(() => getInitialMonths(selectedDate));
    const flatListRef = useRef<FlatList>(null);
    const isLoadingRef = useRef(false);
    const currentMonthIndex = useRef(3);
    const currentScrollOffset = useRef(0);

    // Scroll to current month on mount
    React.useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({
                index: currentMonthIndex.current,
                animated: true
            });
        }, 100);
    }, []);

    const loadMoreMonths = useCallback((direction: 'before' | 'after') => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        setMonths(currentMonths => {
            const newMonths = [...currentMonths];
            const baseDate = direction === 'before' 
                ? new Date(currentMonths[0].year, currentMonths[0].month, 1)
                : new Date(currentMonths[currentMonths.length - 1].year, currentMonths[currentMonths.length - 1].month, 1);

            // Add 3 months in the requested direction
            const monthsToAdd = [];
            for (let i = 0; i < 3; i++) {
                if (direction === 'before') {
                    baseDate.setMonth(baseDate.getMonth() - 1);
                    monthsToAdd.unshift(getMonthData(baseDate));
                } else {
                    baseDate.setMonth(baseDate.getMonth() + 1);
                    monthsToAdd.push(getMonthData(baseDate));
                }
            }

            if (direction === 'before') {
                // Calculate the offset to maintain scroll position
                const additionalOffset = MONTH_HEIGHT * monthsToAdd.length;
                requestAnimationFrame(() => {
                    flatListRef.current?.scrollToOffset({
                        offset: currentScrollOffset.current + additionalOffset,
                        animated: false
                    });
                });
                return [...monthsToAdd, ...newMonths];
            } else {
                return [...newMonths, ...monthsToAdd];
            }
        });

        setTimeout(() => {
            isLoadingRef.current = false;
        }, 100);
    }, []);

    const getItemLayout = useCallback((data: any, index: number) => ({
        length: MONTH_HEIGHT,
        offset: MONTH_HEIGHT * index,
        index,
    }), []);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        currentScrollOffset.current = contentOffset.y;
        
        // Check if we're near the top (within 2 month heights)
        if (contentOffset.y < MONTH_HEIGHT * 2) {
            loadMoreMonths('before');
        }
        
        // Check if we're near the bottom (within 2 month heights)
        if (contentSize.height - (contentOffset.y + layoutMeasurement.height) < MONTH_HEIGHT * 2) {
            loadMoreMonths('after');
        }
    }, [loadMoreMonths]);

    const handleScrollToIndexFailed = useCallback((info: {
        index: number;
        highestMeasuredFrameIndex: number;
        averageItemLength: number;
    }) => {
        const offset = info.averageItemLength * info.index;
        flatListRef.current?.scrollToOffset({
            offset,
            animated: false,
        });

        // Try again but with animation
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
            });
        }, 100);
    }, []);

    return (
        <FlatList
            ref={flatListRef}
            data={months}
            renderItem={({ item }) => <MonthView data={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            getItemLayout={getItemLayout}
            initialScrollIndex={currentMonthIndex.current}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            windowSize={5}
            maxToRenderPerBatch={3}
            initialNumToRender={7}
            removeClippedSubviews={true}
            style={styles.list}
            contentContainerStyle={styles.listContent}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: SPACING.pageHorizontal,
    },
    monthContainer: {
        width: '100%',
        height: MONTH_HEIGHT,
        marginBottom: 0, // Remove any margin to prevent overlapping
    },
    container: {
        width: '100%',
    },
    monthText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
        textAlign: 'right',
        marginRight: 12,
    },
    header: {
        flexDirection: 'row',
        marginBottom: 2,
        gap: 2,
        justifyContent: 'space-between',
    },
    headerCell: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 13,
        fontWeight: '500',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: `${(100 / 7) - .01}%`,
        aspectRatio: 1/CELL_ASPECT_RATIO,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(140, 140, 140, 0.2)',
        padding: 2,
    },
    cellContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderRadius: 14,
        position: 'relative',
    },
    cellText: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    workoutBadge: {
        width: '100%',
        paddingBlock: 2,
        paddingHorizontal: 4,
        borderRadius: 4,
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translate(-50%)',
    },
    workoutBadgeText: {
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 0,
    }
});

