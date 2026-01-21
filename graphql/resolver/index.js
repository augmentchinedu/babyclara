import { fileResolver } from "./file.resolver.js";
import { userResolver } from "./user.resolver.js";

export const resolver = {
  Query: {
    ...userResolver.Query,
    ...fileResolver.Query,
  },

  Mutation: {
    ...userResolver.Mutation,
  },

  Subscription: {
    ...fileResolver.Subscription,
  },
};

console.log("Resolvers loaded:", Object.keys(resolver.Mutation));
