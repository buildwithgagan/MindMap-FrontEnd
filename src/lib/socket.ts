/**
 * Socket.io client for real-time chat functionality
 * Uses Socket.io client library instead of plain WebSocket
 */

import { io, Socket } from 'socket.io-client';
import { config, isDev } from '@/lib/env';

// Get base URL for Socket.io (should be HTTP/HTTPS, not ws/wss)
const SOCKET_BASE_URL = config.wsBaseUrl;

// Determine if we should suppress socket errors in UI (for staging/production)
const isDevelopment = isDev;
const shouldSuppressErrors = !isDevelopment; // Suppress errors in staging/production

// Log Socket.io configuration for debugging
if (typeof window !== 'undefined' && isDevelopment) {
  console.log('🔧 Socket.io Configuration:', {
    SOCKET_BASE_URL,
    NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'not set',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'not set',
    shouldSuppressErrors,
  });
}

export type SocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'new_message'  // Backend sends this event
  | 'message:new'  // Keep for backward compatibility
  | 'message_status_update'  // Status update event from backend
  | 'message:delivered'
  | 'message:read'
  | 'typing'
  | 'stop_typing'
  | 'conversation:updated';

export type SocketEventHandler = (data: any) => void;

class SocketClient {
  private socket: Socket | null = null;
  private accessToken: string | null = null;
  private eventHandlers: Map<SocketEvent, Set<SocketEventHandler>> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;

