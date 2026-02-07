// ---------------------------------------------------------------------------
// Contract types – copied from eco-loewe-pwa/src/shared/api/types.ts
//
// This IS the contract. If this file differs from the frontend types,
// that's a bug that needs resolution.
// ---------------------------------------------------------------------------

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
    accessories: string[];
    coins: number;
  };
  currentActivity?: {
    activityId: number;
    activityType: ActivityType;
    startTime: string;
  };
}

export interface AssetDTO {
  id: string;
  url: string; // e.g. "/assets/shop/hat-cap.png"
  category: "glasses" | "hats" | "scarfs" | "earrings" | "outfits" | "decor";
}

export interface LeaderboardDTO {
  streakDays: number;
  quartiers: Array<{
    id: string;
    name: string;
    co2SavedKg: number;
    rank: number;
  }>;
  users: UserScoreEntryDTO[];
  friends: UserScoreEntryDTO[];
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

export interface ShopItemDTO {
  id: string;
  name: string;
  priceCoins: number;
  category: "hats" | "outfits" | "accessories" | "decor" | "scarfs";
  owned: boolean;
  assetPath: string;
}

export interface PurchaseDTO {
  itemId: string;
}

export interface UserListEntryDTO {
  id: string;
  displayName: string;
  streakDays: number;
  co2SavedKg: number;
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
