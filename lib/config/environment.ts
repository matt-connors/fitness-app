// Environment URL configuration
// This file centralizes all environment-specific URLs and configuration

// Determine the current environment
const ENV = {
  dev: {
    name: 'development',
    apiUrl: 'https://fitness-app-graphql.matt-f33.workers.dev/',
    graphqlUrl: 'https://fitness-app-graphql.matt-f33.workers.dev/graphql',
  },
  staging: {
    name: 'staging',
    apiUrl: 'https://staging-api.fitness-app.com',
    graphqlUrl: 'https://staging-api.fitness-app.com/graphql',
  },
  prod: {
    name: 'production',
    apiUrl: 'https://api.fitness-app.com',
    graphqlUrl: 'https://api.fitness-app.com/graphql',
  }
};

// You can add logic here to detect environment based on bundling, env vars, etc.
// For now, we'll default to development in development and production in production
let environment = __DEV__ ? ENV.dev : ENV.prod;

// Override environment for testing
if (process.env.EXPO_PUBLIC_API_ENV === 'staging') {
  environment = ENV.dev;
} else if (process.env.EXPO_PUBLIC_API_ENV === 'production') {
  environment = ENV.dev;
} else if (process.env.EXPO_PUBLIC_API_ENV === 'development') {
  environment = ENV.dev;
}

// Optionally, allow custom API URL override through env var
if (process.env.EXPO_PUBLIC_API_URL) {
  environment.apiUrl = process.env.EXPO_PUBLIC_API_URL;
  environment.graphqlUrl = `${process.env.EXPO_PUBLIC_API_URL}/graphql`;
}

// Export the current environment
export default environment; 