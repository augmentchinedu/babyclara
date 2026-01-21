import { getWorkstation } from "./getWorkstation.js";
import { getProjects } from "./getProjects.js";
import { saveWorkstation } from "../cache/saveWorkstation.js";
import { loadWorkstation } from "../cache/loadWorkstation.js";
import { saveProjects } from "../cache/saveProjects.js";
import { loadProjects } from "../cache/loadProjects.js";
import { updateRuntimeState } from "./state.js";
import path from "path";
import { pathToFileURL } from "url";

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export async function bootstrapAfterAuth(userId, token) {
  if (!userId || !token) {
    console.error("❌ Cannot bootstrap: Missing userId or token");
    return;
  }

  try {
    // 1. Get workstation name from local config
    const configPath = path.join(process.cwd(), "babyclara.config.js");
    const { default: config } = await import(pathToFileURL(configPath).href);
    const workstationName = config.name;

    // 2. Resolve Workstation
    let workstation = null;
    const cachedWorkstation = loadWorkstation();

    if (
      cachedWorkstation?.data &&
      cachedWorkstation.data.name === workstationName &&
      cachedWorkstation.data.owner?.id === userId
    ) {
      console.log(`✅ Using cached workstation: ${workstationName}`);
      workstation = cachedWorkstation.data;
    } else {
      console.log(`🔍 Fetching workstation "${workstationName}" from TGU...`);
      workstation = await getWorkstation(workstationName, token);
      if (workstation) {
        if (workstation.owner?.id !== userId) {
          console.warn("⚠️ Ownership mismatch for workstation.");
          return;
        }
        saveWorkstation(workstation);
      }
    }

    if (!workstation) {
      console.warn("⚠️ Bootstrap halted: Workstation not resolved.");
      return;
    }

    // 3. Resolve Projects
    let projects = [];
    const cachedProjects = loadProjects();
    const now = Date.now();
    const isStale =
      cachedProjects &&
      now - new Date(cachedProjects.savedAt).getTime() > STALE_TIME_MS;

    if (cachedProjects?.data && !isStale) {
      console.log(
        `✅ Using cached projects (${cachedProjects.data.length} found)`,
      );
      projects = cachedProjects.data;
    } else {
      console.log(`🔍 Fetching projects for workstation ${workstation.id}...`);
      projects = await getProjects(workstation.id, token);
      if (projects) {
        saveProjects(projects);
      }
    }

    updateRuntimeState({ workstation, projects });
    console.log(`🚀 Bootstrap complete. ${projects.length} projects ready.`);
    return { workstation, projects };
  } catch (err) {
    console.error("❌ Bootstrap failed:", err.message);
  }
}
