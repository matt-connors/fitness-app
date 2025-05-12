# Authentication Setup Guide

This guide will help you set up Firebase authentication with token-based sessions for your Fitness App.

## Environment Variables Setup

### Important Note About Naming Convention

In Expo applications, environment variables must follow a specific naming convention to be accessible in client-side code:

- All environment variables that need to be accessed in your app code **must** be prefixed with `EXPO_PUBLIC_`
- Variables without this prefix won't be accessible via `process.env` in your JavaScript code

This is a security feature of Expo to help prevent accidentally exposing sensitive variables.

### Using the Setup Script

The easiest way to set up your environment variables is to use the provided setup script:

```bash
npm run setup-env
```

This script will:
1. Create a `.env` file in your project root if it doesn't exist
2. Provide guidance on where to find the required Firebase configuration values
3. Explain the auth gateway endpoints

### Manual Setup

If you prefer to set up your environment manually, create a `.env` file in the root of your project with the following variables:

```
# Firebase configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Auth endpoints
EXPO_PUBLIC_AUTH_LOGIN_URL=https://your-auth-gateway.workers.dev/api/login
EXPO_PUBLIC_AUTH_LOGOUT_URL=https://your-auth-gateway.workers.dev/api/logout
EXPO_PUBLIC_AUTH_SIGNUP_URL=https://your-auth-gateway.workers.dev/api/signup
```

Replace the placeholder values with your actual Firebase project details and authentication gateway URLs.

> **Note:** If you don't have an auth gateway set up, you can leave the auth endpoint variables empty. The app will function using Firebase authentication only, without the extra security features of the backend token exchange.

## Authentication Gateway

The authentication gateway is a Cloudflare Worker that handles Firebase authentication on the server-side and manages session tokens. The gateway code is located in the `fitness-app-auth-gateway` project.

### Deploying the Auth Gateway

1. Navigate to the `fitness-app-auth-gateway` directory
2. Create a `.dev.vars` file with your Firebase Admin SDK credentials:
   ```
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```
3. Run `npm run deploy` to deploy the worker to Cloudflare

## Required Dependencies

Make sure you have the following packages installed:

```
npm install firebase expo-secure-store
```

## Metro Configuration

For Expo SDK 53+, you need to add the following configuration to your `metro.config.js` file to fix Firebase compatibility issues:

```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Allow .cjs files
config.resolver.sourceExts = config.resolver.sourceExts || [];
if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

// Work around stricter package.json "exports" behavior in Metro
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
```

## Authentication Flow

1. **Sign Up**: User creates an account using email and password
2. **Sign In**: User signs in and receives a session token that is stored securely
3. **Auth State**: The app checks for authentication on startup
4. **Sign Out**: User signs out, clearing the session token

## Testing Authentication

To test the authentication flow:

1. Run your app with `npx expo start --clear`
2. Navigate to the Sign Up screen and create an account
3. You should be redirected to the home screen if successful
4. Try signing out and signing back in
5. Test the "Forgot Password" functionality

## Fallback to Firebase-only Authentication

If you encounter issues with the authentication gateway or don't have one set up, the app will gracefully fall back to using Firebase authentication only. You'll see warning messages in the console that look like:

```
Auth gateway URLs are not properly configured. Using Firebase authentication only.
```

or

```
Auth gateway not configured - using Firebase auth only
```

This is normal and allows the app to function even without the backend authentication gateway.

## Troubleshooting

- **Firebase Issues in Expo SDK 53**: The metro.config.js fix above is necessary to avoid the "Component auth has not been registered yet" error
- **Token Storage**: We use expo-secure-store for secure token storage instead of cookies
- **Authentication Headers**: Protected API requests include an Authorization header with the token
- **Worker Deployment**: Verify your Cloudflare Worker is deployed correctly
- **Environment Variables**: Make sure all environment variables are set correctly. If you see "Cannot load an empty url" errors, check that your .env file is properly set up.

## Security Considerations

- Session tokens are stored securely using expo-secure-store
- The auth gateway handles token validation and session management
- Token-based authentication works better in React Native than cookie-based approaches 