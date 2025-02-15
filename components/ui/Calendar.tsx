import React, { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
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
    };
}

interface CalendarProps {
    selectedDate?: Date;
    onSelectDate?: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
            ][Math.floor(Math.random() * 4)] : {}
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
                    // { backgroundColor: backgroundColor },
                    // currentDayOfWeek === day && { backgroundColor: accent }
                ]}>
                    <ThemedText style={[
                        styles.headerText,
                        // { color: textSecondary },
                        // currentDayOfWeek === day && { color: text }
                    ]}>
                        {day}
                    </ThemedText>
                </View>
            ))}
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
                    // { backgroundColor: backgroundColor }
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

function CalendarGuide() {

    const keys = [
        { label: 'Chest / Back', color: '#3A84E8' },
        { label: 'Legs', color: '#FF6F00' },
        { label: 'Shoulders', color: '#292E34' }
    ]

    return (
        <View style={styles.guide}>
            {keys.map((key) => (
                <View style={styles.guideItem}>
                    <View style={[styles.guideItemColor, { backgroundColor: key.color }]}></View>
                    <ThemedText style={styles.guideItemText}>{key.label}</ThemedText>
                </View>
            ))}
        </View>
    )
}

export function Calendar({ selectedDate = new Date() }: CalendarProps) {
    const { width } = useWindowDimensions();
    const cellSize = (width - (SPACING.pageHorizontal * 2) - (SPACING.pageHorizontalInside * 2)) / 7;

    const calendarDays = useMemo(() => {
        return getCalendarDays(
            selectedDate.getFullYear(),
            selectedDate.getMonth()
        );
    }, [selectedDate]);

    return (
        <View style={styles.container}>
            <ThemedText style={styles.monthText}>Feb</ThemedText>
            <View style={styles.grid}>
                {calendarDays.map((day, index) => (
                    <CalendarCell key={index} day={day} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    title: {
        fontSize: 26,
        fontWeight: '500',
        lineHeight: 0,
        marginBottom: 6,
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
        aspectRatio: 1/1.5,
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
        // backgroundColor: "#333",
    },
    cellText: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    workoutBadge: {
        width: '100%',
        // width: 7,
        // height: 14,
        paddingBlock: 2,
        paddingHorizontal: 4,
        borderRadius: 4,
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translate(-50%)',
    },
    guide: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 22,
    },
    guideItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    guideItemColor: {
        width: 7,
        height: 7,
        borderRadius: 2,
    },
    guideItemText: {
        fontSize: 13,
        fontWeight: '500',
    },
    workoutBadgeText: {
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 0,
    }
});

