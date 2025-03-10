import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { PageContainer } from '@/components/PageContainer';

export default function HomeScreen() {
    return (
        <ThemedView style={styles.screen}>
            <StandardHeader title="Home" />
            
            <PageContainer hasHeader={true}>
                <ThemedText style={styles.welcome}>Welcome to Fitness App</ThemedText>
                {/* Add your home screen content here */}
            </PageContainer>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    welcome: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 24,
    }
});
