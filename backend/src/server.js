import Fastify from "fastify";
import cors from "@fastify/cors";
import crypto from "node:crypto";
import { createStore } from "./db.js";

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "0.0.0.0";
const DATABASE_PATH = process.env.DATABASE_PATH ?? "/app/data/eco-loewe.db";
const AUTH_SESSION_TTL_MS = 10 * 60 * 1000;
const WEBAUTHN_RP_ID = process.env.WEBAUTHN_RP_ID ?? "localhost";
const WEBAUTHN_RP_NAME = process.env.WEBAUTHN_RP_NAME ?? "Eco-Loewe";
const SUPPORTED_WEBAUTHN_ALGORITHMS = new Set([-7, -257]);

const VALID_ACTIVITY_TYPES = new Set(["walk", "bike", "transit", "drive", "wfh", "pool"]);

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isPublicPath(pathname) {
  return (
    pathname.startsWith("/v1/auth/") ||
    pathname.startsWith("/v1/admin/") ||
    pathname === "/healthz"
  );
}

const store = createStore(DATABASE_PATH);
const app = Fastify({ logger: true });

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:8080",
  "https://ecolion.d00.ch",
  "https://ecolionapi.d00.ch",
]);
const WEBAUTHN_ALLOWED_ORIGINS = new Set(
  String(process.env.WEBAUTHN_ALLOWED_ORIGINS ?? Array.from(ALLOWED_ORIGINS).join(","))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const EXPECTED_RP_ID_HASH = crypto.createHash("sha256").update(WEBAUTHN_RP_ID).digest();

function isObject(value) {
  return value !== null && typeof value === "object";
}

function base64UrlToBuffer(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Invalid base64url input");
  }
  return Buffer.from(value, "base64url");
}

function buffersEqual(left, right) {
  if (!Buffer.isBuffer(left) || !Buffer.isBuffer(right) || left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function parseClientDataJSON(clientDataJSONB64Url) {
  const clientDataJSON = base64UrlToBuffer(clientDataJSONB64Url);
  const parsed = JSON.parse(clientDataJSON.toString("utf8"));
  if (
    !isObject(parsed) ||
    typeof parsed.type !== "string" ||
    typeof parsed.challenge !== "string" ||
    typeof parsed.origin !== "string"
  ) {
    throw new Error("Invalid clientDataJSON");
  }
  return { raw: clientDataJSON, parsed };
}

function parseAuthenticatorData(authenticatorDataB64Url) {
  const raw = base64UrlToBuffer(authenticatorDataB64Url);
  if (raw.length < 37) {
    throw new Error("Invalid authenticatorData");
  }
  const flags = raw[32];
  return {
    raw,
    rpIdHash: raw.subarray(0, 32),
    flags,
    userPresent: Boolean(flags & 0x01),
    userVerified: Boolean(flags & 0x04),
    signCount: raw.readUInt32BE(33),
  };
}

function verifyChallenge(receivedChallenge, expectedChallenge) {
  try {
    return buffersEqual(
      base64UrlToBuffer(receivedChallenge),
      base64UrlToBuffer(expectedChallenge),
    );
  } catch {
    return false;
  }
}

function isAuthSessionExpired(session) {
  const createdAtMs = Date.parse(session.created_at ?? "");
  if (Number.isNaN(createdAtMs)) {
    return true;
  }
  return Date.now() - createdAtMs > AUTH_SESSION_TTL_MS;
}

function verifyWebAuthnClientData({ clientDataJSON, expectedType, expectedChallenge }) {
  const clientData = parseClientDataJSON(clientDataJSON);
  if (clientData.parsed.type !== expectedType) {
    throw new Error("Invalid clientData type");
  }
  if (!verifyChallenge(clientData.parsed.challenge, expectedChallenge)) {
    throw new Error("Invalid challenge");
  }
  if (!WEBAUTHN_ALLOWED_ORIGINS.has(clientData.parsed.origin)) {
    throw new Error("Invalid origin");
  }
  return clientData;
}

function verifyRpIdHash(authenticatorData) {
  return buffersEqual(authenticatorData.rpIdHash, EXPECTED_RP_ID_HASH);
}

function buildRegistrationOptions(challenge, displayName, userHandle) {
  return {
    challenge,
    rp: {
      id: WEBAUTHN_RP_ID,
      name: WEBAUTHN_RP_NAME,
    },
    user: {
      id: userHandle,
      name: displayName,
      displayName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    timeout: 60_000,
    attestation: "none",
    authenticatorSelection: {
      residentKey: "required",
      requireResidentKey: true,
      userVerification: "preferred",
    },
  };
}

function buildAuthenticationOptions(challenge) {
  return {
    challenge,
    rpId: WEBAUTHN_RP_ID,
    timeout: 60_000,
    userVerification: "preferred",
  };
}

function getVerifyAlgorithm(coseAlgorithm) {
  if (coseAlgorithm === -7 || coseAlgorithm === -257) {
    return "sha256";
  }
  return null;
}

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error("Origin not allowed"), false);
  },
});

