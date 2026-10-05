import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStorage } from '../utils/authStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const configuredTimeout = Number(process.env.EXPO_PUBLIC_API_TIMEOUT);

export const getApiBaseUrl = (): string | undefined => API_BASE_URL;

// Instance Axios chính cho toàn bộ ứng dụng
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
  withCredentials: true,
});

// Listener thông báo khi refresh token thất bại (để AuthContext xóa state và điều hướng về Login)
type AuthFailureListener = () => void;
const authFailureListeners: Set<AuthFailureListener> = new Set();

export const onAuthFailure = (listener: AuthFailureListener) => {
  authFailureListeners.add(listener);
  return () => {
    authFailureListeners.delete(listener);
  };
};

const notifyAuthFailure = () => {
  authFailureListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('Lỗi khi gọi authFailureListener:', e);
    }
  });
};

// Thiết lập / Cập nhật Bearer Token cho mọi request
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Request Interceptor: Tự động gắn Bearer Token từ authStorage nếu chưa có trong headers
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.baseURL) {
      return Promise.reject(
        new Error('EXPO_PUBLIC_API_URL chưa được cấu hình.')
      );
    }

    if (!config.headers['Authorization']) {
      const token =
        authStorage.getCachedAccessToken() ||
        (await authStorage.getAccessToken());
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Queue quản lý Single-Flight Refresh để ngăn chặn race-condition khi nhiều request bị 401 cùng lúc
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Endpoint refresh độc lập (dùng axios trực tiếp, không qua interceptor của apiClient để tránh vòng lặp)
const executeTokenRefresh = async (): Promise<{
  access_token: string;
  refresh_token?: string;
}> => {
  const currentRefreshToken = await authStorage.getRefreshToken();
  if (!currentRefreshToken) {
    throw new Error('Không tìm thấy refresh token trong bộ nhớ an toàn.');
  }

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {
      refresh_token: currentRefreshToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-refresh-token': currentRefreshToken,
      },
      withCredentials: true,
      timeout: 10000,
    }
  );

  const { access_token, refresh_token } = response.data || {};
  if (!access_token) {
    throw new Error('Máy chủ phản hồi thiếu access token sau khi làm mới.');
  }

  return { access_token, refresh_token };
};

// Response Interceptor: Xử lý 401 với single-flight refresh và retry request
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as RetryConfig | undefined;

    const url = originalRequest?.url || '';
    const isPinRequest = /\/auth\/pin\/(setup|verify)(?:\?|$)/.test(url);
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/register') ||
      url.includes('/auth/logout') ||
      isPinRequest;

    // Kiểm tra xem request có đủ điều kiện refresh token không (không áp dụng cho login, refresh, verify PIN)
    if (originalRequest && error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          // Nếu đang có 1 request refresh đang chạy -> Xếp hàng chờ token mới
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            })
            .catch((queueError) => {
              return Promise.reject(queueError);
            });
        }

        // Bắt đầu chu trình refresh đơn nhất (Single-Flight)
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { access_token: newAccessToken, refresh_token: newRefreshToken } =
            await executeTokenRefresh();

          // Lưu token mới vào storage an toàn và cập nhật memory cache
          await authStorage.setAccessToken(newAccessToken);
          if (newRefreshToken) {
            await authStorage.setRefreshToken(newRefreshToken);
          }
          setAuthToken(newAccessToken);

          // Giải phóng hàng đợi chờ
          processQueue(null, newAccessToken);

          // Retry request ban đầu với token mới
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh thất bại: Huỷ toàn bộ queue, xóa sạch token, báo lỗi đăng nhập
          processQueue(refreshError, null);
          await authStorage.clearAuthTokens();
          setAuthToken(null);
          notifyAuthFailure();

          return Promise.reject(
            new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          );
        } finally {
          isRefreshing = false;
        }
      }

    // Xử lý và chuẩn hóa các thông điệp lỗi nghiệp vụ khác
    if (error.response) {
      const data = error.response.data;
      let errorMsg: string | undefined;
      const isPinRequest = /\/auth\/pin\/(setup|verify)(?:\?|$)/.test(
        error.config?.url ?? ''
      );

      if (typeof data === 'object' && data !== null) {
        const responseData = data as Record<string, unknown>;
        const firstError = Array.isArray(responseData.errors)
          ? responseData.errors[0]
          : undefined;
        const firstErrorMessage =
          typeof firstError === 'object' &&
          firstError !== null &&
          'message' in firstError &&
          typeof firstError.message === 'string'
            ? firstError.message
            : undefined;
        const errorCode =
          typeof responseData.code === 'string'
            ? responseData.code
            : typeof (responseData.error as Record<string, unknown>)?.code === 'string'
              ? ((responseData.error as Record<string, unknown>).code as string)
              : typeof responseData.message === 'string'
                ? responseData.message
                : typeof responseData.error === 'string'
                  ? responseData.error
                  : firstErrorMessage;

        if (isPinRequest) {
          switch (errorCode) {
            case 'PIN_INVALID':
              errorMsg = 'Mã PIN không đúng.';
              break;
            case 'PIN_NOT_SET':
              errorMsg = 'Tài khoản chưa thiết lập mã PIN.';
              break;
            case 'PIN_ALREADY_SET':
              errorMsg = 'Mã PIN đã được thiết lập.';
              break;
          }
        }

        if (typeof responseData.message === 'string') {
          errorMsg ||= responseData.message;
        } else if (Array.isArray(responseData.errors)) {
          if (
            typeof firstError === 'object' &&
            firstError !== null &&
            'message' in firstError &&
            typeof firstError.message === 'string'
          ) {
            errorMsg ||= firstError.message;
          }
        }
      }

      if (isPinRequest && error.response.status === 422) {
        errorMsg = 'Mã PIN phải gồm đúng 4 chữ số.';
      }
      errorMsg ||= `Lỗi từ máy chủ (${error.response.status})`;
      return Promise.reject(new Error(errorMsg));
    } else if (error.request) {
      const baseUrl = error.config?.baseURL ?? getApiBaseUrl() ?? '(chưa cấu hình)';
      return Promise.reject(
        new Error(
          `Không thể kết nối tới máy chủ backend (${baseUrl}). Hãy đảm bảo backend đang chạy!`
        )
      );
    } else {
      return Promise.reject(
        new Error(error.message || 'Đã xảy ra lỗi không xác định.')
      );
    }
  }
);

export default apiClient;
