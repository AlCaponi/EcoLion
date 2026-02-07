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
  friends: [
    { id: "p1", name: "Paul", co2SavedKg: 95, streakDays: 6 },
    { id: "p2", name: "Alex", co2SavedKg: 80, streakDays: 4 },
    { id: "p3", name: "Sarah", co2SavedKg: 70, streakDays: 7 },
    { id: "p4", name: "Lisa", co2SavedKg: 62, streakDays: 3 },
  ],
};