  /**
   * Get connection status and debug info
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected(),
      isConnecting: this.isConnecting,
      readyState: this.socket?.connected ? 'OPEN' : (this.socket ? 'CLOSED' : 'NONE'),
      readyStateText: this.socket?.connected ? 'OPEN' : (this.socket ? 'CLOSED' : 'NONE'),
      hasToken: !!this.accessToken,
      reconnectAttempts: this.socket?.io?.reconnecting ? (this.socket.io as any).reconnectAttempts || 0 : 0,
      shouldReconnect: this.shouldReconnect,
      wsBaseUrl: SOCKET_BASE_URL,
      socketId: this.socket?.id || null,
    };
  }

  /**
   * Connect to Socket.io server with authentication
   * In staging/production, connection failures are silently handled (no errors thrown)
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Hard-disable sockets outside development (staging uses polling; production socket TBD)
      if (!isDevelopment) {
        resolve();
        return;
      }

      if (isDevelopment) {
        console.log('🔍 [DEBUG] Socket.connect() called with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        console.log('🔍 [DEBUG] Current connection status:', this.getConnectionStatus());
      }

      // Validate token
      if (!token || token.trim() === '') {
        const error = new Error('Cannot connect: Access token is missing or empty');
        if (isDevelopment) {
          console.error('❌ [DEBUG]', error.message);
        }
        if (shouldSuppressErrors) {
          // Silently fail in staging/production
          resolve();
          return;
        }
        reject(error);
        return;
      }

      // If already connected with the same token, resolve immediately
      if (this.socket?.connected && this.accessToken === token) {
        if (isDevelopment) {
          console.log('🔌 [DEBUG] Socket.io already connected, skipping connection attempt');
        }
        resolve();
        return;
      }

      // If already connecting, wait for that attempt to complete
      if (this.isConnecting) {
        if (isDevelopment) {
          console.log('🔌 [DEBUG] Socket.io connection already in progress, waiting...');
        }
        const checkConnection = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkConnection);
            if (this.socket?.connected) {
              resolve();
            } else {
              // Silently resolve in staging/production, reject in development
              if (shouldSuppressErrors) {
                resolve();
              } else {
                reject(new Error('Connection failed'));
              }
            }
          }
        }, 100);
        return;
      }

      this.accessToken = token;
      this.isConnecting = true;
      this.shouldReconnect = true;

      // Close existing connection if any
      if (this.socket) {
        this.disconnect();
      }

      try {
        if (isDevelopment) {
          console.log('🔌 [DEBUG] Connecting to Socket.io server');
          console.log('🔍 [DEBUG] Server URL:', SOCKET_BASE_URL);
          console.log('🔍 [DEBUG] Token length:', token.length);
          console.log('🔍 [DEBUG] Token starts with:', token.substring(0, 20));
          console.log('🔍 [DEBUG] Environment variables:', {
            NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'not set',
            NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'not set',
          });
        }

        // Create Socket.io connection with authentication
        this.socket = io(SOCKET_BASE_URL, {
          auth: {
            token: token,
          },
          // Pass token in query as fallback (some servers expect it there)
          query: {
            token: token,
          },
          // Enable reconnection
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          // Timeout for connection
          timeout: 10000,
          // Transports
          transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        });

        console.log('✅ [DEBUG] Socket.io instance created');

        // Set connection timeout (10 seconds)
        const connectionTimeout = setTimeout(() => {
          if (this.socket && !this.socket.connected) {
            if (isDevelopment) {
              console.error('❌ [DEBUG] Socket.io connection timeout after 10 seconds');
              console.error('💡 [DEBUG] Possible issues:');
              console.error('   1. Socket.io server is not running on', SOCKET_BASE_URL);
              console.error('   2. Server is not accepting Socket.io connections');
              console.error('   3. Network/firewall is blocking the connection');
              console.error('   4. CORS policy is blocking the connection');
              console.error('   5. Authentication token is invalid');
            } else {
              // Log silently in production/staging
              console.warn('Socket.io connection timeout (suppressed in production)');
            }
            
            this.socket.disconnect();
            this.isConnecting = false;
            
            const timeoutError = new Error(
              `Socket.io connection timeout. Server at ${SOCKET_BASE_URL} is not responding.`
            );
            
            // Only emit error in development, silently handle in staging/production
            if (!shouldSuppressErrors) {
              this.emit('error', {
                error: timeoutError,
                url: SOCKET_BASE_URL,
                message: 'Connection timeout - server not responding',
                troubleshooting: {
                  checkServer: `Is the Socket.io server running on ${SOCKET_BASE_URL}?`,
                  checkEndpoint: 'Is the server endpoint correct?',
                  checkNetwork: 'Check browser Network tab for connection attempts',
                  checkCORS: 'Check if CORS is blocking the connection',
                  checkAuth: 'Verify the authentication token is valid',
                },
              });
              reject(timeoutError);
            } else {
              // Silently resolve in staging/production
              resolve();
            }
          }
        }, 10000);

        // Connection successful
        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          if (isDevelopment) {
            console.log('✅ [DEBUG] Socket.io connected successfully');
            console.log('🔍 [DEBUG] Connection details:', {
              id: this.socket?.id,
              connected: this.socket?.connected,
              transport: this.socket?.io?.engine?.transport?.name || 'unknown',
            });
          }
          this.isConnecting = false;
          this.emit('connect', {});
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          clearTimeout(connectionTimeout);
          if (isDevelopment) {
            console.error('❌ [DEBUG] Socket.io connection error:', error);
            console.error('❌ [DEBUG] Error message:', error.message);
            console.error('❌ [DEBUG] Error type:', error.type || 'unknown');
            console.error('❌ [DEBUG] Server URL:', SOCKET_BASE_URL);
          } else {
            // Log silently in production/staging
            console.warn('Socket.io connection error (suppressed in production):', error.message);
          }
          
          this.isConnecting = false;
          
          // Only emit error and reject in development
          // In staging/production, silently handle errors
          if (!shouldSuppressErrors) {
            const errorDetails = {
              error,
              url: SOCKET_BASE_URL,
              message: error.message || 'Socket.io connection failed. Please check if the server is running and the endpoint is correct.',
              troubleshooting: {
                checkServer: 'Is the Socket.io server running?',
                checkUrl: `Is the URL correct? ${SOCKET_BASE_URL}`,
                checkNetwork: 'Check browser console for network errors',
                checkCORS: 'Check if CORS is blocking the connection',
                checkAuth: 'Verify the authentication token is valid',
              },
            };
            
            this.emit('error', errorDetails);
            reject(error);
          } else {
            // Silently resolve in staging/production - don't show errors to users
            resolve();
          }
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          clearTimeout(connectionTimeout);
          if (isDevelopment) {
            console.log('🔌 [DEBUG] Socket.io disconnected:', reason);
            // Provide troubleshooting info
            if (reason === 'io server disconnect') {
              console.error('❌ [DEBUG] Server disconnected the socket');
            } else if (reason === 'io client disconnect') {
              console.log('ℹ️ [DEBUG] Client disconnected the socket');
            } else if (reason === 'ping timeout' || reason === 'transport close') {
              console.error('❌ [DEBUG] Connection lost - server may be unreachable');
            }
          }
          this.isConnecting = false;
          this.emit('disconnect', { reason });
        });

        // Listen for custom events and forward them
        this.socket.onAny((eventName, ...args) => {
          if (isDevelopment) {
            console.log('📨 [DEBUG] Socket.io event received:', eventName, args);
          }
          
          // Map Socket.io events to our event system
          // Backend sends 'new_message', map it to both 'new_message' and 'message:new' for compatibility
          if (eventName === 'new_message') {
            this.emit('new_message', args[0] || {});
            this.emit('message:new', args[0] || {}); // Also emit as message:new for backward compatibility
          } else if (eventName === 'message_status_update') {
            // Explicitly handle message_status_update
            if (isDevelopment) {
              console.log('📊 [Socket] Forwarding message_status_update event:', args[0]);
            }
            this.emit('message_status_update', args[0] || {});
          } else if (eventName === 'message:new' || eventName === 'message:delivered' || eventName === 'message:read' ||
              eventName === 'typing' || eventName === 'stop_typing' || eventName === 'conversation:updated') {
            this.emit(eventName as SocketEvent, args[0] || {});
          }
        });

      } catch (error) {
        this.isConnecting = false;
        if (isDevelopment) {
          console.error('❌ [DEBUG] Error creating Socket.io connection:', error);
          console.error('💡 [DEBUG] This usually means:');
          console.error('   1. Invalid server URL format');
          console.error('   2. Browser does not support Socket.io');
          console.error('   3. Network error during connection setup');
          reject(error);
        } else {
          // Silently resolve in staging/production
          console.warn('Socket.io connection error (suppressed in production)');
          resolve();
        }
      }
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (!isDevelopment) {
      // No-op outside development
      this.socket = null;
      this.isConnecting = false;
      this.shouldReconnect = false;
      return;
    }
    this.shouldReconnect = false;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = false;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Send message through Socket.io
   */
  send(type: string, payload: any): void {
    if (!isDevelopment) return;
    if (!this.isConnected()) {
      if (isDevelopment) {
        console.warn('Cannot send message: Socket.io not connected');
      }
      return;
    }

    try {
      // Emit the event to the server
      this.socket?.emit(type, payload);
      if (isDevelopment) {
        console.log('📤 [DEBUG] Socket.io message sent:', type, payload);
      }
    } catch (error) {
      if (isDevelopment) {
        console.error('Error sending Socket.io message:', error);
      } else {
        console.warn('Socket.io message send error (suppressed in production)');
      }
    }
  }

