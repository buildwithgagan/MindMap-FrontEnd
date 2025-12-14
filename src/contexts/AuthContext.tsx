"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/api";
import { apiClient } from "@/lib/api/client";
import { socketClient } from "@/lib/socket";
import type { User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has valid tokens
  const hasTokens = () => {
    const accessToken = apiClient.getAccessToken();
    const refreshToken = apiClient.getRefreshToken();
    return !!(accessToken && refreshToken);
  };

  // Validate session by fetching current user
  const validateSession = async (): Promise<boolean> => {
    if (!hasTokens()) {
      return false;
    }

    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        
        // Connect to WebSocket when user is authenticated
        const accessToken = apiClient.getAccessToken();
        if (accessToken) {
          socketClient.connect(accessToken).catch((error) => {
            console.error('Failed to connect to WebSocket:', error);
          });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      // If validation fails, try to refresh token
      const refreshToken = apiClient.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await authService.refreshToken({ refreshToken });
          if (refreshResponse.success && refreshResponse.data) {
            // Retry getting current user
            const retryResponse = await authService.getCurrentUser();
            if (retryResponse.success && retryResponse.data) {
              setUser(retryResponse.data);
              
              // Connect to WebSocket when user is authenticated
              const accessToken = apiClient.getAccessToken();
              if (accessToken) {
                socketClient.connect(accessToken).catch((error) => {
                  console.error('Failed to connect to WebSocket:', error);
                });
              }
              
              return true;
            }
          }
        } catch (refreshError) {
          // Refresh failed, session is invalid
          apiClient.clearTokens();
          return false;
        }
      }
      return false;
    }
  };

  // Refresh session
  const refreshSession = async () => {
    await validateSession();
  };

  // Logout
  const logout = async () => {
    try {
      // Disconnect WebSocket
      socketClient.disconnect();
      
      const refreshToken = apiClient.getRefreshToken();
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      apiClient.clearTokens();
      setUser(null);
      router.push("/auth");
    }
  };

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      const isValid = await validateSession();
      
      // Only redirect if we're on a protected route and session is invalid
      if (!isValid && pathname && (pathname.startsWith("/home") || pathname.startsWith("/profile") || pathname.startsWith("/search") || pathname.startsWith("/notifications") || pathname.startsWith("/chat"))) {
        router.push("/auth");
      }
      
      setLoading(false);
    };

    initSession();

    // Listen for token expiration events
    const handleTokenExpired = () => {
      setUser(null);
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/home") || currentPath.startsWith("/profile") || currentPath.startsWith("/search") || currentPath.startsWith("/notifications") || currentPath.startsWith("/chat")) {
        router.push("/auth");
      }
    };

    // Listen for successful authentication to refresh session
    const handleAuthSuccess = () => {
      validateSession().then((isValid) => {
        if (isValid) {
          // WebSocket connection is handled in validateSession
        }
      });
    };

    window.addEventListener("auth:token-expired", handleTokenExpired);
    window.addEventListener("auth:success", handleAuthSuccess);

    return () => {
      window.removeEventListener("auth:token-expired", handleTokenExpired);
      window.removeEventListener("auth:success", handleAuthSuccess);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-validate session when pathname changes (but not on initial load)
  useEffect(() => {
    if (!loading && hasTokens() && !user && pathname) {
      validateSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && hasTokens(),
    refreshSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
