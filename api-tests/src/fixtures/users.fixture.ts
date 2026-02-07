import type { UserListEntryDTO } from "../contracts/types.ts";

export const users: UserListEntryDTO[] = [
  { id: "p1", displayName: "Paul", co2SavedKg: 95, streakDays: 6 },
  { id: "p2", displayName: "Alex", co2SavedKg: 80, streakDays: 4 },
  { id: "p3", displayName: "Sarah", co2SavedKg: 70, streakDays: 7 },
  { id: "p4", displayName: "Lisa", co2SavedKg: 62, streakDays: 3 },
];
