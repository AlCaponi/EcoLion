export type MobilityMode = "walk" | "pt" | "car";

export interface DashboardDTO {
  sustainabilityScore: number;
  streakDays: number;
  today: { walkKm: number; ptTrips: number; carKm: number };
  lion: {
    mood: "sad" | "neutral" | "happy";
    activityMode: "sleeping" | "idle" | "walking" | "riding";
    accessories: string[]; // equipped item IDs, e.g. ["hat-cap", "acc-sunglasses"]
    coins: number;
  };
}

export interface AssetDTO {
  id: string;
  url: string; // e.g. "/assets/shop/hat-cap.png"
  category: "glasses" | "hats" | "scarfs" | "earrings" | "outfits" | "decor";
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  co2SavedKg: number;
  rank: number;
  isMe?: boolean;
}

export interface QuartierEntry {
  id: string;
  name: string;
  co2SavedKg: number;
  rank: number;
  isMe?: boolean;           // the user's own quartier
}

export interface LeaderboardDTO {
  streakDays: number;
  quartiers: QuartierEntry[];
  friends: LeaderboardEntry[];
  city: LeaderboardEntry[];  // city-wide ranking (all users)
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
