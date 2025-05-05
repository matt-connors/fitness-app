import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';

// Create the Apollo client with simplified configuration
export const client = new ApolloClient({
  uri: 'https://fitness-app-graphql.matt-f33.workers.dev/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          userRoutines: {
            // Merge function for paginated data
            merge(existing = { routines: [] }, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

// Create a provider component for the app
interface GraphQLProviderProps {
  children: ReactNode;
}

export const GraphQLProvider = ({ children }: GraphQLProviderProps) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}; 