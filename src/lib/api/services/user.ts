import { apiClient } from '../client';
import type {
  ApiResponse,
  VerifyStartRequest,
  VerifyStartResponse,
  VerifyConfirmRequest,
  UpdateProfileRequest,
  User,
  ListUsersQuery,
  PaginatedResponse,
} from '../types';

export const userService = {
  // Verification
  async verifyStart(data: VerifyStartRequest): Promise<ApiResponse<VerifyStartResponse>> {
    return apiClient.fetchWithAuth<VerifyStartResponse>('/api/user/verify/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyConfirm(data: VerifyConfirmRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.fetchWithAuth<{ message: string }>('/api/user/verify/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return apiClient.fetchWithAuth<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // List users
  async listUsers(query?: ListUsersQuery): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/user/list${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetchWithAuth<PaginatedResponse<User>>(endpoint);
  },
};
