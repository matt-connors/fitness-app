import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StandardHeader } from '@/components/ui/StandardHeader';
import { PageContainer } from '@/components/PageContainer';
import { ThemedSection } from '@/components/ThemedSection';
import { SPACING } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GET_USER_SESSIONS } from '@/lib/graphql/queries';
import { CREATE_SESSION } from '@/lib/graphql/mutations';
import { Plus, Book, Clock, BarChart2, Calendar, ChevronRight, Info } from 'lucide-react-native';
import { useActiveWorkout } from '@/components/ActiveWorkoutProvider';

// Define session interface based on GraphQL schema
interface Session {
    id: number;
    name: string | null;
    date: string;
    duration: number | null;
    routine?: {
        id: number;
        name: string;
        type: string;
    } | null;
}

export default function HomeScreen() {
    const router = useRouter();
    const textColor = useThemeColor('text');
    const textMutedColor = useThemeColor('textMuted');
    const textSubtleColor = useThemeColor('textSecondary');
    const brandColor = useThemeColor('brand');
    const brandTextColor = useThemeColor('brandText');
    const backgroundContrastColor = useThemeColor('backgroundContrast');
    const { startNewWorkout } = useActiveWorkout();

    // Get current date range for this week
    const getDateRange = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // First day of current week
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(today);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Last day of current week
        endOfWeek.setHours(23, 59, 59, 999);
        
        return {
            fromDate: startOfWeek.toISOString(),
            toDate: endOfWeek.toISOString()
        };
    };

    // Get sessions for the current week
    const { loading, error, data, refetch } = useQuery(GET_USER_SESSIONS, {
        variables: getDateRange(),
        fetchPolicy: 'network-only',
    });

    // Calculate stats from sessions data
    const calculateStats = () => {
        if (!data || !data.sessions) return { workoutsCompleted: 0, totalDuration: 0, daysActive: 0 };
        
        const sessions = data.sessions as Session[];
        
        // Total workouts completed this week
        const workoutsCompleted = sessions.length;
        
        // Total duration in minutes
        const totalDuration = sessions.reduce((total: number, session: Session) => {
            return total + (session.duration || 0);
        }, 0) / 60; // Convert from seconds to minutes
        
        // Unique days with activity
        const uniqueDays = new Set();
        sessions.forEach((session: Session) => {
            const date = new Date(session.date);
            uniqueDays.add(date.toDateString());
        });
        const daysActive = uniqueDays.size;
        
        return {
            workoutsCompleted,
            totalDuration: Math.round(totalDuration),
            daysActive
        };
    };

    const stats = calculateStats();
    const hasStats = stats.workoutsCompleted > 0 || stats.totalDuration > 0 || stats.daysActive > 0;

    // Start a new workout session using the ActiveWorkoutProvider
    const handleStartWorkout = () => {
        startNewWorkout("Quick Workout");
    };

    // Navigate to library to select a routine
    const browseRoutines = () => {
        router.push('/library');
    };

    // Render loading state with skeleton placeholders
    const renderLoadingSkeleton = () => (
        <View style={styles.loadingContainer}>
            <View style={styles.loadingBar} />
            <View style={[styles.loadingBar, { width: '60%' }]} />
        </View>
    );

    return (
        <ThemedView style={styles.screen}>
            <StandardHeader title="Home" />
            
            <PageContainer hasHeader={true}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    
                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: brandColor }]}
                            onPress={handleStartWorkout}
                        >
                            <Plus size={20} color={brandTextColor} />
                            <ThemedText style={[styles.actionButtonText, { color: brandTextColor }]}>
                                Start Workout
                            </ThemedText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: backgroundContrastColor }]}
                            onPress={browseRoutines}
                        >
                            <Book size={20} color={textColor} />
                            <ThemedText style={styles.actionButtonText}>
                                Select Routine
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Weekly Stats Section */}
                    <ThemedText style={[styles.sectionHeader, { color: textMutedColor, marginBottom: SPACING.pageHorizontalInside }]}>This Week</ThemedText>
                    <ThemedSection style={styles.statsSection}>
                        {loading ? (
                            <View style={styles.statsGrid}>
                                {[1, 2, 3].map((_, index) => (
                                    <View key={index} style={styles.statItem}>
                                        <View style={styles.statContent}>
                                            <View style={styles.loadingValue} />
                                            <View style={styles.loadingLabel} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : !hasStats ? (
                            <View style={styles.emptyStateContainer}>
                                <Info size={22} color={textMutedColor} style={styles.emptyStateIcon} />
                                <ThemedText style={{ color: textMutedColor, fontWeight: '400', textAlign: 'center' }}>
                                    No workout activity this week.
                                </ThemedText>
                                <ThemedText style={{ color: textMutedColor, fontWeight: '400', fontSize: 13, textAlign: 'center' }}>
                                    Start a workout to track your progress.
                                </ThemedText>
                            </View>
                        ) : (
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    {/* <BarChart2 size={22} color={textColor} /> */}
                                    <View style={styles.statContent}>
                                        <ThemedText style={styles.statValue}>{stats.workoutsCompleted}</ThemedText>
                                        <ThemedText style={[styles.statLabel, { color: textMutedColor, fontWeight: '400' }]}>Workouts</ThemedText>
                                    </View>
                                </View>
                                
                                <View style={styles.statItem}>
                                    {/* <Clock size={22} color={textColor} /> */}
                                    <View style={styles.statContent}>
                                        <ThemedText style={styles.statValue}>{stats.totalDuration}</ThemedText>
                                        <ThemedText style={[styles.statLabel, { color: textMutedColor, fontWeight: '400' }]}>Minutes</ThemedText>
                                    </View>
                                </View>
                                
                                <View style={styles.statItem}>
                                    {/* <Calendar size={22} color={textColor} /> */}
                                    <View style={styles.statContent}>
                                        <ThemedText style={styles.statValue}>{stats.daysActive}</ThemedText>
                                        <ThemedText style={[styles.statLabel, { color: textMutedColor, fontWeight: '400' }]}>Days Active</ThemedText>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ThemedSection>
                    
                    {/* Recent Workouts Section */}
                    <View style={styles.recentWorkoutsHeader}>
                        <ThemedText style={[styles.sectionHeader, { color: textMutedColor }]}>Recent Workouts</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/workouts')}>
                            <ThemedText style={{ color: textMutedColor, fontWeight: '400', fontSize: 13 }}>View All</ThemedText>
                        </TouchableOpacity>
                    </View>
                    
                    <ThemedSection style={styles.recentWorkoutsSection}>
                        {loading ? (
                            <View>
                                {[1, 2, 3].map((_, index) => (
                                    <View 
                                        key={index} 
                                        style={[
                                            styles.workoutItem,
                                            index < 2 && styles.workoutItemBorder
                                        ]}
                                    >
                                        {renderLoadingSkeleton()}
                                    </View>
                                ))}
                            </View>
                        ) : error ? (
                            <View style={styles.emptyStateContainer}>
                                <Info size={22} color={textMutedColor} style={styles.emptyStateIcon} />
                                <ThemedText style={{ color: textMutedColor, fontWeight: '400', textAlign: 'center' }}>
                                    Unable to load workouts
                                </ThemedText>
                                <TouchableOpacity onPress={() => refetch()}>
                                    <ThemedText style={{ color: brandColor, fontWeight: '400', fontSize: 13, marginTop: 8 }}>
                                        Try Again
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        ) : data?.sessions?.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <Info size={22} color={textMutedColor} style={styles.emptyStateIcon} />
                                <ThemedText style={{ color: textMutedColor, fontWeight: '400', textAlign: 'center' }}>
                                    No recent workouts found
                                </ThemedText>
                                <ThemedText style={{ color: textMutedColor, fontWeight: '400', fontSize: 13, textAlign: 'center' }}>
                                    Start tracking your fitness journey today
                                </ThemedText>
                            </View>
                        ) : (
                            <View>
                                {(data.sessions as Session[]).slice(0, 3).map((session: Session, index: number) => (
                                    <TouchableOpacity 
                                        key={session.id} 
                                        style={[
                                            styles.workoutItem,
                                            index < (data.sessions as Session[]).slice(0, 3).length - 1 && styles.workoutItemBorder
                                        ]}
                                        onPress={() => router.push({
                                            pathname: '/workouts',
                                            params: { sessionId: session.id }
                                        })}
                                    >
                                        <View style={styles.workoutInfo}>
                                            <ThemedText style={styles.workoutName}>
                                                {session.name || (session.routine ? session.routine.name : "Workout")}
                                            </ThemedText>
                                            <ThemedText style={[styles.workoutDate, { color: textSubtleColor, fontWeight: '400' }]}>
                                                {new Date(session.date).toLocaleDateString()}
                                            </ThemedText>
                                        </View>
                                        <ChevronRight size={18} color={textMutedColor} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ThemedSection>
                </ScrollView>
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
    },
    quickActions: {
        marginTop: SPACING.pageVertical,
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    actionButtonText: {
        fontWeight: '400',
        marginLeft: 8,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '500',
        // marginBottom: 12,
    },
    statsSection: {
        marginBottom: 30,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    statContent: {
        marginLeft: 8,
        flexDirection: 'column',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    recentWorkoutsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.pageHorizontalInside,
    },
    recentWorkoutsSection: {
        marginBottom: 30,
    },
    workoutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    workoutItemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    },
    workoutInfo: {
        flex: 1,
    },
    workoutName: {
        fontSize: 15,
        fontWeight: '400',
        // marginBottom: 4,
        lineHeight: 20
    },
    workoutDate: {
        fontSize: 13,
    },
    // Loading and empty state styles
    loadingContainer: {
        paddingVertical: 8,
        width: '100%',
    },
    loadingBar: {
        height: 14,
        width: '80%',
        backgroundColor: 'rgba(180, 180, 180, 0.1)',
        borderRadius: 4,
        marginVertical: 4,
    },
    loadingValue: {
        height: 20,
        width: 24,
        backgroundColor: 'rgba(180, 180, 180, 0.1)',
        borderRadius: 4,
        marginBottom: 4,
    },
    loadingLabel: {
        height: 12,
        width: 50,
        backgroundColor: 'rgba(180, 180, 180, 0.1)',
        borderRadius: 4,
    },
    emptyStateContainer: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateIcon: {
        marginBottom: 10,
    },
});
