import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Bộ nhớ đệm In-Memory dự phòng cho Native Mobile
const memoryStore = new Map<string, string>();

/**
 * Helper lưu trữ đa nền tảng cho thông tin người dùng và cài đặt UI:
 * - Web: window.localStorage
 * - Mobile (iOS / Android): SecureStore (bền vững) + memoryStore (fallback)
 */
export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryStore.get(key) ?? null;
      }
      const val = await SecureStore.getItemAsync(key);
      return val ?? memoryStore.get(key) ?? null;
    } catch (e) {
      console.warn("Storage getItem error:", e);
      return memoryStore.get(key) ?? null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
      memoryStore.set(key, value);
    } catch (e) {
      console.warn("Storage setItem error:", e);
      memoryStore.set(key, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
      memoryStore.delete(key);
    } catch (e) {
      console.warn("Storage removeItem error:", e);
      memoryStore.delete(key);
    }
  },
};
