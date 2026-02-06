export type MobilityMode = "walk" | "pt" | "car";

export interface DashboardDTO {
  co2SavedKgThisMonth: number;
  streakDays: number;
  today: { walkKm: number; ptTrips: number; carKm: number };
  lion: { mood: "sad" | "neutral" | "happy"; level: number; coins: number; xp: number };
}

export interface LeaderboardDTO {
  streakDays: number;
  quartiers: Array<{ id: string; name: string; co2SavedKg: number; rank: number }>;
  friends: Array<{ id: string; name: string; co2SavedKg: number; streakDays: number }>;
}

export interface ShopItemDTO {
  id: string;
  name: string;
  priceCoins: number;
  category: "hats" | "outfits" | "accessories" | "decor";
  owned: boolean;
  assetPath: string; // e.g. "/assets/shop/hat-cap.png"
}

export interface PurchaseDTO {
  itemId: string;
}

export interface FriendDTO {
  id: string;
  name: string;
  streakDays: number;
  co2SavedKg: number;
}
