import axios, { AxiosError } from 'axios';
import type { APIError } from '@/types/api';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 120000, // 2 minutes for analysis
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed in the future
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const customError: APIError = {
      message: error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 0,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
