/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
    light: {
        text: '#11181C',
        textSecondary: '#687076',
        textContrast: '#eee',
        background: '#fff',
        backgroundSubtleContrast: '#f5f5f5',
        border: '#DBE0E7',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        brand: '#3A84E8',

        primary: 'rgb(10, 132, 255)',
        card: 'rgb(18, 18, 18)',
        notification: 'rgb(255, 69, 58)',
    },
    dark: {
        text: '#fff',
        textSecondary: '#b3b3b3',
        textContrast: '#111',
        background: '#151718',
        backgroundSubtleContrast: '#252728',
        border: '#252728',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
        brand: '#3A84E8',

        primary: 'rgb(10, 132, 255)',
        card: 'rgb(18, 18, 18)',
        notification: 'rgb(255, 69, 58)',
    },
    
};
