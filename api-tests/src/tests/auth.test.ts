import { describe, it, expect } from "vitest";
import { createApiClient } from "../client/api-client.ts";
import {
  registerAnonymousUser,
  loginUser,
  type RegisterBeginResponse,
} from "../client/auth.ts";

const API_BASE_URL = process.env["API_BASE_URL"] ?? "http://localhost:8080";

describe("Anonymous Passkey Authentication", () => {
  describe("POST /v1/auth/register/begin", () => {
    it("should return a session ID and challenge", async () => {
      const client = createApiClient({ baseUrl: API_BASE_URL });
      const { status, data } = await client.post<RegisterBeginResponse>(
        "/v1/auth/register/begin",
        { displayName: "TestLion" },
      );

      expect(status).toBe(200);
      expect(data.sessionId).toBeTruthy();
      expect(data.challenge).toBeTruthy();
    });
  });

  describe("Registration flow", () => {
    it("should register a new anonymous user and receive a token", async () => {
      const client = createApiClient({ baseUrl: API_BASE_URL });
      const { userId, token } = await registerAnonymousUser(client);

      expect(userId).toBeTruthy();
      expect(token).toBeTruthy();
    });

    it("should allow authenticated access after registration", async () => {
      const client = createApiClient({ baseUrl: API_BASE_URL });
      await registerAnonymousUser(client);

      const { status } = await client.get("/v1/dashboard");
      expect(status).toBe(200);
    });
  });

  describe("Login flow", () => {
    it("should log in an existing user and receive a new token", async () => {
      const client = createApiClient({ baseUrl: API_BASE_URL });
      const { userId } = await registerAnonymousUser(client, "LoginTestUser");

      // Create a fresh client and login as the same user
      const loginClient = createApiClient({ baseUrl: API_BASE_URL });
      const { token } = await loginUser(loginClient, userId);

      expect(token).toBeTruthy();
    });

    it("should allow authenticated access after login", async () => {
      const client = createApiClient({ baseUrl: API_BASE_URL });
      const { userId } = await registerAnonymousUser(
        client,
        "LoginAccessTest",
      );

      const loginClient = createApiClient({ baseUrl: API_BASE_URL });
      await loginUser(loginClient, userId);

      const { status } = await loginClient.get("/v1/dashboard");
      expect(status).toBe(200);
    });
  });

  describe("Unauthenticated access", () => {
    it("should return 401 for protected endpoints without token", async () => {
      const client = createApiClient({ baseUrl: API_BASE_URL });
      const { status } = await client.get("/v1/dashboard");

      expect(status).toBe(401);
    });

    it("should return 401 for protected endpoints with invalid token", async () => {
      const client = createApiClient({
        baseUrl: API_BASE_URL,
        authToken: "invalid-token",
      });
      const { status } = await client.get("/v1/dashboard");

      expect(status).toBe(401);
    });
  });
});
