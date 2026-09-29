import { getApiBaseUrl } from './authApi';

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

export interface CreateProfileParams {
  display_name: string;
  avatar_url?: string;
  birth_date?: string;
}

export const profileApi = {
  // Lấy danh sách hồ sơ của user hiện tại
  getProfiles: async (token: string): Promise<ApiProfileData[]> => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/profiles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Không thể tải danh sách hồ sơ');
    }
    return json.data || [];
  },

  // Tạo hồ sơ mới cho bé
  createProfile: async (token: string, data: CreateProfileParams): Promise<ApiProfileData> => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Không thể tạo hồ sơ mới');
    }
    return json.data;
  },

  // Cập nhật hồ sơ bé
  updateProfile: async (
    token: string,
    profileId: string,
    data: Partial<CreateProfileParams>
  ): Promise<ApiProfileData> => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/profiles/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Không thể cập nhật hồ sơ');
    }
    return json.data;
  },

  // Xóa hồ sơ bé
  deleteProfile: async (token: string, profileId: string): Promise<void> => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/profiles/${profileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Không thể xóa hồ sơ');
    }
  },
};
