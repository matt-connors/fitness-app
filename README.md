# Fitness App

A React Native / Expo application for fitness tracking and workout management.

## Setup

### Prerequisites

- Node.js (LTS version recommended)
- Yarn or npm
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Copy the environment example file:

```bash
cp .env.example .env
```

4. Edit the `.env` file to match your environment settings

### Environment Configuration

The app uses different API endpoints based on the environment:

- **Development**: Uses http://127.0.0.1:8787 by default (configurable in `.env`)
- **Staging**: Uses https://staging-api.fitness-app.com
- **Production**: Uses https://api.fitness-app.com

To change the environment, set the following in your `.env` file:

```
EXPO_PUBLIC_API_ENV=development  # or staging or production
```

You can also override the API URL directly:

```
EXPO_PUBLIC_API_URL=http://your-custom-api.com
```

### Running the App

```bash
npx expo start
```

## GraphQL Integration

The app uses urql as the GraphQL client. GraphQL queries and mutations are defined in:

- `lib/graphql/queries.ts`
- `lib/graphql/mutations.ts`

Data types are defined in `lib/graphql/types.ts`.

### Adding New Queries/Mutations

1. Define your GraphQL operation in the appropriate file
2. Update the types if necessary
3. Import and use the query/mutation in your component

Example usage:

```tsx
import { useQuery } from 'urql';
import { GET_USER_ROUTINES } from '@/lib/graphql/queries';

// In your component:
const [result, reexecuteQuery] = useQuery({
  query: GET_USER_ROUTINES,
  variables: { userId: 1 },
});
const { data, fetching, error } = result;
```

### Troubleshooting GraphQL Issues

If you encounter GraphQL errors such as "Cannot read property 'queryType' of undefined," try the following:

1. Verify that your GraphQL endpoint is running and accessible
2. Make sure your `.env` file has the correct API URL settings
3. The cacheExchange configuration might need adjustment based on your schema
4. For debugging, you can temporarily simplify the client setup by using minimal exchanges:

```tsx
// Simple client setup for debugging
const client = createClient({
  url: environment.graphqlUrl,
  exchanges: [
    cacheExchange(),
    fetchExchange,
  ],
});
```

## Features

- Routine Library
- Workout Creation
- Exercise Database
- Progress Tracking

## Working With the Codebase

In order to efficiently, build, test, manage, and update the app, Expo is used in compliment with React Native. Since IOS development on Windows is not reasonably feasible (by Apple's intentions), Expo EAS is used for building the app in the cloud and deploying to the App store.

### Local Development

Run `npx expo start` to start a local development server that automatically listens for changes. Press the `s` key to switch to Expo Go (the app) in order to preview the app on a physical device.
* This local development server has other options for running locally in a browser and on Android devices.

## Folder Structure

- `app/`: Application screens using Expo Router
- `components/`: Reusable UI components
- `constants/`: Global constants and theme
- `hooks/`: Custom React hooks
- `lib/`: Utility functions, GraphQL setup, and configuration
- `assets/`: Static assets like images and fonts