import { apiClient } from '../client';
import type {
  ApiResponse,
  FollowResponse,
  User,
  PaginatedResponse,
  GetFollowersQuery,
  GetFollowingQuery,
  GetPendingRequestsQuery,
  PendingFollowRequest,
} from '../types';

export const relationshipsService = {
  // Follow user
  async followUser(userId: string): Promise<ApiResponse<FollowResponse>> {
    return apiClient.fetchWithAuth<FollowResponse>(`/api/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // Unfollow user
  async unfollowUser(userId: string): Promise<void> {
    await apiClient.fetchWithAuth(`/api/users/${userId}/follow`, {
      method: 'DELETE',
    });
  },

  // Get followers
  async getFollowers(userId: string, query?: GetFollowersQuery): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString();
    const endpoint = `/api/users/${userId}/followers${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetchWithAuth<PaginatedResponse<User>>(endpoint);
  },

  // Get following
  async getFollowing(userId: string, query?: GetFollowingQuery): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams();
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString();
    const endpoint = `/api/users/${userId}/following${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetch<PaginatedResponse<User>>(endpoint);
  },

  // Get pending follow requests
  async getPendingRequests(query?: GetPendingRequestsQuery): Promise<ApiResponse<PaginatedResponse<PendingFollowRequest>>> {
    const params = new URLSearchParams();
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString();
    const endpoint = `/api/users/requests${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetchWithAuth<PaginatedResponse<PendingFollowRequest>>(endpoint);
  },

  // Accept follow request
  async acceptFollowRequest(relationshipId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.fetchWithAuth<{ message: string }>(`/api/relationships/requests/${relationshipId}/accept`, {
      method: 'POST',
    });
  },

  // Decline follow request
  async declineFollowRequest(relationshipId: string): Promise<void> {
    await apiClient.fetchWithAuth(`/api/relationships/requests/${relationshipId}/decline`, {
      method: 'POST',
    });
  },
};
