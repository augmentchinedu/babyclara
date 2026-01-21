import { pubsub } from "../../graphql/resolver/file.resolver.js";

export const runtimeState = {
  authenticated: false,
  user: null,
  workstation: null,
  projects: [],
  files: [],
  routes: [],
  functions: [],
  lastUpdated: null,
  source: "cache",
};

export function updateRuntimeState({
  authenticated,
  user,
  workstation,
  projects,
  files,
  routes,
  functions,
  source,
}) {
  if (authenticated !== undefined) runtimeState.authenticated = authenticated;
  if (user !== undefined) runtimeState.user = user;
  if (workstation !== undefined) runtimeState.workstation = workstation;

  if (projects !== undefined) {
    runtimeState.projects = projects;
    pubsub.publish("PROJECTS_UPDATED", { projects });
  }

  if (files !== undefined) {
    runtimeState.files = files;
    pubsub.publish("FILES_UPDATED", { files });
  }

  if (routes !== undefined) {
    runtimeState.routes = routes;
    pubsub.publish("ROUTES_UPDATED", { routes });
  }

  if (functions !== undefined) {
    runtimeState.functions = functions;
    pubsub.publish("FUNCTIONS_UPDATED", { functions });
  }

  if (source !== undefined) runtimeState.source = source;
  runtimeState.lastUpdated = new Date().toISOString();
}
