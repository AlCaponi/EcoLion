import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  DEFAULT_ASSETS,
  DEFAULT_DASHBOARD,
  DEFAULT_USERS,
  DEFAULT_LEADERBOARD,
  DEFAULT_SHOP_ITEMS,
} from "./fixtures.js";

const ACTIVITY_TYPES = new Set(["walk", "bike", "transit", "drive", "wfh", "pool"]);

function nowIso() {
  return new Date().toISOString();
}

function safeParseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function buildDashboardRow(userId, dashboard) {
  return {
    userId,
    sustainabilityScore: dashboard.sustainabilityScore,
    streakDays: dashboard.streakDays,
    todayWalkKm: dashboard.today.walkKm,
    todayPtTrips: dashboard.today.ptTrips,
    todayCarKm: dashboard.today.carKm,
    lionMood: dashboard.lion.mood,
    lionActivityMode: dashboard.lion.activityMode,
    lionAccessoriesJson: JSON.stringify(dashboard.lion.accessories ?? []),
    coins: dashboard.lion.coins,
  };
}

function rowToDashboard(row) {
  return {
    sustainabilityScore: row.sustainability_score,
    streakDays: row.streak_days,
    today: {
      walkKm: row.today_walk_km,
      ptTrips: row.today_pt_trips,
      carKm: row.today_car_km,
    },
    lion: {
      mood: row.lion_mood,
      activityMode: row.lion_activity_mode,
      accessories: safeParseJson(row.lion_accessories_json, []),
      coins: row.coins,
    },
  };
}

function upsertDashboardForUser(db, userId, dashboard) {
  const row = buildDashboardRow(userId, dashboard);
  db.prepare(
    `
      INSERT INTO dashboard_state (
        user_id, sustainability_score, streak_days, today_walk_km, today_pt_trips, today_car_km,
        lion_mood, lion_activity_mode, lion_accessories_json, coins
      )
      VALUES (
        @userId, @sustainabilityScore, @streakDays, @todayWalkKm, @todayPtTrips, @todayCarKm,
        @lionMood, @lionActivityMode, @lionAccessoriesJson, @coins
      )
      ON CONFLICT(user_id) DO UPDATE SET
        sustainability_score = excluded.sustainability_score,
        streak_days = excluded.streak_days,
        today_walk_km = excluded.today_walk_km,
        today_pt_trips = excluded.today_pt_trips,
        today_car_km = excluded.today_car_km,
        lion_mood = excluded.lion_mood,
        lion_activity_mode = excluded.lion_activity_mode,
        lion_accessories_json = excluded.lion_accessories_json,
        coins = excluded.coins
    `,
  ).run(row);
}

function getDefaultDashboard(db) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'default_dashboard'").get();
  return safeParseJson(row?.value, DEFAULT_DASHBOARD);
}

