import fs from "fs";
import { WORKSTATION_CACHE_FILE } from "./cachePaths.js";

export const loadWorkstation = () => {
  if (!fs.existsSync(WORKSTATION_CACHE_FILE)) return null;

  try {
    const content = fs.readFileSync(WORKSTATION_CACHE_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
};
