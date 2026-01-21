import fs from "fs";
import { pubsub } from "./file.resolver.js";
import { runtimeState, updateRuntimeState } from "../../core/runtime/state.js";
import { SESSION_FILE } from "../../core/session/sessionPath.js";

export const runtimeResolver = {
  Query: {
    runtimeState: () => runtimeState,
  },

  Mutation: {
    signOut: () => {
      if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
      }
      updateRuntimeState({
        authenticated: false,
        user: null,
      });
      return runtimeState;
    },
  },

  Subscription: {
    runtimeProjects: {
      subscribe: () => pubsub.asyncIterableIterator("PROJECTS_UPDATED"),
      resolve: (payload) => payload.projects,
    },
    runtimeFiles: {
      subscribe: () => pubsub.asyncIterableIterator("FILES_UPDATED"),
      resolve: (payload) => payload.files,
    },
    runtimeRoutes: {
      subscribe: () => pubsub.asyncIterableIterator("ROUTES_UPDATED"),
      resolve: (payload) => payload.routes,
    },
    runtimeFunctions: {
      subscribe: () => pubsub.asyncIterableIterator("FUNCTIONS_UPDATED"),
      resolve: (payload) => payload.functions,
    },
  },
};