  /**
   * Subscribe to socket events
   */
  on(event: SocketEvent, handler: SocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Also subscribe to Socket.io native events if needed
    if (this.socket && (event === 'connect' || event === 'disconnect' || event === 'error')) {
      // These are handled by Socket.io directly
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Unsubscribe from socket events
   */
  off(event: SocketEvent, handler: SocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to all handlers
   */
  private emit(event: SocketEvent, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Update access token and reconnect if needed
   */
  updateToken(token: string): void {
    if (!isDevelopment) return;
    if (this.accessToken !== token) {
      this.accessToken = token;
      if (this.socket && this.isConnected()) {
        // Send token update to server
        this.socket.emit('auth:update', { token });
      } else if (this.shouldReconnect) {
        // Reconnect with new token
        this.connect(token).catch(console.error);
      }
    }
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!isDevelopment) return;
    if (!this.isConnected()) {
      console.warn('Cannot join conversation: Socket.io not connected');
      return;
    }

    try {
      this.socket?.emit('join_conversation', { conversationId });
      console.log('📤 [DEBUG] Joined conversation room:', conversationId);
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!isDevelopment) return;
    if (!this.isConnected()) {
      console.warn('Cannot leave conversation: Socket.io not connected');
      return;
    }

    try {
      this.socket?.emit('leave_conversation', { conversationId });
      console.log('📤 [DEBUG] Left conversation room:', conversationId);
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient();

// Import debug utilities (side effect - registers global functions)
if (typeof window !== 'undefined') {
  if (isDevelopment) {
    import('./socket-debug');
  }
}
