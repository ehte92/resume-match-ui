import { apiClient } from './axios';
import type { User } from '../types/auth';
import type {
  UserProfileUpdateRequest,
  PasswordChangeRequest,
  PasswordChangeResponse,
  AccountDeleteRequest,
  AccountDeleteResponse,
} from '../types/api';

/**
 * Get current user's profile
 * Requires valid access token
 */
export const getUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/users/profile');
  return response.data;
};

/**
 * Update user profile information (name and/or email)
 * At least one field must be provided
 */
export const updateUserProfile = async (data: UserProfileUpdateRequest): Promise<User> => {
  const response = await apiClient.put<User>('/api/users/profile', data);
  return response.data;
};

/**
 * Change user password
 * Requires old password for verification
 */
export const changePassword = async (
  data: PasswordChangeRequest
): Promise<PasswordChangeResponse> => {
  const response = await apiClient.put<PasswordChangeResponse>('/api/users/password', data);
  return response.data;
};

/**
 * Delete user account (PERMANENT)
 * Requires password verification and "DELETE" confirmation
 */
export const deleteAccount = async (
  data: AccountDeleteRequest
): Promise<AccountDeleteResponse> => {
  const response = await apiClient.delete<AccountDeleteResponse>('/api/users/account', {
    data,
  });
  return response.data;
};
