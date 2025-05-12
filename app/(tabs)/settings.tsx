import { StyleSheet, View, Switch, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StandardHeader } from '@/components/ui/StandardHeader';
import React, { useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { PageContainer } from '@/components/PageContainer';
import { useAuth } from '../../lib/context/AuthContext';

export default function SettingsScreen() {
    const accentColor = useThemeColor('brand');
    const borderColor = useThemeColor('border');
    const cardBgColor = useThemeColor('backgroundSubtleContrast');
    const dangerColor = '#ff3b30'; // iOS red color for destructive actions
    
    // Example settings state
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [metricUnits, setMetricUnits] = useState(true);

    const { signOut, user } = useAuth();

    const handleLogout = async () => {
        try {
            Alert.alert(
                "Logout",
                "Are you sure you want to log out?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    { 
                        text: "Logout", 
                        onPress: async () => {
                            await signOut();
                        },
                        style: "destructive"
                    }
                ]
            );
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <ThemedView style={styles.screen}>
            <StandardHeader title="Settings" />
            
            <PageContainer hasHeader={true}>
                {/* App settings */}
                <View style={[styles.settingsGroup, { backgroundColor: cardBgColor }]}>
                    <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
                        <Switch 
                            value={darkMode}
                            onValueChange={setDarkMode}
                            thumbColor={darkMode ? accentColor : '#f4f3f4'}
                            trackColor={{ false: '#767577', true: `${accentColor}80` }}
                        />
                    </View>
                    
                    <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
                        <Switch 
                            value={notifications}
                            onValueChange={setNotifications}
                            thumbColor={notifications ? accentColor : '#f4f3f4'}
                            trackColor={{ false: '#767577', true: `${accentColor}80` }}
                        />
                    </View>
                    
                    <View style={styles.settingItem}>
                        <ThemedText style={styles.settingLabel}>Use Metric Units</ThemedText>
                        <Switch 
                            value={metricUnits}
                            onValueChange={setMetricUnits}
                            thumbColor={metricUnits ? accentColor : '#f4f3f4'}
                            trackColor={{ false: '#767577', true: `${accentColor}80` }}
                        />
                    </View>
                </View>
                
                {/* Account section */}
                <View style={[styles.settingsGroup, { backgroundColor: cardBgColor }]}>
                    <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedText style={styles.settingLabel}>Account</ThemedText>
                        <ThemedText style={styles.settingValue}>{user?.email || 'Not signed in'}</ThemedText>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.settingItem} 
                        onPress={handleLogout}
                    >
                        <ThemedText style={[styles.settingLabel, { color: dangerColor }]}>
                            Log Out
                        </ThemedText>
                    </TouchableOpacity>
                </View>
                
                <ThemedText style={styles.appVersion}>Fitness App v1.0.0</ThemedText>
            </PageContainer>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    settingsGroup: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingValue: {
        fontSize: 16,
        opacity: 0.6,
    },
    appVersion: {
        textAlign: 'center',
        opacity: 0.5,
        fontSize: 14,
    }
});
