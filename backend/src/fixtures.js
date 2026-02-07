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

export const DEFAULT_FRIENDS = [
  { id: "p1", name: "Paul", co2SavedKg: 95, streakDays: 6 },
  { id: "p2", name: "Alex", co2SavedKg: 80, streakDays: 4 },
  { id: "p3", name: "Sarah", co2SavedKg: 70, streakDays: 7 },
  { id: "p4", name: "Lisa", co2SavedKg: 62, streakDays: 3 },
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
  friends: DEFAULT_FRIENDS,
};

export const DEFAULT_SHOP_ITEMS = [
  {
    id: "hat-cap",
    name: "Basecap",
    priceCoins: 50,
    category: "hats",
    assetPath: "/assets/articles/hats/cap/cap_icon.png",
  },
  {
    id: "hat-detective",
    name: "Detektiv-Hut",
    priceCoins: 120,
    category: "hats",
    assetPath: "/assets/articles/hats/detective_hat/detective_hat_icon.png",
  },
  {
    id: "hat-birthday",
    name: "Party-Hut",
    priceCoins: 80,
    category: "hats",
    assetPath: "/assets/articles/hats/birthday_hat/birthday_hat_icon.png",
  },
  {
    id: "hat-fedora",
    name: "Fedora",
    priceCoins: 150,
    category: "hats",
    assetPath: "/assets/articles/hats/fedora/fedora_icon.png",
  },
  {
    id: "outfit-scarf",
    name: "Schal",
    priceCoins: 30,
    category: "scarfs",
    assetPath: "/assets/articles/scarfs/FC_Winterthur_scarf/scarf_icon.png",
  },
];
