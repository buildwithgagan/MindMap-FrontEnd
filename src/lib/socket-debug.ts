/**
 * Socket debugging utilities
 * Call these functions from browser console to debug socket connection issues
 */

import { socketClient } from './socket';

/**
 * Get current socket connection status
 * Usage: In browser console, type: window.debugSocket()
 */
export function debugSocket() {
  const status = socketClient.getConnectionStatus();
  
  console.group('🔍 Socket.io Connection Debug Info');
  console.log('Connection Status:', status);
  console.log('Is Connected:', status.isConnected);
  console.log('Is Connecting:', status.isConnecting);
  console.log('Ready State:', status.readyStateText);
  console.log('Has Token:', status.hasToken);
  console.log('Socket ID:', status.socketId);
  console.log('Reconnect Attempts:', status.reconnectAttempts);
  console.log('Socket.io Base URL:', status.wsBaseUrl);
  console.groupEnd();
  
  return status;
}

/**
 * Test socket connection manually
 * Usage: In browser console, type: window.testSocketConnection('your-token-here')
 */
export function testSocketConnection(token?: string) {
  const accessToken = token || localStorage.getItem('mindmap_access_token');
  
  if (!accessToken) {
    console.error('❌ No access token found. Please provide a token or ensure you are logged in.');
    return;
  }
  
  console.group('🧪 Testing Socket.io Connection');
  console.log('Token:', `${accessToken.substring(0, 20)}...`);
  console.log('Attempting connection...');
  
  socketClient.connect(accessToken)
    .then(() => {
      console.log('✅ Socket.io connection successful!');
      debugSocket();
    })
    .catch((error) => {
      console.error('❌ Socket.io connection failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      debugSocket();
    });
  
  console.groupEnd();
}

/**
 * Check environment configuration
 */
export function checkSocketConfig() {
  console.group('⚙️ Socket.io Configuration');
  console.log('NEXT_PUBLIC_WS_BASE_URL:', process.env.NEXT_PUBLIC_WS_BASE_URL || 'not set');
  console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'not set');
  console.log('Current URL:', window.location.href);
  console.log('Protocol:', window.location.protocol);
  console.log('Socket.io will connect to:', process.env.NEXT_PUBLIC_WS_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
  console.groupEnd();
}

// Make functions available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugSocket = debugSocket;
  (window as any).testSocketConnection = testSocketConnection;
  (window as any).checkSocketConfig = checkSocketConfig;
  
  console.log('🔧 Socket debug utilities loaded!');
  console.log('💡 Available commands:');
  console.log('   - window.debugSocket() - Check connection status');
  console.log('   - window.testSocketConnection(token?) - Test connection');
  console.log('   - window.checkSocketConfig() - Check configuration');
}
