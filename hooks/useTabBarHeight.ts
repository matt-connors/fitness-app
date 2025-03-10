import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '@/constants/Spacing';

const TAB_BAR_HEIGHT = SPACING.navHeight; // Constant height across platforms

export function useTabBarHeight(extraPadding: number = 0) {
    const insets = useSafeAreaInsets();
    return {
        height: TAB_BAR_HEIGHT + extraPadding,
        bottomInset: Platform.OS === 'ios' ? insets.bottom - 5 : 0
    };
} 