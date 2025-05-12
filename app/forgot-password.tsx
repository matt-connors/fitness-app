import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase/config';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';

// Error type for Firebase auth errors
interface FirebaseAuthError extends Error {
  code?: string;
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get theme colors
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');
  const inputBgColor = useThemeColor('backgroundSubtleContrast');
  const brandColor = useThemeColor('brand');
  const brandTextColor = useThemeColor('brandText');
  const textSecondaryColor = useThemeColor('textSecondary');

  // Handle password reset
  const handleResetPassword = async () => {
    // Validate email
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      // Handle specific Firebase error codes
      let errorMessage = 'Password reset failed. Please try again.';
      
      const authError = error as FirebaseAuthError;
      if (authError.code) {
        switch (authError.code) {
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account exists with this email address.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            errorMessage = authError.message || errorMessage;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen options={{ 
        title: 'Reset Password',
        headerShown: true
      }} />

      <View style={styles.contentContainer}>
        <ThemedText style={styles.headerText}>Forgot Your Password?</ThemedText>
        <ThemedText style={[styles.subHeaderText, { color: textSecondaryColor }]}>
          Enter your email address and we'll send you instructions to reset your password.
        </ThemedText>

        <TextInput
          style={[styles.input, { borderColor, backgroundColor: inputBgColor, color: textColor }]}
          placeholder="Email"
          placeholderTextColor={textSecondaryColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
        />

        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: brandColor }]} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={brandTextColor} />
          ) : (
            <ThemedText style={[styles.resetButtonText, { color: brandTextColor }]}>Send Reset Instructions</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.backButtonText, { color: brandTextColor }]}>Back to Login</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 32,
  },
  subHeaderText: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 22,
  },
  resetButton: {
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
  resetButtonText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
}); 