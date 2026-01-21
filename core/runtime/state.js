export const runtimeState = {
  authenticated: false,
  user: null,
  workstation: null,
  projects: [],
  lastUpdated: null,
  source: "cache",
};

export function updateRuntimeState({
  authenticated,
  user,
  workstation,
  projects,
  source,
}) {
  if (authenticated !== undefined) runtimeState.authenticated = authenticated;
  if (user !== undefined) runtimeState.user = user;
  if (workstation !== undefined) runtimeState.workstation = workstation;
  if (projects !== undefined) runtimeState.projects = projects;
  if (source !== undefined) runtimeState.source = source;
  runtimeState.lastUpdated = new Date().toISOString();
}
