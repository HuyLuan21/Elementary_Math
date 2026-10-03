import { Platform } from "react-native";

/**
 * Helper lưu trữ đa nền tảng (Web localStorage & Native Memory/AsyncStorage fallback)
 */
export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch (e) {
      console.warn("Storage getItem error:", e);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("Storage setItem error:", e);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("Storage removeItem error:", e);
    }
  },
};
