import { Image, StyleSheet, Platform, Text, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSection } from '@/components/ThemedSection';
import { Calendar, CalendarHeader } from '@/components/ui/Calendar';
import { Section } from '@/components/Section';
import { Header } from '@/components/ui/Header';

import React, { useState, useCallback } from 'react';
import { SPACING } from '@/constants/Spacing';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function WorkoutsScreen() {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return MONTHS[now.getMonth()];
    });

    const handleMonthChange = useCallback((monthData: { month: number; year: number }) => {
        const currentYear = new Date().getFullYear();
        setCurrentMonth(
            monthData.year === currentYear
                ? MONTHS[monthData.month]
                : `${MONTHS[monthData.month]} ${monthData.year}`
        );
    }, []);

    return (
        <ThemedView style={styles.screen}>
            <Header overrideTitle={currentMonth}>
                <View style={styles.calendarHeader}>
                    <CalendarHeader />
                </View>
            </Header>
            <View style={styles.container}>
                <Calendar onMonthChange={handleMonthChange} />
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
        marginTop: SPACING.headerHeight + 30, // Add extra space for the calendar header
    },
    calendarHeader: {
        paddingBottom: 4,
        // marginTop: 2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(140, 140, 140, 0.2)',
        paddingHorizontal: SPACING.pageHorizontal + SPACING.pageHorizontalInside,
    }
});
