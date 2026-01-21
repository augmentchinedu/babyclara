import fs from "fs";
import { SESSION_FILE } from "./sessionPath.js";

export const loadTokens = () => {
  if (!fs.existsSync(SESSION_FILE)) return null;

  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
  } catch {
    return null;
  }
};
