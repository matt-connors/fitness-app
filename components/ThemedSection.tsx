import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';

import { Section } from './Section';
import { SPACING } from '@/constants/Spacing';
import { StyleProp, ViewStyle } from 'react-native';

export function ThemedSection({ children, style }: { children?: React.ReactNode, style?: StyleProp<ViewStyle> }) {

    const backgroundSubtle = useThemeColor('backgroundSubtleContrast');
    const borderColor = useThemeColor('border');

    return (
        <Section style={{
            backgroundColor: backgroundSubtle,
            paddingHorizontal: SPACING.pageHorizontal,
            borderColor: borderColor,
            // borderWidth: 1,
            borderRadius: 12,
            ...style,
        }}>
            {children}
        </Section>
    );
}



