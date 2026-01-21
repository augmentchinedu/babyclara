export const runtimeState = {
  workstation: null,
  projects: [],
  lastUpdated: null,
};

export function updateRuntimeState({ workstation, projects }) {
  if (workstation) runtimeState.workstation = workstation;
  if (projects) runtimeState.projects = projects;
  runtimeState.lastUpdated = new Date().toISOString();
}
