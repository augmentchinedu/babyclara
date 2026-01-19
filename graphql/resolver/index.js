import { fileResolver } from "./file.resolver.js";
import { userResolver } from "./user.resolver.js";

export const resolver = {
  Query: {
    ...fileResolver.Query,
  },

  Mutation: {
    ...userResolver.Mutation,
  },
};

console.log("Resolvers loaded:", Object.keys(resolver.Mutation));
