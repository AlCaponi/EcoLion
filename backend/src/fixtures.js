export const DEFAULT_DASHBOARD = {
  sustainabilityScore: 78.5,
  streakDays: 8,
  today: { walkKm: 2.3, ptTrips: 1, carKm: 0 },
  lion: {
    mood: "happy",
    activityMode: "walking",
    accessories: ["hat-cap", "acc-sunglasses"],
    coins: 85,
  },
};

export const DEFAULT_ASSETS = [
  { id: "hat-cap", url: "/assets/shop/hat-cap.png", category: "hats" },
  { id: "hat-tophat", url: "/assets/shop/hat-tophat.png", category: "hats" },
  {
    id: "acc-sunglasses",
    url: "/assets/shop/acc-sunglasses.png",
    category: "glasses",
  },
  {
    id: "acc-monocle",
    url: "/assets/shop/acc-monocle.png",
    category: "glasses",
  },
  { id: "scarf-wool", url: "/assets/shop/scarf-wool.png", category: "scarfs" },
  {
    id: "earring-gold",
    url: "/assets/shop/earring-gold.png",
    category: "earrings",
  },
  {
    id: "outfit-scarf",
    url: "/assets/shop/outfit-scarf.png",
    category: "outfits",
  },
  { id: "decor-plant", url: "/assets/shop/decor-plant.png", category: "decor" },
];

export const DEFAULT_USERS = [
  { id: "p1", displayName: "Paul", co2SavedKg: 95, streakDays: 6 },
  { id: "p2", displayName: "Alex", co2SavedKg: 80, streakDays: 4 },
  { id: "p3", displayName: "Sarah", co2SavedKg: 70, streakDays: 7 },
  { id: "p4", displayName: "Lisa", co2SavedKg: 62, streakDays: 3 },
];

export const DEFAULT_LEADERBOARD = {
  streakDays: 8,
  quartiers: [
    { id: "seen", name: "Seen", co2SavedKg: 520, rank: 1 },
    { id: "hegi", name: "Hegi", co2SavedKg: 480, rank: 2 },
    { id: "toss", name: "Toess", co2SavedKg: 470, rank: 3 },
    { id: "oberi", name: "Oberwinterthur", co2SavedKg: 430, rank: 4 },
    { id: "wuefl", name: "Wuelflingen", co2SavedKg: 410, rank: 5 },
    { id: "matt", name: "Mattenbach", co2SavedKg: 390, rank: 6 },
    { id: "velt", name: "Veltheim", co2SavedKg: 370, rank: 7 },
  ],
};

export const DEFAULT_SHOP_ITEMS = [
  {
    id: "hat-cap",
    name: "Basecap",
    priceCoins: 50,
    category: "hats",
    assetPath: "/assets/shop/hat-cap.png",
  },
  {
    id: "hat-tophat",
    name: "Zylinder",
    priceCoins: 120,
    category: "hats",
    assetPath: "/assets/shop/hat-tophat.png",
  },
  {
    id: "outfit-scarf",
    name: "Schal",
    priceCoins: 30,
    category: "outfits",
    assetPath: "/assets/shop/outfit-scarf.png",
  },
  {
    id: "acc-sunglasses",
    name: "Sonnenbrille",
    priceCoins: 40,
    category: "accessories",
    assetPath: "/assets/shop/acc-sunglasses.png",
  },
  {
    id: "decor-plant",
    name: "Pflanze",
    priceCoins: 25,
    category: "decor",
    assetPath: "/assets/shop/decor-plant.png",
  },
];
