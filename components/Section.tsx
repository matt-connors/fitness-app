import { SPACING } from '@/constants/Spacing';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function Section({ children, style }: { children?: React.ReactNode, style?: any}) {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 14,
        // paddingHorizontal: SPACING.pageHorizontalInside,
    },
});


