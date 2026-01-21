import { describe, it, expect, vi, beforeEach } from "vitest";
import { bootstrapAfterAuth } from "../core/runtime/bootstrapAfterAuth.js";
import * as getWorkstationModule from "../core/runtime/getWorkstation.js";
import * as getProjectsModule from "../core/runtime/getProjects.js";
import * as loadWorkstationModule from "../core/cache/loadWorkstation.js";
import * as loadProjectsModule from "../core/cache/loadProjects.js";
import * as saveWorkstationModule from "../core/cache/saveWorkstation.js";
import * as saveProjectsModule from "../core/cache/saveProjects.js";

vi.mock("../core/runtime/getWorkstation.js");
vi.mock("../core/runtime/getProjects.js");
vi.mock("../core/cache/loadWorkstation.js");
vi.mock("../core/cache/loadProjects.js");
vi.mock("../core/cache/saveWorkstation.js");
vi.mock("../core/cache/saveProjects.js");

describe("Bootstrap Flow", () => {
  const mockUserId = "user123";
  const mockToken = "token456";
  const workstationName = "babyclara"; // matched in local babyclara.config.js during tests

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use cached workstation and projects if valid and not stale", async () => {
    loadWorkstationModule.loadWorkstation.mockReturnValue({
      data: { id: "ws1", name: workstationName, owner: { id: mockUserId } },
      savedAt: new Date().toISOString(),
    });

    loadProjectsModule.loadProjects.mockReturnValue({
      data: [{ id: "p1" }],
      savedAt: new Date().toISOString(),
    });

    const result = await bootstrapAfterAuth(mockUserId, mockToken);

    expect(result.workstation.id).toBe("ws1");
    expect(result.projects.length).toBe(1);
    expect(getWorkstationModule.getWorkstation).not.toHaveBeenCalled();
    expect(getProjectsModule.getProjects).not.toHaveBeenCalled();
  });

  it("should fetch workstation if cache is missing", async () => {
    loadWorkstationModule.loadWorkstation.mockReturnValue(null);
    getWorkstationModule.getWorkstation.mockResolvedValue({
      id: "ws_new",
      name: workstationName,
      owner: { id: mockUserId },
    });
    getProjectsModule.getProjects.mockResolvedValue([]);

    await bootstrapAfterAuth(mockUserId, mockToken);

    expect(getWorkstationModule.getWorkstation).toHaveBeenCalled();
    expect(saveWorkstationModule.saveWorkstation).toHaveBeenCalled();
  });

  it("should fetch projects if cache is stale", async () => {
    loadWorkstationModule.loadWorkstation.mockReturnValue({
      data: { id: "ws1", name: workstationName, owner: { id: mockUserId } },
      savedAt: new Date().toISOString(),
    });

    // 10 minutes ago
    loadProjectsModule.loadProjects.mockReturnValue({
      data: [{ id: "p1" }],
      savedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    });

    getProjectsModule.getProjects.mockResolvedValue([{ id: "p_fresh" }]);

    const result = await bootstrapAfterAuth(mockUserId, mockToken);

    expect(getProjectsModule.getProjects).toHaveBeenCalledWith(
      "ws1",
      mockToken,
    );
    expect(saveProjectsModule.saveProjects).toHaveBeenCalled();
    expect(result.projects[0].id).toBe("p_fresh");
  });

  it("should not refetch if only 1 minute has passed (not stale)", async () => {
    loadWorkstationModule.loadWorkstation.mockReturnValue({
      data: { id: "ws1", name: workstationName, owner: { id: mockUserId } },
      savedAt: new Date().toISOString(),
    });

    // 1 minute ago
    loadProjectsModule.loadProjects.mockReturnValue({
      data: [{ id: "p1" }],
      savedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    });

    await bootstrapAfterAuth(mockUserId, mockToken);
    expect(getProjectsModule.getProjects).not.toHaveBeenCalled();
  });
});
