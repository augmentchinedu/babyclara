import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { saveWorkstation } from "../core/cache/saveWorkstation.js";
import { loadWorkstation } from "../core/cache/loadWorkstation.js";
import { saveProjects } from "../core/cache/saveProjects.js";
import { loadProjects } from "../core/cache/loadProjects.js";
import {
  WORKSTATION_CACHE_FILE,
  PROJECTS_CACHE_FILE,
} from "../core/cache/cachePaths.js";

describe("Runtime Cache Utilities", () => {
  beforeEach(() => {
    if (fs.existsSync(WORKSTATION_CACHE_FILE))
      fs.unlinkSync(WORKSTATION_CACHE_FILE);
    if (fs.existsSync(PROJECTS_CACHE_FILE)) fs.unlinkSync(PROJECTS_CACHE_FILE);
  });

  afterEach(() => {
    if (fs.existsSync(WORKSTATION_CACHE_FILE))
      fs.unlinkSync(WORKSTATION_CACHE_FILE);
    if (fs.existsSync(PROJECTS_CACHE_FILE)) fs.unlinkSync(PROJECTS_CACHE_FILE);
  });

  it("should save and load workstation cache", () => {
    const data = { id: "ws1", name: "test-ws" };
    saveWorkstation(data);

    const loaded = loadWorkstation();
    expect(loaded.data).toEqual(data);
    expect(loaded.savedAt).toBeDefined();
  });

  it("should save and load projects cache", () => {
    const data = [{ id: "p1", name: "proj1" }];
    saveProjects(data);

    const loaded = loadProjects();
    expect(loaded.data).toEqual(data);
    expect(loaded.savedAt).toBeDefined();
  });

  it("should return null for non-existent cache", () => {
    expect(loadWorkstation()).toBeNull();
    expect(loadProjects()).toBeNull();
  });
});