app.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (_request, body, done) => {
    if (body.trim() === "") {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(body));
    } catch (error) {
      done(error);
    }
  },
);

app.addHook("preHandler", async (request, reply) => {
  if (request.method === "OPTIONS") {
    return;
  }
  const pathname = (request.raw.url ?? "").split("?")[0] ?? "";
  if (!pathname.startsWith("/v1/") || isPublicPath(pathname)) {
    return;
  }

  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length).trim();
  const userId = store.getUserIdForToken(token);
  if (!userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  request.userId = userId;
});

app.get("/healthz", async () => ({ ok: true }));

app.post("/v1/auth/register/begin", async (request, reply) => {
  const displayName = request.body?.displayName;
  if (typeof displayName !== "string" || !displayName.trim()) {
    return reply.code(400).send({ error: "displayName is required" });
  }

  const normalizedDisplayName = displayName.trim();
  const userHandle = crypto.randomBytes(32).toString("base64url");
  const { sessionId, challenge } = store.createAuthSession({
    kind: "register",
    displayName: normalizedDisplayName,
    metadata: {
      userHandle,
    },
  });
  return {
    sessionId,
    challenge,
    publicKey: buildRegistrationOptions(challenge, normalizedDisplayName, userHandle),
  };
});

app.post("/v1/auth/register/finish", async (request, reply) => {
  const sessionId = request.body?.sessionId;
  const credential = request.body?.credential;
  if (typeof sessionId !== "string" || !credential) {
    return reply.code(400).send({ error: "sessionId and credential are required" });
  }

  const session = store.getAuthSession(sessionId);
  if (!session || session.kind !== "register" || session.consumed || isAuthSessionExpired(session)) {
    return reply.code(400).send({ error: "Invalid session" });
  }

  if (typeof credential === "string") {
    if (credential !== `test-credential-${session.challenge}`) {
      return reply.code(400).send({ error: "Invalid credential" });
    }
    store.consumeAuthSession(sessionId);
    const userId = store.createUser(session.display_name || "Anonymous Lion");
    const token = store.issueToken(userId);
    return { userId, token };
  }

  if (!isObject(credential) || !isObject(credential.response)) {
    return reply.code(400).send({ error: "Invalid passkey payload" });
  }

  const credentialId = credential.id;
  const response = credential.response;
  if (typeof credentialId !== "string" || !credentialId.trim()) {
    return reply.code(400).send({ error: "credential.id is required" });
  }
  if (
    typeof response.clientDataJSON !== "string" ||
    typeof response.authenticatorData !== "string" ||
    typeof response.publicKey !== "string" ||
    !Number.isInteger(response.publicKeyAlgorithm)
  ) {
    return reply.code(400).send({ error: "Incomplete passkey registration response" });
  }
  if (!SUPPORTED_WEBAUTHN_ALGORITHMS.has(response.publicKeyAlgorithm)) {
    return reply.code(400).send({ error: "Unsupported passkey algorithm" });
  }
  if (store.getPasskeyByCredentialId(credentialId)) {
    return reply.code(409).send({ error: "Passkey already registered" });
  }

  try {
    const clientData = verifyWebAuthnClientData({
      clientDataJSON: response.clientDataJSON,
      expectedType: "webauthn.create",
      expectedChallenge: session.challenge,
    });
    const authenticatorData = parseAuthenticatorData(response.authenticatorData);
    if (!verifyRpIdHash(authenticatorData)) {
      return reply.code(400).send({ error: "Invalid rpId hash" });
    }
    if (!authenticatorData.userPresent) {
      return reply.code(400).send({ error: "User presence required" });
    }

    store.consumeAuthSession(sessionId);
    const userId = store.createUser(session.display_name || "Anonymous Lion");
    store.addPasskey({
      credentialId,
      userId,
      publicKeySpkiB64Url: response.publicKey,
      algorithm: response.publicKeyAlgorithm,
      counter: authenticatorData.signCount,
      transports: Array.isArray(response.transports)
        ? response.transports.filter((value) => typeof value === "string")
        : [],
      userHandleB64Url:
        typeof response.userHandle === "string"
          ? response.userHandle
          : session.metadata?.userHandle ?? null,
    });
    const token = store.issueToken(userId);
    return { userId, token };
  } catch (error) {
    request.log.warn({ err: error }, "Failed passkey registration verification");
    return reply.code(400).send({ error: "Invalid passkey credential" });
  }
});

