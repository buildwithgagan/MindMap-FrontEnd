import { apiClient } from '../client';
import type { ApiResponse, MarkStoryViewedData, StoriesFeedResponse } from '../types';

export const storiesService = {
  async getStoriesFeed(): Promise<ApiResponse<StoriesFeedResponse>> {
    return apiClient.fetchWithAuth<StoriesFeedResponse>('/api/v1/stories/feed');
  },

  async markStoryViewed(storyId: string): Promise<ApiResponse<MarkStoryViewedData>> {
    return apiClient.fetchWithAuth<MarkStoryViewedData>(`/api/v1/stories/${storyId}/view`, {
      method: 'POST',
    });
  },
};

