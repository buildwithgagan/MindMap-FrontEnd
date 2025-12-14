/**
 * WebSocket client for real-time chat functionality
 */

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 
  (process.env.NEXT_PUBLIC_API_BASE_URL ? 
    process.env.NEXT_PUBLIC_API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') : 
    'ws://localhost:3000');

export type SocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'message:new'
  | 'message:delivered'
  | 'message:read'
  | 'typing:start'
  | 'typing:stop'
  | 'conversation:updated';

export type SocketEventHandler = (data: any) => void;

class SocketClient {
  private socket: WebSocket | null = null;
  private accessToken: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<SocketEvent, Set<SocketEventHandler>> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;

  /**
   * Connect to WebSocket server with authentication
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN && this.accessToken === token) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkConnection);
            if (this.socket?.readyState === WebSocket.OPEN) {
              resolve();
            } else {
              reject(new Error('Connection failed'));
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
        const wsUrl = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
        console.log('🔌 Connecting to WebSocket:', wsUrl.replace(token, '[TOKEN]'));

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.emit('connect', {});
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data);

            // Handle different message types
            if (data.type) {
              this.emit(data.type as SocketEvent, data.payload || data);
            } else {
              // Default to message:new if no type specified
              this.emit('message:new', data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', { error });
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.emit('disconnect', { code: event.code, reason: event.reason });

          // Attempt to reconnect if not a clean close and we should reconnect
          if (event.code !== 1000 && this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Max 30 seconds

    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      if (this.accessToken && this.shouldReconnect) {
        this.connect(this.accessToken).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.shouldReconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.isConnecting = false;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Send message through WebSocket
   */
  send(type: string, payload: any): void {
    if (!this.isConnected()) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      const message = JSON.stringify({ type, payload });
      this.socket?.send(message);
      console.log('📤 WebSocket message sent:', type);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
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
    if (this.accessToken !== token) {
      this.accessToken = token;
      if (this.socket && this.isConnected()) {
        // Send token update message if server supports it
        this.send('auth:update', { token });
      } else if (this.shouldReconnect) {
        // Reconnect with new token
        this.connect(token).catch(console.error);
      }
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
