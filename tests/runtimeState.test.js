import { describe, it, expect, vi, beforeEach } from "vitest";
import { runtimeState, updateRuntimeState } from "../core/runtime/state.js";

describe("Runtime State Management", () => {
  beforeEach(() => {
    updateRuntimeState({
      authenticated: false,
      user: null,
      workstation: null,
      projects: [],
      source: "cache",
    });
  });

  it("should update and hold the runtime state", () => {
    const mockUser = { id: "1", username: "test" };
    const mockWS = { id: "ws1", name: "my-ws" };
    const mockProj = [{ id: "p1", name: "p1" }];

    updateRuntimeState({
      authenticated: true,
      user: mockUser,
      workstation: mockWS,
      projects: mockProj,
      source: "fresh",
    });

    expect(runtimeState.authenticated).toBe(true);
    expect(runtimeState.user).toEqual(mockUser);
    expect(runtimeState.workstation).toEqual(mockWS);
    expect(runtimeState.projects).toEqual(mockProj);
    expect(runtimeState.source).toBe("fresh");
    expect(runtimeState.lastUpdated).toBeDefined();
  });

  it("should allow partial updates", () => {
    updateRuntimeState({ authenticated: true });
    expect(runtimeState.authenticated).toBe(true);
    expect(runtimeState.projects).toEqual([]); // Should remain unchanged
  });
});
