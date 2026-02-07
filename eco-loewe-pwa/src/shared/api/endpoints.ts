import { apiRequest } from "./client";
import type {
  DashboardDTO,
  LeaderboardDTO,
  ShopItemDTO,
  PurchaseDTO,
  FriendDTO,
  AssetDTO,
  RewardsPageDTO
} from "./types";

export const Api = {
  dashboard: () => apiRequest<DashboardDTO>("/v1/dashboard"),
  leaderboard: () => apiRequest<LeaderboardDTO>("/v1/leaderboard"),
  shopItems: () => apiRequest<ShopItemDTO[]>("/v1/shop/items"),
  purchase: (payload: PurchaseDTO) => apiRequest<void>("/v1/shop/purchase", "POST", payload),
  friends: () => apiRequest<FriendDTO[]>("/v1/friends"),
  pokeFriend: (friendId: string) => apiRequest<void>(`/v1/friends/${friendId}/poke`, "POST"),
  asset: (id: string) => apiRequest<AssetDTO>(`/v1/assets/${id}`),
  assets: (ids: string[]) => apiRequest<AssetDTO[]>(`/v1/assets?ids=${ids.join(",")}`),
  rewards: () => apiRequest<RewardsPageDTO>("/v1/rewards"),
  claimQuest: (questId: string) => apiRequest<void>(`/v1/rewards/quests/${questId}/claim`, "POST"),
  claimMilestone: (milestoneId: string) => apiRequest<void>(`/v1/rewards/milestones/${milestoneId}/claim`, "POST"),
};
