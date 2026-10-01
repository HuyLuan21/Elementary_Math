import { apiClient } from "./axios";
import { ProfileInput } from "../types/auth";

export interface ApiProfileData {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  birth_date?: string | null;
  total_stars: number;
  created_at?: string;
  updated_at?: string;
}

export type CreateProfileParams = ProfileInput;

export const profileApi = {
  // Lấy danh sách hồ sơ của user hiện tại
  getProfiles: async (token?: string): Promise<ApiProfileData[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ data: ApiProfileData[] }>(
      "/profiles",
      {
        headers,
      },
    );
    return response.data?.data || [];
  },

  // Tạo hồ sơ mới cho bé
  createProfile: async (
    token: string | undefined,
    data: CreateProfileParams,
  ): Promise<ApiProfileData> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.post<{ data: ApiProfileData }>(
      "/profiles",
      data,
      {
        headers,
      },
    );
    return response.data.data;
  },

  // Cập nhật hồ sơ bé
  updateProfile: async (
    token: string | undefined,
    profileId: string,
    data: Partial<CreateProfileParams>,
  ): Promise<ApiProfileData> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.put<{ data: ApiProfileData }>(
      `/profiles/${profileId}`,
      data,
      { headers },
    );
    return response.data.data;
  },

  // Xóa hồ sơ bé
  deleteProfile: async (
    token: string | undefined,
    profileId: string,
  ): Promise<void> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    await apiClient.delete(`/profiles/${profileId}`, {
      headers,
    });
  },
};
