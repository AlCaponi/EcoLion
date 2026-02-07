import type { UserDTO } from "../contracts/types.ts";

export const dashboard: UserDTO = {
  sustainabilityScore: 78.5,
  streakDays: 8,
  today: { walkKm: 2.3, ptTrips: 1, carKm: 0 },
  lion: {
    mood: "happy",
    activityMode: "walking",
    accessories: ["hat-cap", "acc-sunglasses"],
    coins: 85,
  },
  // TODO: Only add current activity if there is one
  currentActivity: {
    activityId: 1
  },
};
