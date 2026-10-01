import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const configuredTimeout = Number(process.env.EXPO_PUBLIC_API_TIMEOUT);

export const getApiBaseUrl = (): string | undefined => API_BASE_URL;

// Khởi tạo instance Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout:
    Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 15000,
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
    if (!config.baseURL) {
      return Promise.reject(
        new Error('EXPO_PUBLIC_API_URL chưa được cấu hình.')
      );
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
  (error: AxiosError<unknown>) => {
    if (error.response) {
      // Server phản hồi với mã status ngoài dải 2xx
      const data = error.response.data;
      let errorMsg: string | undefined;
      if (typeof data === 'object' && data !== null) {
        const responseData = data as Record<string, unknown>;
        if (typeof responseData.message === 'string') {
          errorMsg = responseData.message;
        } else if (Array.isArray(responseData.errors)) {
          const firstError = responseData.errors[0];
          if (
            typeof firstError === 'object' &&
            firstError !== null &&
            'message' in firstError &&
            typeof firstError.message === 'string'
          ) {
            errorMsg = firstError.message;
          }
        }
      }
      errorMsg ||= `Lỗi từ máy chủ (${error.response.status})`;
      return Promise.reject(new Error(errorMsg));
    } else if (error.request) {
      // Request đã gửi nhưng không nhận được response (Network error / server down)
      const baseUrl = error.config?.baseURL ?? getApiBaseUrl() ?? '(chưa cấu hình)';
      return Promise.reject(
        new Error(`Không thể kết nối tới máy chủ backend (${baseUrl}). Hãy đảm bảo backend đang chạy!`)
      );
    } else {
      return Promise.reject(new Error(error.message || 'Đã xảy ra lỗi không xác định.'));
    }
  }
);

export default apiClient;
