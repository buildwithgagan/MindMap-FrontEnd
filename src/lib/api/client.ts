import type {
  ApiResponse,
  AuthTokens,
  RefreshTokenRequest,
  AuthResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Lazy import socket client to avoid circular dependencies
let socketClient: any = null;
const getSocketClient = () => {
  if (typeof window !== 'undefined' && !socketClient) {
    socketClient = require('../socket').socketClient;
  }
  return socketClient;
};

// Token storage keys
const ACCESS_TOKEN_KEY = 'mindmap_access_token';
const REFRESH_TOKEN_KEY = 'mindmap_refresh_token';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // Base fetch method with error handling
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Normalize URL to prevent double slashes
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;
    const accessToken = this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken && !options.headers?.['Authorization']) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Log request
    const requestBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;
    console.log('🚀 API Request:', {
      method: options.method || 'GET',
      url,
      headers: { ...headers, Authorization: headers['Authorization'] ? '[REDACTED]' : undefined },
      body: requestBody,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 204 No Content
      if (response.status === 204) {
        console.log('✅ API Response (204 No Content):', {
          url,
          status: response.status,
          data: {},
        });
        return {
          success: true,
          data: {} as T,
        };
      }

      const data = await response.json();

      // Log response
      console.log('✅ API Response:', {
        url,
        status: response.status,
        ok: response.ok,
        data,
      });

      if (!response.ok) {
        // Extract error message from different possible response structures
        const errorMessage = 
          (data as any)?.error?.message || 
          data.message || 
          `HTTP error! status: ${response.status}`;
        
        console.error('❌ API Error:', {
          url,
          status: response.status,
          error: errorMessage,
          data,
        });
        
        // Create error with status code for proper handling
        const error = new Error(errorMessage) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ API Exception:', {
        url,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Fetch with automatic token refresh
  async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      return await this.fetch<T>(endpoint, options);
    } catch (error) {
      // Check if error has status code 401 (Unauthorized)
      const statusCode = (error as any)?.status;
      if (statusCode === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          return await this.fetch<T>(endpoint, options);
        } else {
          // Refresh failed, clear tokens and throw error
          this.clearTokens();
          // Dispatch custom event for auth state change
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:token-expired'));
          }
        }
      }
      throw error;
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await this.fetch<AuthTokens>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.data) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        
        // Update socket connection with new token
        const socket = getSocketClient();
        if (socket) {
          socket.updateToken(response.data.accessToken);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  // Upload file helper
  async uploadFile(
    endpoint: string,
    file: File,
    fieldName: string = 'file'
  ): Promise<ApiResponse<any>> {
    // Normalize URL to prevent double slashes
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;
    const accessToken = this.getAccessToken();

    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Log file upload request
    console.log('📤 File Upload Request:', {
      method: 'POST',
      url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fieldName,
      headers: { Authorization: accessToken ? '[REDACTED]' : undefined },
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      // Log file upload response
      console.log('📥 File Upload Response:', {
        url,
        status: response.status,
        ok: response.ok,
        data,
      });

      if (!response.ok) {
        // Extract error message from different possible response structures
        const errorMessage = 
          (data as any)?.error?.message || 
          data.message || 
          `HTTP error! status: ${response.status}`;
        
        console.error('❌ File Upload Error:', {
          url,
          status: response.status,
          error: errorMessage,
          data,
        });
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('❌ File Upload Exception:', {
        url,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
