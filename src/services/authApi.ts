import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Helper to determine the backend API base URL
export const getApiBaseUrl = (): string => {
  // Web: Sử dụng hostname hiện tại của trình duyệt (localhost / 127.0.0.1 / IP LAN)
  if (Platform.OS === 'web') {
    const hostname =
      typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
    return `http://${hostname}:6001/api`;
  }

  // If running via Expo Go / dev client, connect to the host machine IP
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:6001/api`;
  }

  // Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:6001/api';
  }

  // iOS Simulator / fallback
  return 'http://localhost:6001/api';
};

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
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await response.json();

      if (!response.ok) {
        const errorMsg =
          json.message ||
          (json.errors && json.errors[0]?.message) ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu!';
        throw new Error(errorMsg);
      }

      return json;
    } catch (error: any) {
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error(
          `Không thể kết nối tới máy chủ backend (${baseUrl}). Hãy đảm bảo backend đang chạy!`
        );
      }
      throw error;
    }
  },

  // Register new account
  register: async ({ full_name, email, password }: RegisterParams): Promise<any> => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: full_name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        const errorMsg =
          json.message ||
          (json.errors && json.errors[0]?.message) ||
          'Đăng ký thất bại. Vui lòng thử lại!';
        throw new Error(errorMsg);
      }

      return json;
    } catch (error: any) {
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error(`Không thể kết nối tới máy chủ backend (${baseUrl})`);
      }
      throw error;
    }
  },

  // Get current authenticated user
  getMe: async (token: string): Promise<UserData> => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Không thể lấy thông tin người dùng');
    }
    return json.data;
  },

  // Logout
  logout: async (token?: string, refreshToken?: string): Promise<void> => {
    const baseUrl = getApiBaseUrl();
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ access_token: token, refresh_token: refreshToken }),
      });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
  },
};
