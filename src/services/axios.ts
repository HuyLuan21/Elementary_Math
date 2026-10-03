import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Helper to determine the backend API base URL
export const getApiBaseUrl = (): string => {
  // 1. Web: Sử dụng hostname hiện tại của trình duyệt (localhost / IP LAN)
  if (Platform.OS === 'web') {
    const hostname =
      typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
    return `http://${hostname}:6001/api`;
  }

  // 2. Nếu EXPO_PUBLIC_API_URL được cấu hình tường minh với IP LAN thật
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // 3. Tự động trích xuất IP LAN của máy tính host từ Expo dev server (Expo Go / Dev Client)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest?.hostUri ||
    (Constants as any).experienceUrl;

  if (hostUri) {
    const cleanUri = String(hostUri).replace(/^[a-zA-Z]+:\/\//, '');
    const hostIp = cleanUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      console.log(`[API Config] Đã tự động kết nối Backend qua IP máy tính: http://${hostIp}:6001/api`);
      return `http://${hostIp}:6001/api`;
    }
  }

  // 4. Android emulator mặc định
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:6001/api';
  }

  // 5. iOS Simulator / fallback
  return 'http://localhost:6001/api';
};

// Khởi tạo instance Axios
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let currentAuthToken: string | null = null;

// Hàm thiết lập Bearer Token cho mọi request tiếp theo
export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Request Interceptor: Đảm bảo luôn lấy baseURL chính xác và gắn Token nếu có
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Luôn cập nhật baseURL theo môi trường chạy nếu chưa có
    if (!config.baseURL || (config.baseURL.includes('localhost') && Platform.OS !== 'web' && !process.env.EXPO_PUBLIC_API_URL)) {
      config.baseURL = getApiBaseUrl();
    }
    
    if (currentAuthToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Chuẩn hóa format lỗi trả về từ Backend
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      // Server phản hồi với mã status ngoài dải 2xx
      const data = error.response.data;
      const errorMsg =
        data?.message ||
        (data?.errors && data?.errors[0]?.message) ||
        `Lỗi từ máy chủ (${error.response.status})`;
      return Promise.reject(new Error(errorMsg));
    } else if (error.request) {
      // Request đã gửi nhưng không nhận được response (Network error / server down)
      const baseUrl = getApiBaseUrl();
      return Promise.reject(
        new Error(`Không thể kết nối tới máy chủ backend (${baseUrl}). Hãy đảm bảo backend đang chạy!`)
      );
    } else {
      return Promise.reject(new Error(error.message || 'Đã xảy ra lỗi không xác định.'));
    }
  }
);

export default apiClient;
