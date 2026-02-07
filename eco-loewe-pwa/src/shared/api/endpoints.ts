import { apiRequest } from "./client";
import type {
  DashboardDTO,
  LeaderboardDTO,
  ShopItemDTO,
  PurchaseDTO,
  FriendDTO,
  AssetDTO,
  StartActivityRequestDTO,
  StartActivityResponseDTO,
  StopActivityRequestDTO,
  StopActivityResponseDTO,
  GetActivityResponseDTO,
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
  startActivity: (payload: StartActivityRequestDTO) =>
    apiRequest<StartActivityResponseDTO>("/v1/activity/start", "POST", payload),
  stopActivity: (payload: StopActivityRequestDTO) =>
    apiRequest<StopActivityResponseDTO>("/v1/activity/stop", "POST", payload),
  getActivity: (activityId: number) =>
    apiRequest<GetActivityResponseDTO>(`/v1/activity/${activityId}`),
};
