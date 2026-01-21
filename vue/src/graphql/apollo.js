import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from "@apollo/client/core";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: "/graphql",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/graphql`,
  }),
);

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink,
);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
