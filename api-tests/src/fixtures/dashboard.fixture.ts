import type { DashboardDTO } from "../contracts/types.ts";

export const dashboard: DashboardDTO = {
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
