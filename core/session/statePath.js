import path from "path";
import fs from "fs";

const dir = path.resolve(process.cwd(), ".babyclara");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const STATE_FILE = path.join(dir, "state.json");
