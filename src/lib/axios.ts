import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { APIError } from '@/types/api';
import { getAccessToken, getRefreshToken, setAuthTokens, clearAuthTokens } from './cookies';
import type { TokenResponse } from '@/types/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 120000, // 2 minutes for analysis
  headers: {
    'Accept': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add auth token from cookies
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token, clear cookies and reject
        clearAuthTokens();
        processQueue(new Error('No refresh token available'), null);
        isRefreshing = false;

        const customError: APIError = {
          message: 'Authentication required',
          status: 401,
          data: error.response?.data,
        };
        return Promise.reject(customError);
      }

      try {
        // Use a separate axios instance to avoid interceptor loops
        const refreshResponse = await axios.post<TokenResponse>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token: new_refresh_token } = refreshResponse.data;

        // Update tokens in cookies
        setAuthTokens(access_token, new_refresh_token);

        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear cookies
        clearAuthTokens();
        processQueue(refreshError as Error, null);
        isRefreshing = false;

        const customError: APIError = {
          message: 'Session expired. Please login again.',
          status: 401,
          data: error.response?.data,
        };
        return Promise.reject(customError);
      }
    }

    // Handle other errors
    const customError: APIError = {
      message: error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 0,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
export { apiClient };
