import { z } from "zod";

export const PublicKeyCredentialDescriptorSchema = z.object({
  type: z.literal("public-key"),
  id: z.string().min(1),
  transports: z.array(z.string().min(1)).optional(),
});

export const PublicKeyCredentialCreationOptionsSchema = z.object({
  challenge: z.string().min(1),
  rp: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    displayName: z.string().min(1),
  }),
  pubKeyCredParams: z.array(
    z.object({
      type: z.literal("public-key"),
      alg: z.number().int(),
    }),
  ).min(1),
  timeout: z.number().positive(),
  attestation: z.enum(["none", "direct", "indirect", "enterprise"]),
  authenticatorSelection: z.object({
    residentKey: z.enum(["required", "preferred", "discouraged"]).optional(),
    requireResidentKey: z.boolean().optional(),
    userVerification: z.enum(["required", "preferred", "discouraged"]).optional(),
  }).optional(),
  excludeCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
});

export const PublicKeyCredentialRequestOptionsSchema = z.object({
  challenge: z.string().min(1),
  rpId: z.string().min(1),
  timeout: z.number().positive(),
  userVerification: z.enum(["required", "preferred", "discouraged"]).optional(),
  allowCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
});

export const PasskeyRegisterBeginResponseSchema = z.object({
  sessionId: z.string().min(1),
  challenge: z.string().min(1),
  publicKey: PublicKeyCredentialCreationOptionsSchema,
});

export const PasskeyRegisterFinishResponseSchema = z.object({
  userId: z.string().min(1),
  token: z.string().min(1),
});

export const PasskeyLoginBeginResponseSchema = z.object({
  sessionId: z.string().min(1),
  challenge: z.string().min(1),
  publicKey: PublicKeyCredentialRequestOptionsSchema,
});

export const PasskeyLoginFinishResponseSchema = z.object({
  userId: z.string().min(1).optional(),
  token: z.string().min(1),
});

export const WhoAmISchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
});

export const UserSchema = z.object({
  sustainabilityScore: z.number().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  today: z.object({
    walkKm: z.number().nonnegative(),
    ptTrips: z.number().int().nonnegative(),
    carKm: z.number().nonnegative(),
  }),
  lion: z.object({
    mood: z.enum(["sad", "neutral", "happy"]),
    activityMode: z.enum(["sleeping", "idle", "walking", "riding"]),
    accessories: z.array(z.string()),
    coins: z.number().int().nonnegative(),
  }),
});

export const AssetSchema = z.object({
  id: z.string().min(1),
  url: z.string().startsWith("/"),
  category: z.enum(["glasses", "hats", "scarfs", "earrings", "outfits", "decor"]),
});

export const LeaderboardSchema = z.object({
  streakDays: z.number().int().nonnegative(),
  quartiers: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      co2SavedKg: z.number().nonnegative(),
      rank: z.number().int().positive(),
    }),
  ),
  users: z.array(
    z.object({
      user: z.object({
        id: z.string().min(1),
        displayName: z.string().min(1),
      }),
      score: z.number().nonnegative(),
      rank: z.number().int().positive(),
      isMe: z.boolean().optional(),
    }),
  ),
  friends: z.array(
    z.object({
      user: z.object({
        id: z.string().min(1),
        displayName: z.string().min(1),
      }),
      score: z.number().nonnegative(),
      rank: z.number().int().positive(),
      isMe: z.boolean().optional(),
    }),
  ),
});

export const ShopItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  priceCoins: z.number().int().positive(),
  category: z.enum(["hats", "outfits", "accessories", "decor", "scarfs"]),
  owned: z.boolean(),
  assetPath: z.string().startsWith("/"),
});

export const UserListEntrySchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  streakDays: z.number().int().nonnegative(),
  co2SavedKg: z.number().nonnegative(),
});

export const FriendSummarySchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
});

export const AddFriendRequestSchema = z.object({
  userId: z.string().min(1),
});

export const AddFriendResponseSchema = z.object({
  ok: z.literal(true),
  friend: FriendSummarySchema,
});

const ActivityTypeEnum = z.enum(["walk", "bike", "transit", "drive", "wfh", "pool"]);
const ActivityStateEnum = z.enum(["running", "paused", "stopped"]);

export const StartActivityRequestSchema = z.object({
  activityType: ActivityTypeEnum,
  startTime: z.string().datetime(),
});

export const StartActivityResponseSchema = z.object({
  activityId: z.number().int().positive(),
  state: ActivityStateEnum,
});

export const StopActivityRequestSchema = z.object({
  activityId: z.number().int().positive(),
  stopTime: z.string().datetime(),
  gpx: z.unknown().optional(),
  proofs: z.array(z.object({}).passthrough()).optional(),
});

export const ActivityListItemSchema = z.object({
  activityId: z.number().int().positive(),
  activityType: ActivityTypeEnum,
  state: ActivityStateEnum,
  startTime: z.string().datetime(),
  stopTime: z.string().datetime().optional(),
  durationSeconds: z.number().nonnegative(),
  distanceMeters: z.number().nonnegative().optional(),
  xpEarned: z.number().nonnegative(),
  co2SavedKg: z.number().nonnegative(),
});

export const StopActivityResponseSchema = z.object({
  activityId: z.number().int().positive(),
  state: ActivityStateEnum,
  durationSeconds: z.number().nonnegative(),
  distanceMeters: z.number().nonnegative().optional(),
  xpEarned: z.number().nonnegative(),
  co2SavedKg: z.number().nonnegative(),
  gpx: z.unknown().optional(),
  proofs: z.array(z.object({}).passthrough()).optional(),
});

export const GetActivityResponseSchema = z.object({
  activityId: z.number().int().positive(),
  state: ActivityStateEnum,
  durationSeconds: z.number().nonnegative(),
  distanceMeters: z.number().nonnegative().optional(),
  xpEarned: z.number().nonnegative(),
  co2SavedKg: z.number().nonnegative(),
  gpx: z.unknown().optional(),
  proofs: z.array(z.object({}).passthrough()).optional(),
});
