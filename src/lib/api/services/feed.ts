import { apiClient } from '../client';
import type {
  ApiResponse,
  CreatePostRequest,
  Post,
  GetFeedQuery,
  PaginatedResponse,
  ToggleLikeResponse,
  AddCommentRequest,
  Comment,
  GetCommentsQuery,
  RepostRequest,
} from '../types';

export const feedService = {
  // Create post
  async createPost(data: CreatePostRequest): Promise<ApiResponse<{ post: Post }>> {
    return apiClient.fetchWithAuth<{ post: Post }>('/api/v1/feed', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get feed
  async getFeed(query?: GetFeedQuery): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const params = new URLSearchParams();
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/feed${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetchWithAuth<PaginatedResponse<Post>>(endpoint);
  },

  // Toggle like
  async toggleLike(postId: string): Promise<ApiResponse<ToggleLikeResponse>> {
    return apiClient.fetchWithAuth<ToggleLikeResponse>(`/api/v1/feed/${postId}/like`, {
      method: 'POST',
    });
  },

  // Delete post
  async deletePost(postId: string): Promise<void> {
    await apiClient.fetchWithAuth(`/api/v1/feed/${postId}`, {
      method: 'DELETE',
    });
  },

  // Add comment
  async addComment(postId: string, data: AddCommentRequest): Promise<ApiResponse<{ comment: Comment }>> {
    return apiClient.fetchWithAuth<{ comment: Comment }>(`/api/v1/feed/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get comments
  async getComments(postId: string, query?: GetCommentsQuery): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    const params = new URLSearchParams();
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/feed/${postId}/comments${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetch<PaginatedResponse<Comment>>(endpoint);
  },

  // Get replies
  async getReplies(commentId: string, query?: GetCommentsQuery): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    const params = new URLSearchParams();
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/feed/comments/${commentId}/replies${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetch<PaginatedResponse<Comment>>(endpoint);
  },

  // Delete comment
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.fetchWithAuth(`/api/v1/feed/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  // Repost
  async repost(postId: string, data?: RepostRequest): Promise<ApiResponse<{ post: Post }>> {
    return apiClient.fetchWithAuth<{ post: Post }>(`/api/v1/feed/${postId}/repost`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },
};
