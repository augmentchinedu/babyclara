import {
  tguRequest,
  GET_WORKSTATION,
} from "../../graphql/service/tguService.js";

/**
 * Fetches workstation details by name from TGU.
 * Verifies that the authenticated user owns the workstation.
 */
export async function getWorkstation(workstationName, token) {
  if (!workstationName) {
    throw new Error("Workstation name is required");
  }

  try {
    const data = await tguRequest(
      GET_WORKSTATION,
      { name: workstationName },
      token,
    );

    if (data?.error) {
      throw new Error(`TGU Error: ${data.error.message}`);
    }

    if (!data?.workstation) {
      console.warn(`⚠️ Workstation "${workstationName}" not found on TGU.`);
      return null;
    }

    return data.workstation;
  } catch (err) {
    console.error(
      `❌ Failed to fetch workstation "${workstationName}":`,
      err.message,
    );
    return null;
  }
}
