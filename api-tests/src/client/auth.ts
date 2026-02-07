import type { ApiClient } from "./api-client.ts";

// ---------------------------------------------------------------------------
// Contract interfaces for the anonymous passkey authentication flow.
//
// The flow mirrors WebAuthn ceremony structure:
//   1. register/begin  – server sends a challenge
//   2. register/finish – client responds with a credential
//   3. login/begin     – server sends a challenge for existing user
//   4. login/finish    – client responds with a credential
//
// For hackathon / dev mode the backend can accept a simplified
// "test credential" (the challenge echoed back). When real passkey
// support is added, only the credential generation logic here changes.
// ---------------------------------------------------------------------------

/** POST /v1/auth/register/begin */
export interface RegisterBeginRequest {
  displayName: string;
}

export interface RegisterBeginResponse {
  sessionId: string;
  challenge: string;
  publicKey?: unknown;
}

/** POST /v1/auth/register/finish */
export interface RegisterFinishRequest {
  sessionId: string;
  credential: string;
}

export interface RegisterFinishResponse {
  userId: string;
  token: string;
}

/** POST /v1/auth/login/begin */
export interface LoginBeginRequest {
  userId: string;
}

export interface LoginBeginResponse {
  sessionId: string;
  challenge: string;
  publicKey?: unknown;
}

/** POST /v1/auth/login/finish */
export interface LoginFinishRequest {
  sessionId: string;
  credential: string;
}

export interface LoginFinishResponse {
  token: string;
}

// ---------------------------------------------------------------------------
// Auth helper functions
// ---------------------------------------------------------------------------

/**
 * Register a new anonymous user and set the auth token on the client.
 *
 * The test credential is simply the challenge echoed back — the backend
 * should accept this in dev/test mode.
 */
export async function registerAnonymousUser(
  client: ApiClient,
  displayName?: string,
): Promise<{ userId: string; token: string }> {
  const name = displayName ?? `TestLion-${Date.now()}`;

  // Step 1: Begin registration
  const { data: beginRes } = await client.post<RegisterBeginResponse>(
    "/v1/auth/register/begin",
    { displayName: name } satisfies RegisterBeginRequest,
  );

  // Step 2: Finish registration with a test credential
  const testCredential = `test-credential-${beginRes.challenge}`;
  const { data: finishRes } = await client.post<RegisterFinishResponse>(
    "/v1/auth/register/finish",
    {
      sessionId: beginRes.sessionId,
      credential: testCredential,
    } satisfies RegisterFinishRequest,
  );

  // Step 3: Set the token on the client for subsequent requests
  client.setAuthToken(finishRes.token);

  return { userId: finishRes.userId, token: finishRes.token };
}

/**
 * Login as an existing user and set the auth token on the client.
 */
export async function loginUser(
  client: ApiClient,
  userId: string,
): Promise<{ token: string }> {
  const { data: beginRes } = await client.post<LoginBeginResponse>(
    "/v1/auth/login/begin",
    { userId } satisfies LoginBeginRequest,
  );

  const testCredential = `test-credential-${beginRes.challenge}`;
  const { data: finishRes } = await client.post<LoginFinishResponse>(
    "/v1/auth/login/finish",
    {
      sessionId: beginRes.sessionId,
      credential: testCredential,
    } satisfies LoginFinishRequest,
  );

  client.setAuthToken(finishRes.token);
  return { token: finishRes.token };
}
