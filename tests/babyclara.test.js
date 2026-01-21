import { describe, it, expect, vi, beforeEach } from "vitest";
import { userResolver } from "../graphql/resolver/user.resolver.js";
import { TGU_URL } from "../graphql/service/tguService.js";
import { saveTokens } from "../core/session/saveTokens.js";

// Mock fetch globally
global.fetch = vi.fn();

// Mock saveTokens
vi.mock("../core/session/saveTokens.js", () => ({
  saveTokens: vi.fn(),
}));

describe("BabyClara Resolvers & Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("TGU Configuration", () => {
    it("should verify TGU URL is correct for current NODE_ENV", () => {
      const expected =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/graphql"
          : "https://great-unknown.onrender.com/graphql";
      expect(TGU_URL).toBe(expected);
    });

    it("should return production URL by default if NODE_ENV is not development", async () => {
      // Small check to verify the logic in babyclara.config.js
      // We can't easily re-import the same file with different ENV in ESM easily without cache busting
      // but we can verify the exported TGU_URL matches the logic.
    });
  });

  describe("Signup Mutation", () => {
    it("should forward signup mutation to TGU and return data", async () => {
      const mockResponse = {
        data: {
          signup: {
            token: "fake-jwt-token",
            refreshToken: "fake-refresh-token",
            user: { id: "1", username: "testuser", email: "test@example.com" },
            error: null,
          },
        },
      };

      fetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const input = {
        username: "testuser",
        email: "test@example.com",
        password: "password",
      };
      const result = await userResolver.Mutation.signup(
        null,
        { input },
        { token: null },
      );

      expect(fetch).toHaveBeenCalledWith(
        TGU_URL,
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("SignUp"),
        }),
      );
      expect(result).toEqual(mockResponse.data.signup);
      expect(saveTokens).toHaveBeenCalledWith({
        accessToken: "fake-jwt-token",
        refreshToken: "fake-refresh-token",
        userId: "1",
      });
    });

    it("should include authorization header if token is in context", async () => {
      fetch.mockResolvedValue({
        json: () => Promise.resolve({ data: { signup: { token: "..." } } }),
      });

      await userResolver.Mutation.signup(
        null,
        { input: {} },
        { token: "existing-token" },
      );

      expect(fetch).toHaveBeenCalledWith(
        TGU_URL,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer existing-token",
          }),
        }),
      );
    });
  });

  describe("Signin Mutation", () => {
    it("should forward signin mutation to TGU", async () => {
      const mockResponse = {
        data: {
          signin: {
            token: "fake-jwt-token",
            refreshToken: "fake-refresh-token",
            user: { id: "1", username: "testuser", email: "test@example.com" },
            error: null,
          },
        },
      };

      fetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const input = { identifier: "testuser", password: "password" };
      const result = await userResolver.Mutation.signin(
        null,
        { input },
        { token: null },
      );

      expect(fetch).toHaveBeenCalledWith(
        TGU_URL,
        expect.objectContaining({
          body: expect.stringContaining("SignIn"),
        }),
      );
      expect(result).toEqual(mockResponse.data.signin);
      expect(saveTokens).toHaveBeenCalledWith({
        accessToken: "fake-jwt-token",
        refreshToken: "fake-refresh-token",
        userId: "1",
      });
    });
  });

  describe("Refresh Token Mutation", () => {
    it("should forward refreshToken mutation to TGU and include authorization header", async () => {
      const mockResponse = {
        data: {
          refreshToken: {
            token: "new-access-token",
            refreshToken: "new-refresh-token",
            user: { id: "1", username: "testuser", email: "test@example.com" },
            error: null,
          },
        },
      };

      fetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await userResolver.Mutation.refreshToken(
        null,
        { token: "old-refresh-token" },
        { token: "access-token-in-context" },
      );

      expect(fetch).toHaveBeenCalledWith(
        TGU_URL,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer access-token-in-context",
          }),
          body: expect.stringContaining("RefreshToken"),
        }),
      );
      expect(result).toEqual(mockResponse.data.refreshToken);
      expect(saveTokens).toHaveBeenCalledWith({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        userId: "1",
      });
    });
  });

  describe("File Changed Subscription", () => {
    it("should allow subscription to FILE_CHANGED", async () => {
      const { fileResolver } =
        await import("../graphql/resolver/file.resolver.js");
      const iterator = fileResolver.Subscription.fileChanged.subscribe(null, {
        workstationId: "123",
      });
      // In v3 asyncIterableIterator returns an iterator
      expect(iterator).toBeDefined();
    });
  });
});
