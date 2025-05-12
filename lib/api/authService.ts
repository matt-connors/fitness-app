import { auth } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';

// Token storage key
const SESSION_TOKEN_KEY = 'auth_session_token';

// API endpoints from environment variables - using EXPO_PUBLIC_ prefix
const LOGIN_URL = process.env.EXPO_PUBLIC_AUTH_LOGIN_URL || '';
const LOGOUT_URL = process.env.EXPO_PUBLIC_AUTH_LOGOUT_URL || '';
const SIGNUP_URL = process.env.EXPO_PUBLIC_AUTH_SIGNUP_URL || '';

// Check if URLs are configured
const isAuthGatewayConfigured = LOGIN_URL && LOGOUT_URL && SIGNUP_URL;
if (!isAuthGatewayConfigured) {
  console.warn('Auth gateway URLs are not properly configured. Using Firebase authentication only.');
  console.warn('LOGIN_URL:', LOGIN_URL);
  console.warn('LOGOUT_URL:', LOGOUT_URL);
  console.warn('SIGNUP_URL:', SIGNUP_URL);
}

// Save the session token to secure storage
const saveSessionToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
};

// Get the session token from secure storage
export const getSessionToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
};

// Clear the session token from secure storage
const clearSessionToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
};

// Create a new user with Firebase and register with the backend
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    // Create user with Firebase client SDK
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // If auth gateway is not configured, skip backend registration
    if (!isAuthGatewayConfigured || !SIGNUP_URL) {
      console.log('Auth gateway not configured - using Firebase auth only');
      return userCredential.user;
    }
    
    // Get the ID token for authentication
    const idToken = await userCredential.user.getIdToken();
    
    try {
      // Register user with backend
      const response = await fetch(SIGNUP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Backend registration failed:', errorData.error);
        // Continue with Firebase auth even if backend registration fails
      } else {
        // Extract the session token from the response
        const data = await response.json();
        if (data.sessionToken) {
          await saveSessionToken(data.sessionToken);
        }
      }
    } catch (error) {
      // Log the error but don't fail the sign-up process
      console.warn('Backend registration error:', error);
      // Continue with Firebase auth even if backend registration fails
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in with Firebase and get session token
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    // Sign in with Firebase client SDK
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // If auth gateway is not configured, skip session token exchange
    if (!isAuthGatewayConfigured || !LOGIN_URL) {
      console.log('Auth gateway not configured - using Firebase auth only');
      return userCredential.user;
    }
    
    // Get ID token to exchange for session token
    const idToken = await userCredential.user.getIdToken();
    
    try {
      // Exchange ID token for session token
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Session token exchange failed:', errorData.error);
        // Continue with Firebase auth even if token exchange fails
      } else {
        // Get the session token from the response
        const data = await response.json();
        if (data.sessionToken) {
          await saveSessionToken(data.sessionToken);
        }
      }
    } catch (error) {
      // Log the error but don't fail the sign-in process
      console.warn('Session token exchange error:', error);
      // Continue with Firebase auth even if token exchange fails
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out from Firebase and clear session token
export const signOut = async (): Promise<void> => {
  try {
    // Sign out from Firebase
    await firebaseSignOut(auth);
    
    // Skip token exchange if auth gateway is not configured
    if (!isAuthGatewayConfigured || !LOGOUT_URL) {
      await clearSessionToken();
      return;
    }
    
    // Get the current session token (if any)
    const sessionToken = await getSessionToken();
    
    if (sessionToken) {
      try {
        // Clear session token from backend
        await fetch(LOGOUT_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });
      } catch (error) {
        // Log the error but don't fail the sign-out process
        console.warn('Logout token exchange error:', error);
      }
    }
    
    // Clear session token from secure storage
    await clearSessionToken();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Check authentication status
export const checkAuthStatus = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      
      if (user) {
        // If we have a user but need to check session token validity
        if (isAuthGatewayConfigured) {
          const sessionToken = await getSessionToken();
          if (!sessionToken) {
            // No session token, but we're still logged in with Firebase
            console.log('No session token found. Using Firebase auth only');
          }
        }
      }
      
      resolve(user);
    });
  });
}; 