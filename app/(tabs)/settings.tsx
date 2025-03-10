import { StyleSheet, View, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StandardHeader } from '@/components/ui/StandardHeader';
import React, { useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { PageContainer } from '@/components/PageContainer';

export default function SettingsScreen() {
    const accentColor = useThemeColor('brand');
    const borderColor = useThemeColor('border');
    const cardBgColor = useThemeColor('backgroundSubtleContrast');
    
    // Example settings state
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [metricUnits, setMetricUnits] = useState(true);

    return (
        <ThemedView style={styles.screen}>
            <StandardHeader title="Settings" />
            
            <PageContainer hasHeader={true}>
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
    appVersion: {
        textAlign: 'center',
        opacity: 0.5,
        fontSize: 14,
    }
});
