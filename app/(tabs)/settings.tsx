import { StyleSheet, View, Switch, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StandardHeader } from '@/components/ui/StandardHeader';
import React, { useEffect } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';
import { PageContainer } from '@/components/PageContainer';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../../lib/context/ThemeContext';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export default function SettingsScreen() {
    const accentColor = useThemeColor('brand');
    const brandTextColor = useThemeColor('brandText');
    const borderColor = useThemeColor('border');
    const cardBgColor = useThemeColor('backgroundSubtleContrast');
    const contrastColor = useThemeColor('backgroundContrast');
    const dangerColor = '#ff3b30';
    
    // Get theme context
    const { themeMode, setThemeMode, isDarkMode } = useTheme();
    
    // Get system color scheme for displaying the "Default" text
    const systemColorScheme = useSystemColorScheme();
    
    // Handle dark mode toggle
    const handleDarkModeToggle = () => {
        // If currently system or light, set to dark
        // If currently dark, set to light
        const newMode = isDarkMode ? 'light' : 'dark';
        setThemeMode(newMode);
    };
    
    // Handle system default toggle
    const handleUseSystemDefault = () => {
        setThemeMode('system');
    };

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
                {/* Theme settings */}
                <View style={[styles.settingsGroup, { backgroundColor: cardBgColor }]}>
                    <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
                        <Switch 
                            value={isDarkMode}
                            onValueChange={handleDarkModeToggle}
                            thumbColor={isDarkMode ? brandTextColor : '#f4f3f4'}
                            trackColor={{ false: contrastColor, true: accentColor }}
                        />
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.settingItem}
                        onPress={handleUseSystemDefault}
                    >
                        <ThemedText style={styles.settingLabel}>Use System Default</ThemedText>
                        <ThemedText style={[styles.settingValue, themeMode !== 'system' && styles.inactive]}>
                            {themeMode === 'system' ? 'On' : 'Off'} 
                            {themeMode === 'system' && ` (${systemColorScheme === 'dark' ? 'Dark' : 'Light'})`}
                        </ThemedText>
                    </TouchableOpacity>
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
        marginTop: 24,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        // borderBottomWidth: StyleSheet.hairlineWidth,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '400',
    },
    settingValue: {
        fontSize: 16,
        opacity: 0.6,
    },
    inactive: {
        opacity: 0.4,
    },
    appVersion: {
        textAlign: 'center',
        opacity: 0.5,
        fontSize: 14,
        marginTop: 24,
    }
});
