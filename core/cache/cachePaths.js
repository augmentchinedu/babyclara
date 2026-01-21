import path from "path";
import fs from "fs";

const dir = path.resolve(process.cwd(), ".babyclara");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const WORKSTATION_CACHE_FILE = path.join(dir, "workstation.json");
export const PROJECTS_CACHE_FILE = path.join(dir, "projects.json");
