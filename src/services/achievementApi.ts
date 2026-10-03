import { apiClient } from "./axios";
import {
  ProfileAchievements,
  ProfileAchievementsResponse,
} from "../types/achievement";

export const achievementApi = {
  getProfileAchievements: async (
    profileId: string,
  ): Promise<ProfileAchievements> => {
    const response = await apiClient.get<ProfileAchievementsResponse>(
      `/profiles/${encodeURIComponent(profileId)}/achievements`,
    );
    return response.data.data;
  },
};
