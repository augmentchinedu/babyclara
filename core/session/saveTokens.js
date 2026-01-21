import fs from "fs";
import { SESSION_FILE } from "./sessionPath.js";

export const saveTokens = ({ accessToken, refreshToken, user }) => {
  if (!accessToken || !refreshToken) {
    throw new Error("Cannot save session: missing tokens");
  }

  const payload = {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
    },
    savedAt: new Date().toISOString(),
  };

  fs.writeFileSync(SESSION_FILE, JSON.stringify(payload, null, 2), "utf-8");

  return true;
};
