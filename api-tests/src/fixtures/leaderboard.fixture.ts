import type { LeaderboardDTO } from "../contracts/types.ts";

export const leaderboard: LeaderboardDTO = {
  streakDays: 8,
  quartiers: [
    { id: "seen", name: "Seen", co2SavedKg: 520, rank: 1 },
    { id: "hegi", name: "Hegi", co2SavedKg: 480, rank: 2 },
    { id: "toss", name: "Töss", co2SavedKg: 470, rank: 3 },
    { id: "oberi", name: "Oberwinterthur", co2SavedKg: 430, rank: 4 },
    { id: "wuefl", name: "Wülflingen", co2SavedKg: 410, rank: 5 },
    { id: "matt", name: "Mattenbach", co2SavedKg: 390, rank: 6 },
    { id: "velt", name: "Veltheim", co2SavedKg: 370, rank: 7 },
  ],
  users: [
    {
      user: { id: "u1", displayName: "Ada" },
      score: 120.5,
      rank: 1,
    },
    {
      user: { id: "u2", displayName: "Linus" },
      score: 98.2,
      rank: 2,
    },
    {
      user: { id: "u3", displayName: "Mina" },
      score: 65.0,
      rank: 3,
    },
  ],
  friends: [
    {
      user: { id: "u2", displayName: "Linus" },
      score: 98.2,
      rank: 1,
    },
  ],
};
