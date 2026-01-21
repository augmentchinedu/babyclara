import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { saveTokens } from "../core/session/saveTokens.js";
import { loadTokens } from "../core/session/loadTokens.js";
import { SESSION_FILE } from "../core/session/sessionPath.js";

describe("Session Persistence Utilities", () => {
  const mockTokens = {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
  };

  beforeEach(() => {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  });

  afterEach(() => {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  });

  it("should save tokens to the session file", () => {
    saveTokens(mockTokens);
    expect(fs.existsSync(SESSION_FILE)).toBe(true);

    const content = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
    expect(content.accessToken).toBe(mockTokens.accessToken);
    expect(content.refreshToken).toBe(mockTokens.refreshToken);
    expect(content.savedAt).toBeDefined();
  });

  it("should throw error if tokens are missing during save", () => {
    expect(() => saveTokens({})).toThrow("Cannot save session: missing tokens");
  });

  it("should load tokens from the session file", () => {
    saveTokens(mockTokens);
    const loaded = loadTokens();
    expect(loaded.accessToken).toBe(mockTokens.accessToken);
    expect(loaded.refreshToken).toBe(mockTokens.refreshToken);
  });

  it("should return null if session file does not exist", () => {
    const loaded = loadTokens();
    expect(loaded).toBeNull();
  });

  it("should return null if session file is corrupted", () => {
    fs.writeFileSync(SESSION_FILE, "invalid-json");
    const loaded = loadTokens();
    expect(loaded).toBeNull();
  });
});
