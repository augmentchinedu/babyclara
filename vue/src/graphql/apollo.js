// apollo.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: "/graphql" }),
  cache: new InMemoryCache(),
});
