import { apiClient } from '../client';
import { isProd } from '@/lib/env';
import type { ApiResponse, CreateStoryRequest, CreateStoryResponse, MarkStoryViewedData, StoriesFeedResponse } from '../types';

export const storiesService = {
  async getStoriesFeed(): Promise<ApiResponse<StoriesFeedResponse>> {
    return apiClient.fetchWithAuth<StoriesFeedResponse>('/api/v1/stories/feed');
  },

  async createStory(data: CreateStoryRequest): Promise<ApiResponse<CreateStoryResponse>> {
    const formData = new FormData();

    const visibility = data.visibility ?? 'FOLLOWERS';
    formData.append('visibility', visibility);

    if (typeof data.durationSeconds === 'number') {
      formData.append('durationSeconds', data.durationSeconds.toString());
    }

    if (data.caption && data.caption.trim().length > 0) {
      formData.append('caption', data.caption.trim());
    }

    // Environment-based transport:
    // - dev/staging: send local file
    // - prod: send mediaUrl (S3) (file is expected to already be uploaded via mediaService)
    if (isProd) {
      if (!data.mediaUrl) {
        throw new Error('mediaUrl is required in production');
      }
      formData.append('mediaUrl', data.mediaUrl);
    } else {
      if (!data.file) {
        throw new Error('file is required in development/staging');
      }
      formData.append('file', data.file);
    }

    return apiClient.uploadFormData<CreateStoryResponse>('/api/v1/stories', formData);
  },

  async markStoryViewed(storyId: string): Promise<ApiResponse<MarkStoryViewedData>> {
    return apiClient.fetchWithAuth<MarkStoryViewedData>(`/api/v1/stories/${storyId}/view`, {
      method: 'POST',
    });
  },
};

