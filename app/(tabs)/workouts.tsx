import { Image, StyleSheet, Platform, Text, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PageContainer } from '@/components/PageContainer';
import { ThemedSection } from '@/components/ThemedSection';
import { Calendar, CalendarHeader } from '@/components/ui/Calendar';
import { Section } from '@/components/Section';
import { Header } from '@/components/ui/Header';

import React from 'react';
import { SPACING } from '@/constants/Spacing';

export default function WorkoutsScreen() {
    return (
        <>
            <Header overrideTitle="February">
                <View style={styles.calendarHeader}>
                    <CalendarHeader />
                </View>
            </Header>
            <PageContainer style={{ paddingInline: 1 }}>
                {/* <Section> */}
                    <Calendar />
                {/* </Section> */}
            </PageContainer>
        </>
    );
}

const styles = StyleSheet.create({
    calendarHeader: {
        paddingBottom: 4,
        // marginTop: 2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(140, 140, 140, 0.2)',
        paddingHorizontal: SPACING.pageHorizontal + SPACING.pageHorizontalInside,
    }
});
