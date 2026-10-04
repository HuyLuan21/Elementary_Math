import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'emath_access_token';
const REFRESH_TOKEN_KEY = 'emath_refresh_token';

// Bộ nhớ đệm In-Memory để tăng tốc độ truy xuất đồng bộ cho Axios request
let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let isInitialized = false;

/**
 * Storage an toàn đa nền tảng cho Authentication Tokens:
 * - Mobile (iOS / Android): Sử dụng expo-secure-store (lưu trữ mã hóa phần cứng Keychain / Keystore)
 * - Web: Sử dụng window.localStorage
 */
export const authStorage = {
  /**
   * Khởi tạo cache từ storage bền vững
   */
  init: async (): Promise<void> => {
    if (isInitialized) return;
    try {
      cachedAccessToken = await authStorage.getAccessToken();
      cachedRefreshToken = await authStorage.getRefreshToken();
      isInitialized = true;
    } catch {
      // Ignore initial read error
    }
  },

  /**
   * Lấy Access Token đồng bộ từ memory cache (fallback khi cần truy xuất ngay)
   */
  getCachedAccessToken: (): string | null => {
    return cachedAccessToken;
  },

  /**
   * Lấy Access Token (bất đồng bộ)
   */
  getAccessToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
          cachedAccessToken = token;
          return token;
        }
        return cachedAccessToken;
      }
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      cachedAccessToken = token;
      return token;
    } catch (e) {
      console.warn('Lỗi khi đọc access_token:', e);
      return cachedAccessToken;
    }
  },

  /**
   * Lưu Access Token
   */
  setAccessToken: async (token: string): Promise<void> => {
    try {
      cachedAccessToken = token;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
        }
        return;
      }
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      console.warn('Lỗi khi lưu access_token:', e);
    }
  },

  /**
   * Xóa Access Token
   */
  removeAccessToken: async (): Promise<void> => {
    try {
      cachedAccessToken = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
        return;
      }
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } catch (e) {
      console.warn('Lỗi khi xóa access_token:', e);
    }
  },

  /**
   * Lấy Refresh Token (bất đồng bộ)
   */
  getRefreshToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = window.localStorage.getItem(REFRESH_TOKEN_KEY);
          cachedRefreshToken = token;
          return token;
        }
        return cachedRefreshToken;
      }
      const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      cachedRefreshToken = token;
      return token;
    } catch (e) {
      console.warn('Lỗi khi đọc refresh_token:', e);
      return cachedRefreshToken;
    }
  },

  /**
   * Lưu Refresh Token
   */
  setRefreshToken: async (token: string): Promise<void> => {
    try {
      cachedRefreshToken = token;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
        return;
      }
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.warn('Lỗi khi lưu refresh_token:', e);
    }
  },

  /**
   * Xóa Refresh Token
   */
  removeRefreshToken: async (): Promise<void> => {
    try {
      cachedRefreshToken = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        return;
      }
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.warn('Lỗi khi xóa refresh_token:', e);
    }
  },

  /**
   * Xóa toàn bộ auth credentials khi logout hoặc refresh token hết hạn
   */
  clearAuthTokens: async (): Promise<void> => {
    await Promise.all([
      authStorage.removeAccessToken(),
      authStorage.removeRefreshToken(),
    ]);
  },
};
