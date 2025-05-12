import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signIn, loading, error } = useAuth();
  const router = useRouter();

  // Get theme colors
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');
  const inputBgColor = useThemeColor('backgroundSubtleContrast');
  const brandColor = useThemeColor('brand');
  const brandTextColor = useThemeColor('brandText');
  const textSecondaryColor = useThemeColor('textSecondary');

  // Handle login
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter both email and password');
      return;
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await signIn(email, password);
      router.replace('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login Error', errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen options={{ 
        title: 'Login',
        headerShown: false
      }} />

      <View style={styles.logoContainer}>
        <ThemedText style={styles.appName}>Fitness App</ThemedText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { borderColor, backgroundColor: inputBgColor }]}
          placeholder="Email"
          placeholderTextColor={textSecondaryColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <View style={[styles.passwordContainer, { borderColor, backgroundColor: inputBgColor }]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={textSecondaryColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.visibilityToggle} 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <ThemedText style={{ opacity: 0.7 }}>{isPasswordVisible ? 'Hide' : 'Show'}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.loginButton, { backgroundColor: brandColor }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={brandTextColor} />
        ) : (
          <ThemedText style={[styles.loginButtonText, { color: brandTextColor }]}>Log In</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPasswordButton}
        onPress={() => router.push('/forgot-password' as any)}
      >
        <ThemedText style={[styles.forgotPasswordText, { color: brandTextColor }]}>Forgot Password?</ThemedText>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <ThemedText style={styles.signupText}>Don't have an account? </ThemedText>
        <TouchableOpacity onPress={() => router.push('/signup' as any)}>
          <ThemedText style={[styles.signupButtonText, { color: brandTextColor }]}>Sign Up</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  visibilityToggle: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
    lineHeight: 20,
  },
  signupButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
}); 