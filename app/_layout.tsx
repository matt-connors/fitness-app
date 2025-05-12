import React, { useEffect, ReactNode, FC } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, ErrorBoundary } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ActiveWorkoutProvider } from '@/components/ActiveWorkoutProvider';
import { GraphQLProvider } from '@/lib/graphql/client';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider, useTheme } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'expo-router';

export { ErrorBoundary };

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Auth guard component to protect routes
const AuthGuard: FC<{ children: ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Check if the current route is in the auth group
        const authRoutes = ['/login', '/signup', '/forgot-password'];
        const isAuthRoute = authRoutes.includes(pathname);

        if (!user && !isAuthRoute) {
            // Redirect to login if user is not authenticated and not in auth route
            router.replace('/login');
        } else if (user && isAuthRoute) {
            // Redirect to home if user is authenticated but in auth route
            router.replace('/');
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        // You could return a loading screen here
        return null;
    }

    return <>{children}</>;
};

// StatusBar component that uses the theme context
function ThemedStatusBar() {
    const { isDarkMode } = useTheme();
    return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

// Navigation theme component that uses the theme context
function ThemedNavigation({ children }: { children: React.ReactNode }) {
    const { isDarkMode } = useTheme();
    
    // Use the DefaultTheme/DarkTheme from React Navigation
    const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;
    
    // Merge our custom colors with the base theme
    const theme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            ...(isDarkMode ? Colors.dark : Colors.light),
        },
    };

    return (
        <NavigationThemeProvider value={theme}>
            {children}
        </NavigationThemeProvider>
    );
}

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
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <AuthProvider>
                    <GraphQLProvider>
                        <ThemedNavigation>
                            <ActiveWorkoutProvider>
                                <AuthGuard>
                                    <Stack>
                                        {/* 
                                            Note: The (tabs) route has its own ActiveWorkoutProvider
                                            This allows standalone screens to still access context
                                        */}
                                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                        <Stack.Screen name="create-workout" options={{ headerShown: false }} />
                                        <Stack.Screen name="create-routine" options={{ headerShown: false }} />
                                        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                                        
                                        {/* Auth screens */}
                                        <Stack.Screen name="login" options={{ headerShown: false }} />
                                        <Stack.Screen name="signup" options={{ headerShown: true, title: 'Create Account' }} />
                                        <Stack.Screen name="forgot-password" options={{ headerShown: true, title: 'Reset Password' }} />
                                    </Stack>
                                    <ThemedStatusBar />
                                </AuthGuard>
                            </ActiveWorkoutProvider>
                        </ThemedNavigation>
                    </GraphQLProvider>
                </AuthProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
