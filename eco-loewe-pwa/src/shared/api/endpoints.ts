import { apiClient } from "./client";
import type { 
    UserDTO, 
    StartActivityRequestDTO, 
    StartActivityResponseDTO, 
    StopActivityRequestDTO, 
    StopActivityResponseDTO,
    ActivityType
} from "./types";

export const api = {
    auth: {
        ensureAuth: () => apiClient.ensureAuth(),
    },
    dashboard: {
        get: () => apiClient.get<UserDTO>("/v1/dashboard"),
    },
    activity: {
        start: (type: ActivityType) => {
            const body: StartActivityRequestDTO = {
                activityType: type,
                startTime: new Date().toISOString()
            };
            return apiClient.post<StartActivityResponseDTO>("/v1/activity/start", body);
        },
        stop: (activityId: number) => {
            const body: StopActivityRequestDTO = {
                activityId,
                stopTime: new Date().toISOString()
            };
            return apiClient.post<StopActivityResponseDTO>("/v1/activity/stop", body);
        },
        get: (activityId: number) => apiClient.get(`/v1/activity/${activityId}`),
    },
    assets: {
        get: (id: string) => apiClient.get(`/v1/assets/${id}`),
    }
};
