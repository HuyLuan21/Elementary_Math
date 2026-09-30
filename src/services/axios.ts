import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Helper to determine the backend API base URL
export const getApiBaseUrl = (): string => {
  // 1. Ưu tiên lấy từ biến môi trường .env (nếu có)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web: Sử dụng hostname hiện tại của trình duyệt (localhost / 127.0.0.1 / IP LAN)
  if (Platform.OS === 'web') {
    const hostname =
      typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
    return `http://${hostname}:6001/api`;
  }

  // 3. If running via Expo Go / dev client, connect to the host machine IP
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:6001/api`;
  }

  // 4. Android emulator
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
