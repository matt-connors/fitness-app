import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlatformPressable } from '@react-navigation/elements';
import { SPACING } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PlusCircle, Dumbbell, Clock } from 'lucide-react-native';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { PageContainer } from '@/components/PageContainer';

// Mock data for saved routines
const SAVED_ROUTINES = [
    { id: '1', name: 'Full Body Strength', type: 'Strength', lastUsed: '3 days ago' },
    { id: '2', name: 'Upper/Lower Split', type: 'Strength', lastUsed: '1 week ago' },
    { id: '3', name: 'HIIT Cardio', type: 'Cardio', lastUsed: 'Never' },
    { id: '4', name: 'Push/Pull/Legs', type: 'Strength', lastUsed: '2 weeks ago' },
];

export default function LibraryScreen() {
    const router = useRouter();
    const accentColor = useThemeColor('brand');
    const borderColor = useThemeColor('border');
    const cardBgColor = useThemeColor('backgroundSubtleContrast');
    const textColor = useThemeColor('text');
    
    const handleCreateRoutine = () => {
        router.push('/create-workout');
    };
    
    const handleEditRoutine = (routine: any) => {
        router.push({
            pathname: '/create-workout',
            params: { workout: JSON.stringify(routine) }
        });
    };

    // Create Button for the header
    const createButton = (
        <PlatformPressable 
            style={[styles.createButton, { borderColor }]} 
            onPress={handleCreateRoutine}
        >
            <PlusCircle size={20} color={accentColor} />
            <ThemedText style={[styles.createButtonText, { color: accentColor }]}>
                Create
            </ThemedText>
        </PlatformPressable>
    );

    return (
        <ThemedView style={styles.screen}>
            <StandardHeader 
                title="Library"
                rightContent={createButton}
            />
            
            <PageContainer hasHeader={true}>
                {SAVED_ROUTINES.map(routine => (
                    <PlatformPressable 
                        key={routine.id}
                        style={[styles.routineCard, { backgroundColor: cardBgColor }]}
                        onPress={() => handleEditRoutine(routine)}
                    >
                        <View style={styles.iconContainer}>
                            <Dumbbell size={24} color={textColor} />
                        </View>
                        <View style={styles.routineInfo}>
                            <ThemedText style={styles.routineName}>{routine.name}</ThemedText>
                            <View style={styles.routineMetaRow}>
                                <ThemedText style={styles.routineType}>{routine.type}</ThemedText>
                                <View style={styles.lastUsedContainer}>
                                    <Clock size={12} color={textColor} style={styles.clockIcon} />
                                    <ThemedText style={styles.lastUsed}>
                                        {routine.lastUsed}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </PlatformPressable>
                ))}
            </PageContainer>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 20,
        borderStyle: 'solid',
    },
    createButtonText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    routineCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: 'rgba(100, 100, 100, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    routineInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    routineName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    routineMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    routineType: {
        fontSize: 14,
        opacity: 0.7,
    },
    lastUsedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    clockIcon: {
        opacity: 0.7,
        marginRight: 4,
    },
    lastUsed: {
        fontSize: 14,
        opacity: 0.7,
    },
});
