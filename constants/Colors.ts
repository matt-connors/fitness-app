/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
    light: {
        text: '#fff',
        textSecondary: '#9A9A9A',
        textContrast: '#eee',
        background: '#fff',
        backgroundSubtleContrast: '#f5f5f5',
        backgroundContrast: '#ddd',
        border: '#DBE0E7',
        borderStronger: '#C0C6CC',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        brand: '#3A84E8',
        brandText: '#fff',
        textMuted: '#929292',

        primary: '#143462',
        card: 'rgb(18, 18, 18)',
        notification: 'rgb(255, 69, 58)',
    },
    dark: {
        text: '#fff',
        textSecondary: '#868686',
        textContrast: '#111',
        background: '#121212',
        backgroundSubtleContrast: '#1c1c1c',
        backgroundContrast: '#313131',
        border: '#252728',
        borderStronger: '#323536',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
        brand: '#143462',
        brandText: '#3A82F7',
        textMuted: '#a0a0a6',

        primary: '#4693ff', // ignore this
        card: 'rgb(18, 18, 18)',
        notification: 'rgb(255, 69, 58)',
    },
    
};
