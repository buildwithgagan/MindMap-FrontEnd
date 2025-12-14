import { apiClient } from '../client';
import type {
  ApiResponse,
  RegisterStartRequest,
  RegisterStartResponse,
  RegisterVerifyRequest,
  RegisterVerifyResponse,
  RegisterCompleteRequest,
  LoginRequest,
  AuthResponse,
  User,
  RefreshTokenRequest,
  AuthTokens,
  LogoutRequest,
} from '../types';

export const authService = {
  // OTP Registration Flow
  async registerStart(data: RegisterStartRequest): Promise<ApiResponse<RegisterStartResponse>> {
    return apiClient.fetch<RegisterStartResponse>('/api/auth/register/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async registerVerify(data: RegisterVerifyRequest): Promise<ApiResponse<RegisterVerifyResponse>> {
    return apiClient.fetch<RegisterVerifyResponse>('/api/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async registerComplete(data: RegisterCompleteRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.fetch<AuthResponse>('/api/auth/register/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Save tokens after successful registration
    if (response.success && response.data) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  // Login
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Save tokens after successful login
    if (response.success && response.data) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.fetchWithAuth<User>('/api/auth/me');
  },

  // Refresh token
  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await apiClient.fetch<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Update tokens after refresh
    if (response.success && response.data) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  // Logout
  async logout(data: LogoutRequest): Promise<void> {
    await apiClient.fetch('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    apiClient.clearTokens();
  },

  // Password reset (placeholder endpoints)
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.fetch<{ message: string }>('/api/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.fetch<{ message: string }>('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};
