// apollo.js
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client/core";

const logLink = new ApolloLink((operation, forward) => {
  console.log("🚀 Apollo operation:", operation.operationName);
  console.log(operation.query.loc?.source.body);
  console.log("Variables:", operation.variables);
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: logLink.concat(new HttpLink({ uri: "/graphql" })),
  cache: new InMemoryCache(),
});
