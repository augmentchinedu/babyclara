import fs from "fs";
import { PROJECTS_CACHE_FILE } from "./cachePaths.js";

export const loadProjects = () => {
  if (!fs.existsSync(PROJECTS_CACHE_FILE)) return null;

  try {
    const content = fs.readFileSync(PROJECTS_CACHE_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
};
