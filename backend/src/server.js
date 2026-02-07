import Fastify from "fastify";
import cors from "@fastify/cors";
import { createStore } from "./db.js";

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "0.0.0.0";
const DATABASE_PATH = process.env.DATABASE_PATH ?? "/app/data/eco-loewe.db";

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

await app.register(cors, { origin: true });

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

  const { sessionId, challenge } = store.createAuthSession({
    kind: "register",
    displayName: displayName.trim(),
  });
  return { sessionId, challenge };
});

app.post("/v1/auth/register/finish", async (request, reply) => {
  const sessionId = request.body?.sessionId;
  const credential = request.body?.credential;
  if (typeof sessionId !== "string" || typeof credential !== "string") {
    return reply.code(400).send({ error: "sessionId and credential are required" });
  }

  const session = store.getAuthSession(sessionId);
  if (!session || session.kind !== "register" || session.consumed) {
    return reply.code(400).send({ error: "Invalid session" });
  }

  if (credential !== `test-credential-${session.challenge}`) {
    return reply.code(400).send({ error: "Invalid credential" });
  }

  store.consumeAuthSession(sessionId);
  const userId = store.createUser(session.display_name || "Anonymous Lion");
  const token = store.issueToken(userId);
  return { userId, token };
});

app.post("/v1/auth/login/begin", async (request, reply) => {
  const userId = request.body?.userId;
  if (typeof userId !== "string" || !userId.trim()) {
    return reply.code(400).send({ error: "userId is required" });
  }
  if (!store.userExists(userId)) {
    return reply.code(404).send({ error: "User not found" });
  }

  const { sessionId, challenge } = store.createAuthSession({
    kind: "login",
    userId,
  });
  return { sessionId, challenge };
});

app.post("/v1/auth/login/finish", async (request, reply) => {
  const sessionId = request.body?.sessionId;
  const credential = request.body?.credential;
  if (typeof sessionId !== "string" || typeof credential !== "string") {
    return reply.code(400).send({ error: "sessionId and credential are required" });
  }

  const session = store.getAuthSession(sessionId);
  if (!session || session.kind !== "login" || session.consumed || !session.user_id) {
    return reply.code(400).send({ error: "Invalid session" });
  }
  if (!store.userExists(session.user_id)) {
    return reply.code(404).send({ error: "User not found" });
  }
  if (credential !== `test-credential-${session.challenge}`) {
    return reply.code(400).send({ error: "Invalid credential" });
  }

  store.consumeAuthSession(sessionId);
  const token = store.issueToken(session.user_id);
  return { token };
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
  return { ok: true };
});

app.get("/v1/users", async () => {
  return store.listUsers();
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
