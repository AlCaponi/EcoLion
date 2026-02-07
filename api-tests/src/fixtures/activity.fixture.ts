import type {
  StartActivityRequestDTO,
  StartActivityResponseDTO,
  StopActivityRequestDTO,
  StopActivityResponseDTO,
  GetActivityResponseDTO,
} from "../contracts/types.ts";

export const startActivityRequest: StartActivityRequestDTO = {
  activityType: "walk",
  startTime: "2023-10-27T10:00:00Z",
};

export const startActivityResponse: StartActivityResponseDTO = {
  activityId: 1,
  state: "running",
};

export const stopActivityRequest: StopActivityRequestDTO = {
  activityId: 1,
  stopTime: "2023-10-27T10:30:00Z",
};

export const stopActivityResponse: StopActivityResponseDTO = {
  activityId: 1,
  state: "stopped",
  durationSeconds: 1800,
  distanceMeters: 2400,
  xpEarned: 50,
  co2SavedKg: 0.4,
};

export const getActivityResponse: GetActivityResponseDTO = {
  activityId: 1,
  state: "stopped",
  durationSeconds: 1800,
  distanceMeters: 2400,
  xpEarned: 50,
  co2SavedKg: 0.4,
};
