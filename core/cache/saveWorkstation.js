import fs from "fs";
import { WORKSTATION_CACHE_FILE } from "./cachePaths.js";

export const saveWorkstation = (data) => {
  if (!data) return;

  const payload = {
    data,
    savedAt: new Date().toISOString(),
    version: "1.0.0",
  };

  fs.writeFileSync(
    WORKSTATION_CACHE_FILE,
    JSON.stringify(payload, null, 2),
    "utf-8",
  );
};
