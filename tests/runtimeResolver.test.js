import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { runtimeResolver } from "../graphql/resolver/runtime.resolver.js";
import { runtimeState, updateRuntimeState } from "../core/runtime/state.js";
import { SESSION_FILE } from "../core/session/sessionPath.js";
import { pubsub } from "../graphql/resolver/file.resolver.js";

vi.mock("fs");
vi.mock("../graphql/resolver/file.resolver.js", () => ({
  pubsub: {
    publish: vi.fn(),
    asyncIterableIterator: vi.fn(),
  },
}));

describe("Runtime GraphQL Resolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateRuntimeState({
      authenticated: true,
      user: { id: "1", username: "test" },
      workstation: { id: "ws1", name: "test-ws" },
      projects: [],
      source: "fresh",
    });
  });

  it("should return the runtime state via Query.runtimeState", () => {
    const result = runtimeResolver.Query.runtimeState();
    expect(result.authenticated).toBe(true);
    expect(result.user.username).toBe("test");
  });

  it("should sign out and clear session via Mutation.signOut", () => {
    fs.existsSync.mockReturnValue(true);

    const result = runtimeResolver.Mutation.signOut();

    expect(fs.unlinkSync).toHaveBeenCalledWith(SESSION_FILE);
    expect(result.authenticated).toBe(false);
    expect(result.user).toBeNull();
    // Cache should be preserved
    expect(result.workstation.name).toBe("test-ws");
  });

  it("should handle signOut when session file does not exist", () => {
    fs.existsSync.mockReturnValue(false);

    runtimeResolver.Mutation.signOut();

    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(runtimeState.authenticated).toBe(false);
  });
});