app.post("/v1/auth/login/begin", async (request, reply) => {
  const requestedUserId = request.body?.userId;
  if (requestedUserId !== undefined && (typeof requestedUserId !== "string" || !requestedUserId.trim())) {
    return reply.code(400).send({ error: "userId must be a non-empty string when provided" });
  }
  if (typeof requestedUserId === "string" && !store.userExists(requestedUserId)) {
    return reply.code(404).send({ error: "User not found" });
  }

  const { sessionId, challenge } = store.createAuthSession({
    kind: "login",
    userId: typeof requestedUserId === "string" ? requestedUserId : null,
    metadata: {
      legacy: typeof requestedUserId === "string",
    },
  });
  return {
    sessionId,
    challenge,
    publicKey: buildAuthenticationOptions(challenge),
  };
});

app.post("/v1/auth/login/finish", async (request, reply) => {
  const sessionId = request.body?.sessionId;
  const credential = request.body?.credential;
  if (typeof sessionId !== "string" || !credential) {
    return reply.code(400).send({ error: "sessionId and credential are required" });
  }

  const session = store.getAuthSession(sessionId);
  if (!session || session.kind !== "login" || session.consumed || isAuthSessionExpired(session)) {
    return reply.code(400).send({ error: "Invalid session" });
  }

  if (typeof credential === "string") {
    if (!session.user_id || !store.userExists(session.user_id)) {
      return reply.code(404).send({ error: "User not found" });
    }
    if (credential !== `test-credential-${session.challenge}`) {
      return reply.code(400).send({ error: "Invalid credential" });
    }
    store.consumeAuthSession(sessionId);
    const token = store.issueToken(session.user_id);
    return { token };
  }

  if (!isObject(credential) || !isObject(credential.response)) {
    return reply.code(400).send({ error: "Invalid passkey payload" });
  }

  const credentialId = credential.id;
  const response = credential.response;
  if (typeof credentialId !== "string" || !credentialId.trim()) {
    return reply.code(400).send({ error: "credential.id is required" });
  }
  if (
    typeof response.clientDataJSON !== "string" ||
    typeof response.authenticatorData !== "string" ||
    typeof response.signature !== "string"
  ) {
    return reply.code(400).send({ error: "Incomplete passkey login response" });
  }

  const passkey = store.getPasskeyByCredentialId(credentialId);
  if (!passkey) {
    return reply.code(404).send({ error: "Passkey not found" });
  }
  if (session.user_id && passkey.user_id !== session.user_id) {
    return reply.code(400).send({ error: "Passkey does not match requested user" });
  }
  if (!store.userExists(passkey.user_id)) {
    return reply.code(404).send({ error: "User not found" });
  }

  const verifyAlgorithm = getVerifyAlgorithm(passkey.algorithm);
  if (!verifyAlgorithm) {
    return reply.code(400).send({ error: "Unsupported passkey algorithm" });
  }

  try {
    const clientData = verifyWebAuthnClientData({
      clientDataJSON: response.clientDataJSON,
      expectedType: "webauthn.get",
      expectedChallenge: session.challenge,
    });
    const authenticatorData = parseAuthenticatorData(response.authenticatorData);
    if (!verifyRpIdHash(authenticatorData)) {
      return reply.code(400).send({ error: "Invalid rpId hash" });
    }
    if (!authenticatorData.userPresent) {
      return reply.code(400).send({ error: "User presence required" });
    }

    const signedData = Buffer.concat([
      authenticatorData.raw,
      crypto.createHash("sha256").update(clientData.raw).digest(),
    ]);
    const verified = crypto.verify(
      verifyAlgorithm,
      signedData,
      crypto.createPublicKey({
        key: base64UrlToBuffer(passkey.public_key_spki_b64url),
        format: "der",
        type: "spki",
      }),
      base64UrlToBuffer(response.signature),
    );
    if (!verified) {
      return reply.code(400).send({ error: "Invalid signature" });
    }

    const previousCounter = Number(passkey.counter) || 0;
    if (
      authenticatorData.signCount > 0 &&
      previousCounter > 0 &&
      authenticatorData.signCount <= previousCounter
    ) {
      return reply.code(400).send({ error: "Passkey counter check failed" });
    }
    if (authenticatorData.signCount > previousCounter) {
      store.updatePasskeyCounter(credentialId, authenticatorData.signCount);
    }

    store.consumeAuthSession(sessionId);
    const token = store.issueToken(passkey.user_id);
    return { userId: passkey.user_id, token };
  } catch (error) {
    request.log.warn({ err: error }, "Failed passkey login verification");
    return reply.code(400).send({ error: "Invalid passkey credential" });
  }
});

