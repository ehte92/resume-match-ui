import { apiClient } from './axios';
import { setAuthTokens, clearAuthTokens, getRefreshToken } from './cookies';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  RefreshTokenRequest,
  User,
} from '../types/auth';

/**
 * Login user with email and password
 * Stores tokens in cookies and returns user data
 */
export const login = async (credentials: LoginRequest): Promise<User> => {
  const response = await apiClient.post<TokenResponse>('/api/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });

  const { access_token, refresh_token, user } = response.data;

  // Store tokens in cookies
  setAuthTokens(access_token, refresh_token);

  return user;
};

/**
 * Register a new user
 * Stores tokens in cookies and returns user data
 */
export const register = async (data: RegisterRequest): Promise<User> => {
  const response = await apiClient.post<TokenResponse>('/api/auth/register', data);

  const { access_token, refresh_token, user } = response.data;

  // Store tokens in cookies
  setAuthTokens(access_token, refresh_token);

  return user;
};

/**
 * Refresh access token using refresh token
 * Updates tokens in cookies and returns new tokens
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const requestData: RefreshTokenRequest = {
    refresh_token: refreshToken,
  };

  const response = await apiClient.post<TokenResponse>('/api/auth/refresh', requestData);

  const { access_token, refresh_token } = response.data;

  // Update tokens in cookies
  setAuthTokens(access_token, refresh_token);

  return access_token;
};

/**
 * Get current user profile
 * Requires valid access token in cookies
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
};

/**
 * Logout user
 * Clears all authentication cookies
 */
export const logout = (): void => {
  clearAuthTokens();
};
