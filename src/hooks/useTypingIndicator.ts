import { useState, useEffect, useRef, useCallback } from 'react';
import { socketClient } from '@/lib/socket';

interface UseTypingIndicatorOptions {
  socket: typeof socketClient;
  conversationId: string;
  currentUserId: string;
  enabled?: boolean; // Allow disabling the hook
}

interface TypingUser {
  userId: string;
  userName?: string; // Optional: user name for display
}

/**
 * Custom hook for managing typing indicators in chat conversations
 * 
 * Features:
 * - Tracks multiple users typing
 * - Debounces typing events (max once per second)
 * - Auto-stops typing after 2-3 seconds of inactivity
 * - Handles socket disconnection/reconnection
 * - Cleans up on unmount
 */
export function useTypingIndicator({
  socket,
  conversationId,
  currentUserId,
  enabled = true,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [typingUsersWithNames, setTypingUsersWithNames] = useState<Map<string, string>>(new Map());
  
  // Refs for managing typing state
  const lastTypingEmitRef = useRef<number>(0);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userTypingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isTypingRef = useRef<boolean>(false);
  const conversationJoinedRef = useRef<boolean>(false);

  /**
   * Emit typing event to server (debounced to max once per second)
   */
  const emitTyping = useCallback(() => {
    if (!enabled || !conversationId || !socket.isConnected()) {
      return;
    }

    const now = Date.now();
    
    // Debounce: only emit if at least 1 second has passed since last emit
    if (now - lastTypingEmitRef.current < 1000) {
      return;
    }

    lastTypingEmitRef.current = now;
    isTypingRef.current = true;

    try {
      console.log('📝 [useTypingIndicator] Emitting typing event:', { conversationId });
      socket.send('typing', { conversationId });
    } catch (error) {
      console.warn('Failed to emit typing event:', error);
    }

    // Clear existing stop_typing timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }

    // Set timeout to emit stop_typing after 2.5 seconds of inactivity
    stopTypingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 2500);
  }, [socket, conversationId, enabled]);

  /**
   * Emit stop_typing event to server
   */
  const emitStopTyping = useCallback(() => {
    if (!enabled || !conversationId || !socket.isConnected()) {
      return;
    }

    // Clear stop_typing timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      try {
        console.log('📝 [useTypingIndicator] Emitting stop_typing event:', { conversationId });
        socket.send('stop_typing', { conversationId });
      } catch (error) {
        console.warn('Failed to emit stop_typing event:', error);
      }
    }
  }, [socket, conversationId, enabled]);

  /**
   * Join conversation room on server
   */
  const joinConversation = useCallback(() => {
    if (!enabled || !conversationId || !socket.isConnected()) {
      return;
    }

    if (conversationJoinedRef.current) {
      return; // Already joined
    }

    try {
      console.log('🔌 [useTypingIndicator] Joining conversation:', { conversationId });
      socket.send('join_conversation', { conversationId });
      conversationJoinedRef.current = true;
    } catch (error) {
      console.warn('Failed to join conversation:', error);
    }
  }, [socket, conversationId, enabled]);

  /**
   * Leave conversation room on server
   */
  const leaveConversation = useCallback(() => {
    if (!enabled || !conversationId || !socket.isConnected()) {
      return;
    }

    if (!conversationJoinedRef.current) {
      return; // Not joined
    }

    try {
      console.log('🔌 [useTypingIndicator] Leaving conversation:', { conversationId });
      socket.send('leave_conversation', { conversationId });
      conversationJoinedRef.current = false;
    } catch (error) {
      console.warn('Failed to leave conversation:', error);
    }
  }, [socket, conversationId, enabled]);

  // Join conversation when it changes or socket connects
  useEffect(() => {
    if (!enabled || !conversationId) {
      return;
    }

    // Reset join state when conversation changes
    conversationJoinedRef.current = false;

    if (socket.isConnected()) {
      joinConversation();
    }

    // Listen for socket connection to join conversation
    const handleConnect = () => {
      if (!conversationJoinedRef.current) {
        joinConversation();
      }
    };

    const unsubscribe = socket.on('connect', handleConnect);

    return () => {
      unsubscribe();
      // Leave conversation on cleanup
      leaveConversation();
    };
  }, [conversationId, socket, enabled, joinConversation, leaveConversation]);

  // Listen for typing events from other users
  useEffect(() => {
    if (!enabled || !conversationId) {
      return;
    }

    const handleTyping = (data: { conversationId: string; userId: string; userName?: string }) => {
      // Only process events for current conversation
      if (data.conversationId !== conversationId) {
        return;
      }

      // Ignore events from current user
      if (data.userId === currentUserId) {
        return;
      }

      console.log('📝 [useTypingIndicator] Received typing event:', data);

      // Add user to typing set
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.add(data.userId);
        return updated;
      });

      // Store user name if provided
      if (data.userName) {
        setTypingUsersWithNames(prev => {
          const updated = new Map(prev);
          updated.set(data.userId, data.userName!);
          return updated;
        });
      }

      // Clear existing timeout for this user
      const existingTimeout = userTypingTimeoutsRef.current.get(data.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Auto-remove user from typing list after 4 seconds if no stop_typing received
      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          if (updated.size === 0) {
            setTypingUsersWithNames(new Map());
          }
          return updated;
        });
        userTypingTimeoutsRef.current.delete(data.userId);
      }, 4000);

      userTypingTimeoutsRef.current.set(data.userId, timeout);
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      // Only process events for current conversation
      if (data.conversationId !== conversationId) {
        return;
      }

      // Ignore events from current user
      if (data.userId === currentUserId) {
        return;
      }

      console.log('📝 [useTypingIndicator] Received stop_typing event:', data);

      // Remove user from typing set
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        if (updated.size === 0) {
          setTypingUsersWithNames(new Map());
        }
        return updated;
      });

      // Clear timeout for this user
      const existingTimeout = userTypingTimeoutsRef.current.get(data.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        userTypingTimeoutsRef.current.delete(data.userId);
      }
    };

    const unsubscribeTyping = socket.on('typing', handleTyping);
    const unsubscribeStopTyping = socket.on('stop_typing', handleStopTyping);

    return () => {
      unsubscribeTyping();
      unsubscribeStopTyping();
      
      // Clear all user typing timeouts
      userTypingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      userTypingTimeoutsRef.current.clear();
    };
  }, [socket, conversationId, currentUserId, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Emit stop_typing if currently typing
      if (isTypingRef.current) {
        emitStopTyping();
      }

      // Clear all timeouts
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
      userTypingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      userTypingTimeoutsRef.current.clear();

      // Leave conversation
      leaveConversation();
    };
  }, [emitStopTyping, leaveConversation]);

  return {
    typingUsers: Array.from(typingUsers),
    typingUsersWithNames: typingUsersWithNames,
    emitTyping,
    emitStopTyping,
    joinConversation,
    leaveConversation,
  };
}
