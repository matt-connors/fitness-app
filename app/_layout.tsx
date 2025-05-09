import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, ErrorBoundary } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ActiveWorkoutProvider } from '@/components/ActiveWorkoutProvider';
import { GraphQLProvider } from '@/lib/graphql/client';

export { ErrorBoundary };

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    // Use the DefaultTheme/DarkTheme from React Navigation which includes the fonts property
    const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    
    // Merge our custom colors with the base theme
    const theme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            ...(colorScheme === 'dark' ? Colors.dark : Colors.light),
        },
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GraphQLProvider>
                <ThemeProvider value={theme}>
                    <ActiveWorkoutProvider>
                        <Stack>
                            {/* 
                                Note: The (tabs) route has its own ActiveWorkoutProvider
                                This allows standalone screens to still access context
                            */}
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="create-workout" options={{ headerShown: false }} />
                            <Stack.Screen name="create-routine" options={{ headerShown: false }} />
                            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                        </Stack>
                        <StatusBar style="auto" />
                    </ActiveWorkoutProvider>
                </ThemeProvider>
            </GraphQLProvider>
        </GestureHandlerRootView>
    );
}
