import { apiRequest } from "./client";
import type {
  UserDTO,
  LeaderboardDTO,
  ShopItemDTO,
  PurchaseDTO,
  UserListEntryDTO,
  AssetDTO,
  RewardsPageDTO,
  StartActivityRequestDTO,
  StartActivityResponseDTO,
  StopActivityRequestDTO,
  StopActivityResponseDTO,
  GetActivityResponseDTO,
} from "./types";

export const Api = {
  dashboard: () => apiRequest<UserDTO>("/v1/dashboard"),
  leaderboard: () => apiRequest<LeaderboardDTO>("/v1/leaderboard"),
  shopItems: () => apiRequest<ShopItemDTO[]>("/v1/shop/items"),
  purchase: (payload: PurchaseDTO) => apiRequest<void>("/v1/shop/purchase", "POST", payload),
  users: () => apiRequest<UserListEntryDTO[]>("/v1/users"),
  pokeUser: (userId: string) => apiRequest<void>(`/v1/users/${userId}/poke`, "POST"),
  asset: (id: string) => apiRequest<AssetDTO>(`/v1/assets/${id}`),
  assets: (ids: string[]) => apiRequest<AssetDTO[]>(`/v1/assets?ids=${ids.join(",")}`),
  rewards: () => apiRequest<RewardsPageDTO>("/v1/rewards"),
  claimQuest: (questId: string) => apiRequest<void>(`/v1/rewards/quests/${questId}/claim`, "POST"),
  claimMilestone: (milestoneId: string) => apiRequest<void>(`/v1/rewards/milestones/${milestoneId}/claim`, "POST"),
  startActivity: (payload: StartActivityRequestDTO) =>
    apiRequest<StartActivityResponseDTO>("/v1/activity/start", "POST", payload),
  stopActivity: (payload: StopActivityRequestDTO) =>
    apiRequest<StopActivityResponseDTO>("/v1/activity/stop", "POST", payload),
  getActivity: (activityId: number) =>
    apiRequest<GetActivityResponseDTO>(`/v1/activity/${activityId}`),
};