app.get("/v1/whoami", async (request, reply) => {
  const user = store.getUserById(request.userId);
  if (!user) {
    return reply.code(404).send({ error: "User not found" });
  }
  return user;
});

app.get("/v1/dashboard", async (request) => {
  return store.getDashboard(request.userId);
});

app.get("/v1/leaderboard", async (request) => {
  return store.getLeaderboard(request.userId);
});

app.get("/v1/shop/items", async (request) => {
  return store.listShopItems(request.userId);
});

app.post("/v1/shop/purchase", async (request, reply) => {
  const itemId = request.body?.itemId;
  if (typeof itemId !== "string" || !itemId.trim()) {
    return reply.code(400).send({ error: "itemId is required" });
  }

  const result = store.purchaseItem(request.userId, itemId);
  if (result.notFound) {
    return reply.code(404).send({ error: "Item not found" });
  }
  if (result.insufficientFunds) {
    return reply.code(400).send({ error: "Insufficient funds" });
  }
  
  // Return updated user data (dashboard)
  return store.getDashboard(request.userId);
});

app.post("/v1/shop/equip", async (request, reply) => {
  const itemId = request.body?.itemId;
  if (typeof itemId !== "string" || !itemId.trim()) {
    return reply.code(400).send({ error: "itemId is required" });
  }

  const dashboard = store.equipItem(request.userId, itemId);
  if (!dashboard) {
    return reply.code(400).send({ error: "Item not owned or found" });
  }
  return dashboard;
});

app.post("/v1/shop/unequip/:itemId", async (request, reply) => {
  const itemId = request.params?.itemId;
  if (typeof itemId !== "string" || !itemId.trim()) {
    return reply.code(400).send({ error: "itemId is required" });
  }

  const dashboard = store.unequipItem(request.userId, itemId);
  return dashboard;
});

app.post("/v1/shop/buyCoins", async (request, reply) => {
  const amount = request.body?.amount;
  if (!Number.isInteger(amount) || amount <= 0) {
    return reply.code(400).send({ error: "Valid amount is required" });
  }

  const dashboard = store.addCoins(request.userId, amount);
  return {
    transactionId: `txn-${Date.now()}`,
    coinsAdded: amount,
    newBalance: dashboard.lion.coins,
  };
});



