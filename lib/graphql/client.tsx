import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { ReactNode } from 'react';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Create HTTP link with timeout
const httpLink = createHttpLink({
  uri: 'https://fitness-app-graphql.matt-f33.workers.dev/graphql',
  fetchOptions: {
    timeout: 15000, // 15 second timeout
  },
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

// Create the Apollo client with optimized configuration
export const client = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          userRoutines: {
            // Smart merge function for better cache handling
            merge(existing = { routines: [], totalCount: 0, hasMore: false }, incoming) {
              return incoming;
            },
          },
        },
      },
      Routine: {
        // Define unique identifiers for routine objects
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      // Get data from cache first, then network
      fetchPolicy: 'cache-and-network',
      // Use cache for subsequent requests until data changes
      nextFetchPolicy: 'cache-first',
      // Track network status for better loading states
      notifyOnNetworkStatusChange: true,
    },
    query: {
      // Balance between freshness and performance
      fetchPolicy: 'cache-first',
      // Continue showing data with errors rather than failing
      errorPolicy: 'all',
    },
    mutate: {
      // Refresh queries after mutations
      refetchQueries: 'active',
      awaitRefetchQueries: false,
    },
  },
  // Add query deduplication to avoid repeated identical requests
  queryDeduplication: true,
});

// Create a provider component for the app
interface GraphQLProviderProps {
  children: ReactNode;
}

export const GraphQLProvider = ({ children }: GraphQLProviderProps) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}; 