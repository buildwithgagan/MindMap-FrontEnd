"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/api";
import { apiClient } from "@/lib/api/client";
import { socketClient } from "@/lib/socket";
import { toast } from "@/hooks/use-toast";
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
  const [socketConnected, setSocketConnected] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has valid tokens
  const hasTokens = () => {
    const accessToken = apiClient.getAccessToken();
    const refreshToken = apiClient.getRefreshToken();
    return !!(accessToken && refreshToken);
  };

  // Validate session by fetching current user
  const validateSession = async (shouldConnectSocket: boolean = true): Promise<boolean> => {
    if (!hasTokens()) {
      return false;
    }

    try {
      const response = await authService.getCurrentUser();
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [AuthContext] getCurrentUser response:', {
          success: response.success,
          hasData: !!response.data,
          userId: response.data?.id,
          userObject: response.data,
        });
      }
      if (response.success && response.data) {
        // getCurrentUser() now extracts and returns just the user object
        setUser(response.data);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [AuthContext] User set with ID:', response.data.id);
        }
        
        // Connect to WebSocket only once when user is first authenticated
        if (shouldConnectSocket && !socketConnected) {
          const accessToken = apiClient.getAccessToken();
          console.log('🔍 [DEBUG] Attempting to connect socket:', {
            hasToken: !!accessToken,
            tokenLength: accessToken?.length || 0,
            socketConnected,
            isAlreadyConnected: socketClient.isConnected(),
            connectionStatus: socketClient.getConnectionStatus(),
          });
          
          if (accessToken && !socketClient.isConnected()) {
            console.log('🔌 [DEBUG] Initiating WebSocket connection...');
            socketClient.connect(accessToken)
              .then(() => {
                console.log('✅ [DEBUG] WebSocket connection successful');
                setSocketConnected(true);
              })
              .catch((error) => {
                console.error('❌ [DEBUG] Failed to connect to WebSocket:', error);
                console.error('❌ [DEBUG] Error message:', error.message);
                console.error('❌ [DEBUG] Error stack:', error.stack);
                console.error('⚠️ This is normal if the WebSocket server is not running.');
                console.error('⚠️ The app will continue to work, but real-time features will be unavailable.');
                console.error('💡 [DEBUG] Connection status after failure:', socketClient.getConnectionStatus());
                // Don't show error toast for connection failures - it's expected if server isn't running
                // The socket will automatically retry when the server becomes available
              });
          } else {
            console.warn('⚠️ [DEBUG] Skipping socket connection:', {
              hasToken: !!accessToken,
              isAlreadyConnected: socketClient.isConnected(),
              socketConnected,
            });
          }
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
              
              // Connect to WebSocket only once when user is first authenticated
              if (shouldConnectSocket && !socketConnected) {
                const accessToken = apiClient.getAccessToken();
                if (accessToken && !socketClient.isConnected()) {
                  socketClient.connect(accessToken)
                    .then(() => {
                      setSocketConnected(true);
                    })
                    .catch((error) => {
                      console.error('⚠️ Failed to connect to WebSocket:', error);
                      console.error('⚠️ This is normal if the WebSocket server is not running.');
                      console.error('⚠️ The app will continue to work, but real-time features will be unavailable.');
                    });
                }
              }
              
              return true;
            }
          }
        } catch (refreshError) {
          // Refresh failed, session is invalid
          apiClient.clearTokens();
          setSocketConnected(false);
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
      setSocketConnected(false);
      
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
      // Reset socket connected flag on new auth to allow reconnection
      setSocketConnected(false);
      validateSession(true).then((isValid) => {
        if (isValid) {
          // WebSocket connection is handled in validateSession
        }
      });
    };

    // Listen for socket connection events
    const handleSocketConnect = () => {
      setSocketConnected(true);
      // Only show success toast in development
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        toast({
          title: "Socket Connected",
          description: "Real-time messaging is now active",
          duration: 3000,
        });
      }
    };

    // Listen for socket disconnection
    const handleSocketDisconnect = () => {
      setSocketConnected(false);
    };

    // Listen for socket errors (for debugging)
    const handleSocketError = (data: any) => {
      // In staging/production, suppress socket errors (different library will be used later)
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        console.error('Socket error event:', data);
        // Only show toast for non-connection errors to avoid spam
        if (data.error && !data.error.message?.includes('connection')) {
          toast({
            title: "Socket Error",
            description: data.error.message || "An error occurred with the WebSocket connection",
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        // Silently log in staging/production
        console.warn('Socket error (suppressed in production):', data.error?.message);
      }
    };

    window.addEventListener("auth:token-expired", handleTokenExpired);
    window.addEventListener("auth:success", handleAuthSuccess);
    
    // Subscribe to socket events
    const unsubscribeSocketConnect = socketClient.on('connect', handleSocketConnect);
    const unsubscribeSocketDisconnect = socketClient.on('disconnect', handleSocketDisconnect);
    const unsubscribeSocketError = socketClient.on('error', handleSocketError);

    return () => {
      window.removeEventListener("auth:token-expired", handleTokenExpired);
      window.removeEventListener("auth:success", handleAuthSuccess);
      unsubscribeSocketConnect();
      unsubscribeSocketDisconnect();
      unsubscribeSocketError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-validate session when pathname changes (but not on initial load)
  // Don't connect socket on pathname changes - only validate user session
  useEffect(() => {
    if (!loading && hasTokens() && !user && pathname) {
      validateSession(false); // Don't connect socket on tab navigation
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
