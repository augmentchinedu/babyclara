import { tguRequest, GET_PROJECTS } from "../../graphql/service/tguService.js";

/**
 * Fetches projects associated with a workstation ID.
 */
export async function getProjects(workstationId, token) {
  if (!workstationId) {
    throw new Error("Workstation ID is required to fetch projects");
  }

  try {
    const data = await tguRequest(GET_PROJECTS, { workstationId }, token);

    if (data?.error) {
      throw new Error(`TGU Error: ${data.error.message}`);
    }

    if (!data?.projects) {
      return [];
    }

    return data.projects;
  } catch (err) {
    console.error(
      `❌ Failed to fetch projects for workstation "${workstationId}":`,
      err.message,
    );
    return [];
  }
}
