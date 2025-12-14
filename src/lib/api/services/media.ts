import { apiClient } from '../client';
import type {
  ApiResponse,
  UploadMediaResponse,
} from '../types';

export const mediaService = {
  // Upload media
  async uploadMedia(file: File): Promise<ApiResponse<UploadMediaResponse>> {
    return apiClient.uploadFile('/api/v1/media/upload', file, 'file');
  },
};
