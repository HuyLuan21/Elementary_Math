import { apiClient, getApiBaseUrl, setAuthToken } from "./axios";

export { getApiBaseUrl, setAuthToken };

export interface UserData {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  nickname?: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  is_active?: boolean;
}

export interface LoginResponse {
  data: UserData;
  access_token?: string;
  refresh_token?: string;
  meta?: {
    auth_challenge_id?: string;
  };
  message?: string;
}

export interface LoginParams {
  email: string;
  password?: string;
}

export interface RegisterParams {
  full_name: string;
  email: string;
  password?: string;
}

export const authApi = {
  // Login with Email & Password
  login: async ({ email, password }: LoginParams): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email: email.trim(),
      password,
    });
    return response.data;
  },

  // Register new account
  register: async ({
    full_name,
    email,
    password,
  }: RegisterParams): Promise<any> => {
    const response = await apiClient.post("/auth/register", {
      full_name: full_name.trim(),
      email: email.trim(),
      password,
    });
    return response.data;
  },

  // Get current authenticated user
  getMe: async (token?: string): Promise<UserData> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ data: UserData }>("/auth/me", {
      headers,
    });
    return response.data.data;
  },

  // Logout
  logout: async (token?: string, refreshToken?: string): Promise<void> => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await apiClient.post(
        "/auth/logout",
        { access_token: token, refresh_token: refreshToken },
        { headers },
      );
    } catch (e) {
      console.warn("Logout API error:", e);
    }
  },
};
