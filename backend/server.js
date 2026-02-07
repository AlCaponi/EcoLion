const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

// In-memory data store
const users = {}; // userId -> { stats, items }
const activities = {}; // activityId -> data
let activityIdCounter = 1;

// Helper to get or create user
const getUser = (userId) => {
    if (!users[userId]) {
        users[userId] = {
            id: userId,
            sustainabilityScore: 120, // XP
            streakDays: 8,
            today: { walkKm: 1.2, ptTrips: 2, carKm: 0 },
            lion: {
                mood: "happy",
                activityMode: "idle",
                accessories: [],
                coins: 85
            },
            inventory: [],
            friends: [
                { id: "f1", name: "Anna", streakDays: 12, co2SavedKg: 45 },
                { id: "f2", name: "Tom", streakDays: 3, co2SavedKg: 12 }
            ]
        };
    }
    return users[userId];
};

// --- AUTH ---

app.post('/v1/auth/register/begin', (req, res) => {
    const { displayName } = req.body;
    res.json({
        sessionId: `sess-${Date.now()}`,
        challenge: `challenge-${Date.now()}`
    });
});

app.post('/v1/auth/register/finish', (req, res) => {
    // Mock registration - accept any valid flow
    const userId = `user-${Date.now()}`;
    // Initialize user data
    getUser(userId);
    
    res.json({
        userId: userId,
        token: `mock-token-${userId}`
    });
});

app.post('/v1/auth/login/begin', (req, res) => {
    res.json({
        sessionId: `sess-${Date.now()}`,
        challenge: `challenge-${Date.now()}`
    });
});

app.post('/v1/auth/login/finish', (req, res) => {
    res.json({
        token: `mock-token-returning-user`
    });
});

// --- MIDDLEWARE to simulate auth ---
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    // In a real app, verify token. Here we just extract userId from mock token if present
    // or default to a "demo-user" if we want to support unauth (but client sends token now)
    
    // For simplicity in this mock, valid token = demo-user context unless it has a specific ID
    req.userId = "demo-user"; 
    if (authHeader && authHeader.startsWith("Bearer mock-token-user-")) {
        req.userId = authHeader.replace("Bearer mock-token-", "");
    }
    next();
});

// --- DASHBOARD ---

app.get('/v1/dashboard', (req, res) => {
    const user = getUser(req.userId);
    res.json({
        sustainabilityScore: user.sustainabilityScore,
        streakDays: user.streakDays,
        today: user.today,
        lion: user.lion
    });
});

// --- ACTIVITY ---

app.post('/v1/activity/start', (req, res) => {
    const { activityType, startTime } = req.body;
    const activityId = activityIdCounter++;
    
    activities[activityId] = {
        activityId,
        userId: req.userId,
        type: activityType,
        startTime,
        state: "running",
        durationSeconds: 0,
        xpEarned: 0,
        co2SavedKg: 0
    };

    // Update lion status
    const user = getUser(req.userId);
    const modeMap = { walk: "walking", bike: "riding", drive: "riding", "pt": "riding" }; // simplified
    // Only update if mapping exists, else 'idle' or keep current?
    // For now, let's keep it simple.
    // user.lion.activityMode = modeMap[activityType] || "idle"; 

    res.json({
        activityId,
        state: "running"
    });
});

app.post('/v1/activity/stop', (req, res) => {
    const { activityId, stopTime } = req.body;
    const activity = activities[activityId];
    
    if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
    }

    activity.stopTime = stopTime;
    activity.state = "stopped";
    
    // Calculate dummy stats
    const start = new Date(activity.startTime).getTime();
    const end = new Date(stopTime).getTime();
    const durationSec = Math.floor((end - start) / 1000);
    
    activity.durationSeconds = durationSec;
    activity.xpEarned = Math.floor(durationSec * 0.5) + 10; // 10 base + pts per sec
    activity.co2SavedKg = parseFloat((durationSec * 0.01).toFixed(2));
    
    // Update user stats
    const user = getUser(req.userId);
    user.sustainabilityScore += activity.xpEarned;
    user.lion.coins += Math.floor(activity.xpEarned / 2);
    // user.lion.activityMode = "idle"; // Reset lion

    res.json(activity);
});

app.get('/v1/activity/:id', (req, res) => {
    const activity = activities[req.params.id];
    if (!activity) return res.status(404).json({ error: "Not found" });
    res.json(activity);
});


// --- ASSETS & SHOP ---

app.get('/v1/assets/:id', (req, res) => {
    // Mock response for any asset
    res.json({
        id: req.params.id,
        url: `/assets/shop/${req.params.id}.png`,
        category: "hats"
    });
});

app.get('/v1/assets', (req, res) => {
    // ?ids=a,b
    const ids = (req.query.ids || "").split(",");
    const assets = ids.map(id => ({
        id: id,
        url: `/assets/shop/${id}.png`,
        category: "hats"
    }));
    res.json(assets);
});

app.get('/v1/shop/items', (req, res) => {
    res.json([
        { id: "hat-cap", name: "Cool Cap", priceCoins: 50, category: "hats", owned: false, assetPath: "hats/cap.png" },
        { id: "acc-sunglasses", name: "Sunglasses", priceCoins: 30, category: "accessories", owned: true, assetPath: "acc/glasses.png" }
    ]);
});

app.post('/v1/shop/purchase', (req, res) => {
    // always succeed for mock
    res.json({});
});


// --- LEADERBOARD ---
app.get('/v1/leaderboard', (req, res) => {
    const user = getUser(req.userId);
    res.json({
        streakDays: user.streakDays,
        quartiers: [
            { id: "q1", name: "Winterthur Stadt", co2SavedKg: 12500, rank: 1 },
            { id: "q2", name: "Töss", co2SavedKg: 8900, rank: 2 }
        ],
        friends: user.friends
    });
});

app.get('/v1/friends', (req, res) => {
    const user = getUser(req.userId);
    res.json(user.friends);
});


// Start server
app.listen(PORT, () => {
    console.log(`EcoLion Backend running on port ${PORT}`);
});
