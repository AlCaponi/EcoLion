export type MobilityMode = "walk" | "pt" | "car";

export interface PublicKeyCredentialDescriptorDTO {
  type: "public-key";
  id: string;
  transports?: string[];
}

export interface PublicKeyCredentialCreationOptionsDTO {
  challenge: string;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key";
    alg: number;
  }>;
  timeout: number;
  attestation: "none" | "direct" | "indirect" | "enterprise";
  authenticatorSelection?: {
    residentKey?: "required" | "preferred" | "discouraged";
    requireResidentKey?: boolean;
    userVerification?: "required" | "preferred" | "discouraged";
  };
  excludeCredentials?: PublicKeyCredentialDescriptorDTO[];
}

export interface PublicKeyCredentialRequestOptionsDTO {
  challenge: string;
  rpId: string;
  timeout: number;
  userVerification?: "required" | "preferred" | "discouraged";
  allowCredentials?: PublicKeyCredentialDescriptorDTO[];
}

export interface WebAuthnRegistrationCredentialDTO {
  id: string;
  rawId: string;
  type: "public-key";
  response: {
    clientDataJSON: string;
    attestationObject?: string;
    authenticatorData: string;
    publicKey: string;
    publicKeyAlgorithm: number;
    transports?: string[];
    userHandle?: string;
  };
}

export interface WebAuthnAuthenticationCredentialDTO {
  id: string;
  rawId: string;
  type: "public-key";
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
}

export interface PasskeyRegisterBeginRequestDTO {
  displayName: string;
}

export interface PasskeyRegisterBeginResponseDTO {
  sessionId: string;
  challenge: string;
  publicKey: PublicKeyCredentialCreationOptionsDTO;
}

export interface PasskeyRegisterFinishRequestDTO {
  sessionId: string;
  credential: WebAuthnRegistrationCredentialDTO | string;
}

export interface PasskeyRegisterFinishResponseDTO {
  userId: string;
  token: string;
}

export interface PasskeyLoginBeginRequestDTO {
  userId?: string;
}

export interface PasskeyLoginBeginResponseDTO {
  sessionId: string;
  challenge: string;
  publicKey: PublicKeyCredentialRequestOptionsDTO;
}

export interface PasskeyLoginFinishRequestDTO {
  sessionId: string;
  credential: WebAuthnAuthenticationCredentialDTO | string;
}

export interface PasskeyLoginFinishResponseDTO {
  userId?: string;
  token: string;
}

export interface WhoAmIDTO {
  id: string;
  displayName: string;
}

export interface UserDTO {
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
  isMe?: boolean; // the user's own quartier
}

export interface UserSummaryDTO {
  id: string;
  displayName: string;
}

export interface AddFriendRequestDTO {
  userId: string;
}

export interface AddFriendResponseDTO {
  ok: true;
  friend: UserSummaryDTO;
}

export interface UserScoreEntryDTO {
  user: UserSummaryDTO;
  score: number;
  rank: number;
  isMe?: boolean;
}

export interface LeaderboardDTO {
  streakDays: number;
  quartiers: QuartierEntry[];
  users: UserScoreEntryDTO[];
  friends: UserScoreEntryDTO[];
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

export interface EquipDTO {
  itemId: string;
}

export interface BuyCoinDTO {
  amount: number; // e.g. 100 coins
  paymentMethod: "card" | "paypal"; // payment method
}

export interface BuyCoinResponseDTO {
  transactionId: string;
  coinsAdded: number;
  newBalance: number;
}

export interface FriendDTO {
  id: string;
  displayName: string;
  streakDays: number;
  co2SavedKg: number;
}

/* ── Rewards ──────────────────────────────────── */

export type QuestFrequency = "daily" | "weekly";

export interface QuestDTO {
  id: string;
  title: string;
  description: string;
  frequency: QuestFrequency;
  progress: number; // current progress (e.g. 2)
  goal: number; // target (e.g. 5)
  rewardCoins: number;
  rewardXp: number;
  completed: boolean; // goal reached this period
  claimed: boolean; // reward already collected
  icon: string; // emoji
  resetsAt: string; // ISO timestamp when quest resets
}

export interface MilestoneDTO {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  rewardId: string; // links to a RewardDTO
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export type RewardCategory = "gastro" | "mobility" | "culture" | "sport" | "shopping";

export interface RewardDTO {
  id: string;
  title: string;
  description: string;
  partner: string; // e.g. "Stadtbus Winterthur"
  category: RewardCategory;
  icon: string;
  claimed: boolean;
  claimedAt?: string; // ISO timestamp
  expiresAt?: string; // ISO timestamp
  code?: string; // discount code shown after claim
}

export interface RewardsPageDTO {
  quests: QuestDTO[];
  milestones: MilestoneDTO[];
  rewards: RewardDTO[];
}

export type ActivityType = "walk" | "bike" | "transit" | "drive" | "wfh" | "pool";
export type ActivityState = "running" | "paused" | "stopped";

export interface StartActivityRequestDTO {
  activityType: ActivityType;
  startTime: string; // ISO timestamp
}

export interface StartActivityResponseDTO {
  activityId: number;
  state: ActivityState;
}

export interface ActivityListItemDTO {
  activityId: number;
  activityType: ActivityType;
  state: ActivityState;
  startTime: string;
  stopTime?: string;
  durationSeconds: number;
  distanceMeters?: number;
  xpEarned: number;
  co2SavedKg: number;
}

export interface StopActivityRequestDTO {
  activityId: number;
  stopTime: string; // ISO timestamp
  gpx?: unknown; // optional tracking data
  proofs?: object[]; // optional activity proofs like QR scans, pictures etc.
}

export interface StopActivityResponseDTO {
  activityId: number;
  state: ActivityState;
  durationSeconds: number;
  distanceMeters?: number;
  xpEarned: number;
  co2SavedKg: number;
  gpx?: unknown;
  proofs?: object[];
}

export interface GetActivityResponseDTO {
  activityId: number;
  state: ActivityState;
  durationSeconds: number;
  distanceMeters?: number;
  xpEarned: number;
  co2SavedKg: number;
  gpx?: unknown;
  proofs?: object[];
}

export interface BuyCoinDTO {
  amount: number;
  paymentMethod: "card" | "paypal";
}

export interface BuyCoinResponseDTO {
  transactionId: string;
  coinsAdded: number;
  newBalance: number;
}

export interface UserListEntryDTO {
  id: string;
  displayName: string;
  streakDays: number;
  co2SavedKg: number;
}