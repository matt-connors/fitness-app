import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';

interface TabOption {
    id: string;
    label: string;
}

interface TabSwitcherProps {
    tabs: TabOption[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    style?: object;
}

export const TabSwitcher = ({
    tabs,
    activeTab,
    onTabChange,
    style
}: TabSwitcherProps) => {
    const textColor = useThemeColor('text');
    const textColorMuted = useThemeColor('textMuted');
    const textColorSecondary = useThemeColor('textSecondary');
    const subtleContrastBackground = useThemeColor('backgroundSubtleContrast');
    const contrastBackgroundColor = useThemeColor('backgroundContrast');
    const brandBackground = useThemeColor('brand');
    const brandColor = useThemeColor('brandText');

    return (
        <View style={[styles.tabContainer, { backgroundColor: subtleContrastBackground }, style]}>
            {tabs.map(tab => (
                <TouchableOpacity
                    key={tab.id}
                    style={[
                        styles.tabButton,
                        activeTab === tab.id && [styles.activeTabButton, { backgroundColor: brandBackground }]
                    ]}
                    onPress={() => onTabChange(tab.id)}
                >
                    <ThemedText style={[
                        styles.tabText,
                        { color: activeTab === tab.id ? brandColor : textColorSecondary }
                    ]}>
                        {tab.label}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        height: 42,
        borderRadius: 10,
        // backgroundColor: 'rgba(100, 100, 100, 0.1)',
        padding: 5
        // paddingVertical: 4
    },
    tabButton: {
        flex: 1,
        // height: 34,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 0
    },
    activeTabButton: {
        borderBottomWidth: 0,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '400',
    },
}); 