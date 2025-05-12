import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signUp, loading, error } = useAuth();
  const router = useRouter();

  // Get theme colors
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');
  const inputBgColor = useThemeColor('backgroundSubtleContrast');
  const brandColor = useThemeColor('brand');
  const brandTextColor = useThemeColor('brandText');
  const textSecondaryColor = useThemeColor('textSecondary');

  // Handle signup
  const handleSignup = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Required Fields', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters');
      return;
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await signUp(email, password, name);
      router.replace('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      Alert.alert('Signup Error', errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen options={{ 
        title: 'Create Account',
        headerShown: true
      }} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerText}>Create an Account</ThemedText>
          <ThemedText style={[styles.subHeaderText, { color: textSecondaryColor }]}>Join our fitness community</ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { borderColor, backgroundColor: inputBgColor }]}
            placeholder="Full Name"
            placeholderTextColor={textSecondaryColor}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
          />

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
              returnKeyType="next"
            />
            <TouchableOpacity 
              style={styles.visibilityToggle} 
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <ThemedText style={{ opacity: 0.7 }}>{isPasswordVisible ? 'Hide' : 'Show'}</ThemedText>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { borderColor, backgroundColor: inputBgColor }]}
            placeholder="Confirm Password"
            placeholderTextColor={textSecondaryColor}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isPasswordVisible}
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity 
          style={[styles.signupButton, { backgroundColor: brandColor }]} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={brandTextColor} />
          ) : (
            <ThemedText style={[styles.signupButtonText, { color: brandTextColor }]}>Create Account</ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/login' as any)}>
            <ThemedText style={[styles.loginButtonText, { color: brandTextColor }]}>Log In</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '400',
    marginBottom: 8,
    lineHeight: 34,
  },
  subHeaderText: {
    fontSize: 16,
    lineHeight: 22,
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
    marginBottom: 16,
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
  signupButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
}); 