app.get("/v1/users", async () => {
  return store.listUsers();
});

app.get("/v1/friends", async (request) => {
  return store.listFriends(request.userId);
});

app.post("/v1/friends", async (request, reply) => {
  const friendUserId = request.body?.userId;
  const result = store.addFriendById(request.userId, friendUserId);
  if (result.status === "invalid") {
    return reply.code(400).send({ error: "userId is required" });
  }
  if (result.status === "self") {
    return reply.code(400).send({ error: "Cannot add yourself as a friend" });
  }
  if (result.status === "duplicate") {
    return reply.code(200).send({ ok: true, friend: result.friend });
  }
  if (result.status === "not_found") {
    return reply.code(404).send({ error: "User not found" });
  }
  return { ok: true, friend: result.friend };
});

app.post("/v1/users/:userId/poke", async (request, reply) => {
  const userId = request.params?.userId;
  if (typeof userId !== "string" || !userId.trim()) {
    return reply.code(400).send({ error: "userId is required" });
  }
  const success = store.pokeUser(request.userId, userId);
  if (!success) {
    return reply.code(404).send({ error: "User not found" });
  }
  return { ok: true };
});

app.get("/v1/assets/:id", async (request, reply) => {
  const asset = store.getAsset(request.params?.id);
  if (!asset) {
    return reply.code(404).send({ error: "Asset not found" });
  }
  return asset;
});

app.get("/v1/assets", async (request) => {
  const idsRaw = request.query?.ids;
  if (typeof idsRaw !== "string" || !idsRaw.trim()) {
    return store.listAssets([]);
  }
  const ids = idsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return store.listAssets(ids);
});

app.post("/v1/activity/start", async (request, reply) => {
  const activityType = request.body?.activityType;
  const startTime = request.body?.startTime;

  if (typeof activityType !== "string" || !VALID_ACTIVITY_TYPES.has(activityType)) {
    return reply.code(400).send({ error: "Valid activityType is required" });
  }
  if (!isIsoTimestamp(startTime)) {
    return reply.code(400).send({ error: "Valid startTime is required" });
  }

  const activityId = store.startActivity(request.userId, { activityType, startTime });
  return { activityId, state: "running" };
});

app.post("/v1/activity/stop", async (request, reply) => {
  const activityId = request.body?.activityId;
  const stopTime = request.body?.stopTime;

  if (!Number.isInteger(activityId) || activityId <= 0) {
    return reply.code(400).send({ error: "Valid activityId is required" });
  }
  if (!isIsoTimestamp(stopTime)) {
    return reply.code(400).send({ error: "Valid stopTime is required" });
  }

  const result = store.stopActivity(request.userId, {
    activityId,
    stopTime,
    gpx: request.body?.gpx,
    proofs: request.body?.proofs,
  });

  if (!result) {
    return reply.code(404).send({ error: "Activity not found" });
  }
  return result;
});

app.get("/v1/activity/:activityId", async (request, reply) => {
  const activityId = Number(request.params?.activityId);
  if (!Number.isInteger(activityId) || activityId <= 0) {
    return reply.code(404).send({ error: "Activity not found" });
  }

  const activity = store.getActivity(request.userId, activityId);
  if (!activity) {
    return reply.code(404).send({ error: "Activity not found" });
  }
  return activity;
});

app.get("/v1/activities", async (request) => {
  return store.listActivities(request.userId);
});

app.post("/v1/admin/reset", async () => {
  store.resetReferenceData();
  return { ok: true };
});

app.post("/v1/admin/seed", async (request) => {
  store.seedFromPayload(request.body ?? {});
  return { ok: true };
});

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  if (!reply.sent) {
    const statusCode =
      typeof error.statusCode === "number" ? error.statusCode : 500;
    reply
      .code(statusCode)
      .send({ error: statusCode >= 500 ? "Internal Server Error" : error.message });
  }
});

const shutdown = async () => {
  await app.close();
  store.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port: PORT, host: HOST });
