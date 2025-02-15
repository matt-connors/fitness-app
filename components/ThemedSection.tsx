import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';

import { Section } from './Section';

export function ThemedSection({ children }: { children?: React.ReactNode }) {

    const backgroundSubtle = useThemeColor('backgroundSubtleContrast');

    return (
        <Section style={{ backgroundColor: backgroundSubtle }}>
            {children}
        </Section>
    );
}



