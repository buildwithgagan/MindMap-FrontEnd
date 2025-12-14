import { apiClient } from '../client';
import type {
  ApiResponse,
  CreateReportRequest,
  Report,
} from '../types';

export const reportsService = {
  // Create report
  async createReport(data: CreateReportRequest): Promise<ApiResponse<Report>> {
    return apiClient.fetchWithAuth<Report>('/api/v1/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
