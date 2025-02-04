import { Image, StyleSheet, Platform, Text, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SPACING } from '@/constants/Spacing';

export default function HomeScreen() {
    return (
        <ThemedView style={styles.container}>
            {/* <ThemedText>Home</ThemedText> */}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        paddingHorizontal: SPACING.pageHorizontal,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
