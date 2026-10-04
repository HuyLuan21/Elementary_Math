import { apiClient, getApiBaseUrl, setAuthToken, onAuthFailure } from "./axios";

export { getApiBaseUrl, setAuthToken, onAuthFailure };

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
  pin_enabled: boolean;
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

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  full_name: string;
  email: string;
  password: string;
}

export interface PinSetupResponse {
  data: {
    pin_enabled: boolean;
  };
}

export interface PinVerifyResponse {
  data: {
    verified: boolean;
  };
}

export const authApi = {
  // Đăng nhập bằng Email & Mật khẩu
  login: async ({ email, password }: LoginParams): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email: email.trim(),
      password,
    });
    return response.data;
  },

  // Đăng ký tài khoản phụ huynh mới
  register: async ({
    full_name,
    email,
    password,
  }: RegisterParams): Promise<unknown> => {
    const response = await apiClient.post("/auth/register", {
      full_name: full_name.trim(),
      email: email.trim(),
      password,
    });
    return response.data;
  },

  // Làm mới Access Token thông qua Refresh Token
  refreshToken: async (token: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      { refresh_token: token },
      { headers: { "x-refresh-token": token } }
    );
    return response.data;
  },

  // Thiết lập mã PIN phụ huynh
  setPin: async (pin: string): Promise<PinSetupResponse> => {
    const response = await apiClient.post<PinSetupResponse>("/auth/pin/setup", {
      pin,
    });
    return response.data;
  },

  // Xác thực mã PIN phụ huynh
  verifyPin: async (pin: string): Promise<boolean> => {
    const response = await apiClient.post<PinVerifyResponse>("/auth/pin/verify", {
      pin,
    });
    return response.data.data.verified;
  },

  // Lấy thông tin tài khoản hiện tại từ backend (/auth/me)
  getMe: async (token?: string): Promise<UserData> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ data: UserData }>("/auth/me", {
      headers,
    });
    return response.data.data;
  },

  // Đăng xuất và vô hiệu hóa token trên backend
  logout: async (token?: string, refreshToken?: string): Promise<void> => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await apiClient.post(
        "/auth/logout",
        { access_token: token, refresh_token: refreshToken },
        { headers }
      );
    } catch (e) {
      console.warn("Logout API error:", e);
    }
  },
};