function setDefaultDashboard(db, dashboard) {
  db.prepare(
    `
      INSERT INTO settings (key, value)
      VALUES ('default_dashboard', @value)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
  ).run({ value: JSON.stringify(dashboard) });
}

function seedAssets(db, assets) {
  db.prepare("DELETE FROM assets").run();
  const stmt = db.prepare(
    "INSERT INTO assets (id, url, category) VALUES (@id, @url, @category)",
  );
  for (const asset of assets) {
    stmt.run({
      id: String(asset.id),
      url: String(asset.url),
      category: String(asset.category),
    });
  }
}

function seedUsers(db, users) {
  const insertUser = db.prepare(
    `
      INSERT OR IGNORE INTO users (id, display_name, created_at)
      VALUES (@id, @displayName, @createdAt)
    `,
  );
  const insertDashboard = db.prepare(
    `
      INSERT OR IGNORE INTO dashboard_state (
        user_id, sustainability_score, streak_days, today_walk_km, today_pt_trips, today_car_km,
        lion_mood, lion_activity_mode, lion_accessories_json, coins
      )
      VALUES (
        @userId, @sustainabilityScore, @streakDays, @todayWalkKm, @todayPtTrips, @todayCarKm,
        @lionMood, @lionActivityMode, @lionAccessoriesJson, @coins
      )
    `,
  );
  const insertActivity = db.prepare(
    `
      INSERT INTO activities (
        user_id, activity_type, state, start_time, stop_time, duration_seconds,
        distance_meters, xp_earned, co2_saved_kg
      )
      VALUES (
        @userId, 'walk', 'stopped', @startTime, @stopTime, 0, 0, 0, @co2SavedKg
      )
    `,
  );
  const defaultDashboard = getDefaultDashboard(db);

  for (const user of users) {
    const userId = String(user.id);
    const displayName = String(user.displayName ?? user.name ?? "Eco User");
    const streakDays = Number(user.streakDays) || 0;
    const co2SavedKg = Number(user.co2SavedKg) || 0;

    insertUser.run({
      id: userId,
      displayName,
      createdAt: nowIso(),
    });

    const dashboard = {
      ...defaultDashboard,
      streakDays,
    };
    const row = buildDashboardRow(userId, dashboard);
    insertDashboard.run(row);

    if (co2SavedKg > 0) {
      const now = nowIso();
      insertActivity.run({
        userId,
        startTime: now,
        stopTime: now,
        co2SavedKg,
      });
    }
  }
}

function seedLeaderboardQuartiers(db, quartiers) {
  db.prepare("DELETE FROM leaderboard_quartiers").run();
  const stmt = db.prepare(
    `
      INSERT INTO leaderboard_quartiers (id, name, co2_saved_kg, rank)
      VALUES (@id, @name, @co2SavedKg, @rank)
    `,
  );
  for (const quartier of quartiers) {
    stmt.run({
      id: String(quartier.id),
      name: String(quartier.name),
      co2SavedKg: Number(quartier.co2SavedKg) || 0,
      rank: Number(quartier.rank) || 1,
    });
  }
}

function seedShopItems(db, shopItems) {
  db.prepare("DELETE FROM shop_items").run();
  const stmt = db.prepare(
    `
      INSERT INTO shop_items (id, name, price_coins, category, asset_path)
      VALUES (@id, @name, @priceCoins, @category, @assetPath)
    `,
  );
  for (const item of shopItems) {
    stmt.run({
      id: String(item.id),
      name: String(item.name),
      priceCoins: Number(item.priceCoins) || 1,
      category: String(item.category),
      assetPath: String(item.assetPath),
    });
  }
}

function estimateDistanceMeters(activityType, durationSeconds) {
  const speedMps = {
    walk: 1.4,
    bike: 4.5,
    transit: 6.0,
    drive: 8.0,
    wfh: 0.0,
    pool: 0.7,
  };
  return Math.max(0, Math.round((speedMps[activityType] ?? 1) * durationSeconds));
}

function estimateCo2SavedKg(activityType, distanceMeters) {
  const factorPerKm = {
    walk: 0.2,
    bike: 0.18,
    transit: 0.1,
    drive: 0.0,
    wfh: 0.12,
    pool: 0.05,
  };
  const value = (distanceMeters / 1000) * (factorPerKm[activityType] ?? 0.1);
  return Math.max(0, Number(value.toFixed(3)));
}

function mapActivityRow(row) {
  return {
    activityId: row.id,
    activityType: row.activity_type,
    state: row.state,
    startTime: row.start_time,
    stopTime: row.stop_time ?? undefined,
    durationSeconds: row.duration_seconds ?? 0,
    distanceMeters:
      typeof row.distance_meters === "number" ? row.distance_meters : undefined,
    xpEarned: row.xp_earned ?? 0,
    co2SavedKg: row.co2_saved_kg ?? 0,
    gpx: row.gpx_json ? safeParseJson(row.gpx_json, undefined) : undefined,
    proofs: row.proofs_json ? safeParseJson(row.proofs_json, undefined) : undefined,
  };
}

export function createStore(dbPath) {
  const purgeOnStart = ["1", "true", "yes"].includes(
    String(process.env.PURGE_DB_ON_START ?? "").toLowerCase(),
  );
  if (purgeOnStart && dbPath && dbPath !== ":memory:") {
    try {
      fs.rmSync(dbPath, { force: true });
    } catch (error) {
      console.warn("Failed to purge database file:", error);
    }
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      user_id TEXT,
      display_name TEXT,
      challenge TEXT NOT NULL,
      consumed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dashboard_state (
      user_id TEXT PRIMARY KEY,
      sustainability_score REAL NOT NULL,
      streak_days INTEGER NOT NULL,
      today_walk_km REAL NOT NULL,
      today_pt_trips INTEGER NOT NULL,
      today_car_km REAL NOT NULL,
      lion_mood TEXT NOT NULL,
      lion_activity_mode TEXT NOT NULL,
      lion_accessories_json TEXT NOT NULL,
      coins INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leaderboard_quartiers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      co2_saved_kg REAL NOT NULL,
      rank INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shop_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_coins INTEGER NOT NULL,
      category TEXT NOT NULL,
      asset_path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_shop_ownership (
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      PRIMARY KEY (user_id, item_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(item_id) REFERENCES shop_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      state TEXT NOT NULL,
      start_time TEXT NOT NULL,
      stop_time TEXT,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      distance_meters INTEGER,
      xp_earned INTEGER NOT NULL DEFAULT 0,
      co2_saved_kg REAL NOT NULL DEFAULT 0,
      gpx_json TEXT,
      proofs_json TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pokes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  const pokeColumns = db.prepare("PRAGMA table_info(pokes)").all();
  const pokeColumnNames = new Set(pokeColumns.map((col) => col.name));
  if (pokeColumnNames.has("friend_id") && !pokeColumnNames.has("target_user_id")) {
    db.exec("ALTER TABLE pokes RENAME COLUMN friend_id TO target_user_id");
  }

  if (!db.prepare("SELECT 1 FROM settings WHERE key = 'default_dashboard'").get()) {
    setDefaultDashboard(db, DEFAULT_DASHBOARD);
  }
  if (!db.prepare("SELECT 1 FROM assets LIMIT 1").get()) {
    seedAssets(db, DEFAULT_ASSETS);
  }
  if (!db.prepare("SELECT 1 FROM users LIMIT 1").get()) {
    seedUsers(db, DEFAULT_USERS);
  }
  if (!db.prepare("SELECT 1 FROM leaderboard_quartiers LIMIT 1").get()) {
    seedLeaderboardQuartiers(db, DEFAULT_LEADERBOARD.quartiers);
  }
  if (!db.prepare("SELECT 1 FROM shop_items LIMIT 1").get()) {
    seedShopItems(db, DEFAULT_SHOP_ITEMS);
  }

  return {
    close() {
      db.close();
    },

    createAuthSession({ kind, userId = null, displayName = null }) {
      const sessionId = crypto.randomUUID();
      const challenge = crypto.randomBytes(24).toString("base64url");
      db.prepare(
        `
          INSERT INTO auth_sessions (id, kind, user_id, display_name, challenge, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
      ).run(sessionId, kind, userId, displayName, challenge, nowIso());
      return { sessionId, challenge };
    },

    getAuthSession(sessionId) {
      return db.prepare("SELECT * FROM auth_sessions WHERE id = ?").get(sessionId);
    },

    consumeAuthSession(sessionId) {
      db.prepare("UPDATE auth_sessions SET consumed = 1 WHERE id = ?").run(sessionId);
    },

    userExists(userId) {
      return Boolean(db.prepare("SELECT 1 FROM users WHERE id = ?").get(userId));
    },

    createUser(displayName) {
      const userId = `u_${crypto.randomUUID()}`;
      db.prepare(
        "INSERT INTO users (id, display_name, created_at) VALUES (?, ?, ?)",
      ).run(userId, displayName, nowIso());
      upsertDashboardForUser(db, userId, getDefaultDashboard(db));
      return userId;
    },

    issueToken(userId) {
      const token = crypto.randomBytes(32).toString("base64url");
      db.prepare("INSERT INTO tokens (token, user_id, created_at) VALUES (?, ?, ?)").run(
        token,
        userId,
        nowIso(),
      );
      return token;
    },

    getUserIdForToken(token) {
      const row = db
        .prepare("SELECT user_id FROM tokens WHERE token = ?")
        .get(token);
      return row?.user_id ?? null;
    },

    getDashboard(userId) {
      let row = db
        .prepare("SELECT * FROM dashboard_state WHERE user_id = ?")
        .get(userId);
      if (!row) {
        upsertDashboardForUser(db, userId, getDefaultDashboard(db));
        row = db.prepare("SELECT * FROM dashboard_state WHERE user_id = ?").get(userId);
      }
      
      const dashboard = rowToDashboard(row);
      const activityRow = db
        .prepare(
          "SELECT id, activity_type, start_time FROM activities WHERE user_id = ? AND state = 'running' ORDER BY start_time DESC LIMIT 1"
        )
        .get(userId);

      if (activityRow) {
        dashboard.currentActivity = {
          activityId: activityRow.id,
          activityType: activityRow.activity_type,
          startTime: activityRow.start_time,
        };
      }
      return dashboard;
    },

    updateDashboard(userId, dashboard) {
      upsertDashboardForUser(db, userId, dashboard);
      return this.getDashboard(userId);
    },

    getLeaderboard(userId) {
      const defaultDashboard = getDefaultDashboard(db);
      const quartiers = db
        .prepare(
          `
            SELECT id, name, co2_saved_kg AS co2SavedKg, rank
            FROM leaderboard_quartiers
            ORDER BY rank ASC
          `,
        )
        .all();
      const userRows = db
        .prepare(
          `
            SELECT
              u.id,
              u.display_name AS displayName,
              COALESCE(SUM(a.co2_saved_kg), 0) AS score
            FROM users u
            LEFT JOIN activities a
              ON a.user_id = u.id AND a.state = 'stopped'
            GROUP BY u.id
            ORDER BY score DESC, displayName ASC
          `,
        )
        .all();
      const users = userRows.map((row, index) => ({
        user: { id: row.id, displayName: row.displayName },
        score: Number(Number(row.score ?? 0).toFixed(3)),
        rank: index + 1,
        isMe: userId ? row.id === userId : undefined,
      }));

      return {
        streakDays: defaultDashboard.streakDays ?? 0,
        quartiers,
        users,
      };
    },

    listShopItems(userId) {
      const rows = db
        .prepare(
          `
            SELECT
              s.id,
              s.name,
              s.price_coins AS priceCoins,
              s.category,
              s.asset_path AS assetPath,
              CASE WHEN uo.user_id IS NULL THEN 0 ELSE 1 END AS owned
            FROM shop_items s
            LEFT JOIN user_shop_ownership uo
              ON uo.item_id = s.id AND uo.user_id = ?
            ORDER BY s.id ASC
          `,
        )
        .all(userId);
      return rows.map((row) => ({ ...row, owned: Boolean(row.owned) }));
    },

    purchaseItem(userId, itemId) {
      const item = db
        .prepare("SELECT * FROM shop_items WHERE id = ?")
        .get(itemId);
      if (!item) {
        return { notFound: true };
      }

      const dashboard = this.getDashboard(userId);
      if (dashboard.lion.coins < item.price_coins) {
        return { notFound: false, insufficientFunds: true };
      }

      db.prepare(
        "INSERT OR IGNORE INTO user_shop_ownership (user_id, item_id) VALUES (?, ?)",
      ).run(userId, itemId);

      if (!dashboard.lion.accessories.includes(itemId)) {
        dashboard.lion.accessories = [...dashboard.lion.accessories, itemId];
      }
      dashboard.lion.coins = Math.max(0, dashboard.lion.coins - item.price_coins);
      upsertDashboardForUser(db, userId, dashboard);

      return { notFound: false, insufficientFunds: false };
    },

    listUsers() {
      const rows = db
        .prepare(
          `
            SELECT
              u.id,
              u.display_name AS displayName,
              COALESCE(ds.streak_days, 0) AS streakDays,
              COALESCE(SUM(a.co2_saved_kg), 0) AS co2SavedKg
            FROM users u
            LEFT JOIN dashboard_state ds
              ON ds.user_id = u.id
            LEFT JOIN activities a
              ON a.user_id = u.id AND a.state = 'stopped'
            GROUP BY u.id
            ORDER BY displayName ASC
          `,
        )
        .all();
      return rows.map((row) => ({
        id: row.id,
        displayName: row.displayName,
        streakDays: Number(row.streakDays ?? 0),
        co2SavedKg: Number(Number(row.co2SavedKg ?? 0).toFixed(3)),
      }));
    },

    pokeUser(userId, targetUserId) {
      const target = db.prepare("SELECT 1 FROM users WHERE id = ?").get(targetUserId);
      if (!target) {
        return false;
      }
      db.prepare(
        "INSERT INTO pokes (user_id, target_user_id, created_at) VALUES (?, ?, ?)",
      ).run(userId, targetUserId, nowIso());
      return true;
    },

    getAsset(assetId) {
      return (
        db
          .prepare("SELECT id, url, category FROM assets WHERE id = ?")
          .get(assetId) ?? null
      );
    },

    listAssets(ids) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return db
          .prepare("SELECT id, url, category FROM assets ORDER BY id ASC")
          .all();
      }
      const placeholders = ids.map(() => "?").join(", ");
      const rows = db
        .prepare(
          `SELECT id, url, category FROM assets WHERE id IN (${placeholders})`,
        )
        .all(...ids);
      const byId = new Map(rows.map((row) => [row.id, row]));
      return ids.map((id) => byId.get(id)).filter(Boolean);
    },

    startActivity(userId, { activityType, startTime }) {
      if (!ACTIVITY_TYPES.has(activityType)) {
        throw new Error("Invalid activityType");
      }
      const result = db
        .prepare(
          `
            INSERT INTO activities (
              user_id, activity_type, state, start_time, duration_seconds, xp_earned, co2_saved_kg
            ) VALUES (?, ?, 'running', ?, 0, 0, 0)
          `,
        )
        .run(userId, activityType, startTime);
      return Number(result.lastInsertRowid);
    },

    stopActivity(userId, { activityId, stopTime, gpx, proofs }) {
      const activity = db
        .prepare("SELECT * FROM activities WHERE id = ? AND user_id = ?")
        .get(activityId, userId);
      if (!activity) {
        return null;
      }

      const startMs = Date.parse(activity.start_time);
      const stopMs = Date.parse(stopTime);
      const durationSeconds = Number.isNaN(startMs) || Number.isNaN(stopMs)
        ? 0
        : Math.max(0, Math.floor((stopMs - startMs) / 1000));

      const distanceMeters = estimateDistanceMeters(activity.activity_type, durationSeconds);
      const xpEarned = Math.max(0, Math.round(durationSeconds / 60));
      const co2SavedKg = estimateCo2SavedKg(activity.activity_type, distanceMeters);

      db.prepare(
        `
          UPDATE activities
          SET
            state = 'stopped',
            stop_time = ?,
            duration_seconds = ?,
            distance_meters = ?,
            xp_earned = ?,
            co2_saved_kg = ?,
            gpx_json = ?,
            proofs_json = ?
          WHERE id = ? AND user_id = ?
        `,
      ).run(
        stopTime,
        durationSeconds,
        distanceMeters,
        xpEarned,
        co2SavedKg,
        gpx === undefined ? activity.gpx_json : JSON.stringify(gpx),
        proofs === undefined ? activity.proofs_json : JSON.stringify(proofs),
        activityId,
        userId,
      );

      return this.getActivity(userId, activityId);
    },

    getActivity(userId, activityId) {
      const row = db
        .prepare("SELECT * FROM activities WHERE id = ? AND user_id = ?")
        .get(activityId, userId);
      return row ? mapActivityRow(row) : null;
    },

    listActivities(userId) {
      const rows = db
        .prepare(
          `
            SELECT
              id,
              activity_type,
              state,
              start_time,
              stop_time,
              duration_seconds,
              distance_meters,
              xp_earned,
              co2_saved_kg
            FROM activities
            WHERE user_id = ?
            ORDER BY start_time DESC
          `,
        )
        .all(userId);
      return rows.map((row) => ({
        activityId: row.id,
        activityType: row.activity_type,
        state: row.state,
        startTime: row.start_time,
        stopTime: row.stop_time ?? undefined,
        durationSeconds: row.duration_seconds ?? 0,
        distanceMeters:
          typeof row.distance_meters === "number" ? row.distance_meters : undefined,
        xpEarned: row.xp_earned ?? 0,
        co2SavedKg: row.co2_saved_kg ?? 0,
      }));
    },

    resetReferenceData() {
      db.prepare("DELETE FROM user_shop_ownership").run();
      seedAssets(db, DEFAULT_ASSETS);
      seedLeaderboardQuartiers(db, DEFAULT_LEADERBOARD.quartiers);
      seedShopItems(db, DEFAULT_SHOP_ITEMS);
      setDefaultDashboard(db, DEFAULT_DASHBOARD);

      const users = db.prepare("SELECT id FROM users").all();
      for (const user of users) {
        upsertDashboardForUser(db, user.id, DEFAULT_DASHBOARD);
      }
    },

    seedFromPayload(payload) {
      const data = payload && typeof payload === "object" ? payload : {};

      if (Array.isArray(data.assets)) {
        seedAssets(db, data.assets);
      }
      if (Array.isArray(data.shopItems)) {
        seedShopItems(db, data.shopItems);
      }
      if (Array.isArray(data.users)) {
        seedUsers(db, data.users);
      } else if (Array.isArray(data.leaderboard?.users)) {
        const mappedUsers = data.leaderboard.users
          .map((entry) => ({
            id: entry?.user?.id,
            displayName: entry?.user?.displayName,
            streakDays: 0,
            co2SavedKg: entry?.score ?? 0,
          }))
          .filter((entry) => entry.id && entry.displayName);
        seedUsers(db, mappedUsers);
      }
      if (Array.isArray(data.leaderboard?.quartiers)) {
        seedLeaderboardQuartiers(db, data.leaderboard.quartiers);
      }
      if (data.dashboard && typeof data.dashboard === "object") {
        setDefaultDashboard(db, data.dashboard);
        const users = db.prepare("SELECT id FROM users").all();
        for (const user of users) {
          upsertDashboardForUser(db, user.id, data.dashboard);
        }
      }
    },
  };
}
