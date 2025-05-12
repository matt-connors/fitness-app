const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default .env template
const defaultEnvContent = `# Firebase configuration
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Auth endpoints
EXPO_PUBLIC_AUTH_LOGIN_URL=
EXPO_PUBLIC_AUTH_LOGOUT_URL=
EXPO_PUBLIC_AUTH_SIGNUP_URL=`;

// Path to .env file
const envPath = path.resolve(__dirname, '../.env');

// Check if .env file exists
const checkEnvFile = () => {
  if (fs.existsSync(envPath)) {
    rl.question('An existing .env file was found. Do you want to overwrite it? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        createEnvFile();
      } else {
        console.log('Setup cancelled. Your existing .env file remains unchanged.');
        rl.close();
      }
    });
  } else {
    createEnvFile();
  }
};

// Create .env file
const createEnvFile = () => {
  fs.writeFileSync(envPath, defaultEnvContent);
  console.log('\n.env file created successfully at:', envPath);
  console.log('\nPlease fill in the values in the .env file with your Firebase configuration and auth endpoints.');
  console.log('\nFor Firebase configuration:');
  console.log('1. Go to the Firebase console (https://console.firebase.google.com/)');
  console.log('2. Select your project');
  console.log('3. Click on the gear icon and select "Project settings"');
  console.log('4. Under "Your apps", find your app configuration');
  
  console.log('\nFor auth endpoints, use the URLs of your deployed auth gateway:');
  console.log('- EXPO_PUBLIC_AUTH_LOGIN_URL: https://your-auth-gateway.workers.dev/api/login');
  console.log('- EXPO_PUBLIC_AUTH_LOGOUT_URL: https://your-auth-gateway.workers.dev/api/logout');
  console.log('- EXPO_PUBLIC_AUTH_SIGNUP_URL: https://your-auth-gateway.workers.dev/api/signup');
  
  console.log('\nIf you don\'t have an auth gateway set up, you can leave these values empty.');
  console.log('The app will use Firebase authentication only.');
  console.log('\nNOTE: All environment variables must have the EXPO_PUBLIC_ prefix to be accessible in client code.');
  
  rl.close();
};

// Start the setup
console.log('🔒 Setting up environment variables for Firebase Authentication');
checkEnvFile();

rl.on('close', () => {
  console.log('\nSetup complete!');
}); 