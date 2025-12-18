import type { Conversation as ApiConversation, Message as ApiMessage, User as ApiUser } from '@/lib/api/types';
import type { Chat, Message, User } from '@/lib/data';

/**
 * Maps API User to component User type
 */
export function mapApiUserToUser(apiUser: ApiUser, currentUserId: string): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    username: apiUser.email?.split('@')[0] || apiUser.phoneNo || `user_${apiUser.id.slice(0, 8)}`,
    avatar: {
      id: `avatar-${apiUser.id}`,
      description: apiUser.name,
      imageUrl: apiUser.profileImage || '',
      imageHint: apiUser.name,
    },
    bio: apiUser.bio || '',
    stats: {
      followers: apiUser.followersCount || 0,
      following: apiUser.followingCount || 0,
    },
    isVerified: {
      email: apiUser.isEmailVerified || false,
      phone: apiUser.isPhoneVerified || false,
    },
    privacy: apiUser.isPrivate ? 'private' : 'public',
  };
}

/**
 * Maps API Message to component Message type
 */
export function mapApiMessageToMessage(apiMessage: ApiMessage, currentUserId: string): Message {
  // Use sender.id instead of senderId (senderId might be [object Object])
  const senderId = apiMessage.sender?.id || apiMessage.senderId;
  const isMe = senderId === currentUserId;
  
  // Debug log to see mapping
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 mapApiMessageToMessage:', {
      messageId: apiMessage.id,
      senderId,
      senderObjectId: apiMessage.sender?.id,
      originalSenderId: apiMessage.senderId,
      currentUserId,
      isEqual: senderId === currentUserId,
      isMe,
      senderIdType: typeof senderId,
      currentUserIdType: typeof currentUserId,
      content: apiMessage.content.substring(0, 30),
      comparison: `${senderId} === ${currentUserId} ? ${senderId === currentUserId}`,
    });
  }
  
  // Normalize status from backend (uppercase) to frontend format (lowercase)
  // Backend sends: 'SENT' | 'DELIVERED' | 'READ'
  // Frontend expects: 'sent' | 'delivered' | 'read'
  const normalizeStatus = (status: string): 'sent' | 'delivered' | 'read' => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'READ') return 'read';
    if (upperStatus === 'DELIVERED') return 'delivered';
    return 'sent'; // Default to 'sent' for SENT or any other value
  };

  return {
    id: apiMessage.id,
    sender: isMe ? 'me' : mapApiUserToUser(apiMessage.sender, currentUserId),
    content: apiMessage.content,
    timestamp: formatTimestamp(apiMessage.createdAt),
    status: normalizeStatus(apiMessage.status || 'SENT'),
    createdAt: apiMessage.createdAt, // Store original timestamp for sorting
  };
}

/**
 * Maps API Conversation to component Chat type
 */
export function mapApiConversationToChat(apiConversation: ApiConversation, currentUserId: string): Chat {
  // Get the other participant (not the current user)
  // For 1-on-1 chats, there should be 2 participants
  // For group chats, we'll show the first other participant
  const otherParticipant = apiConversation.participants.find(p => p.id !== currentUserId) || apiConversation.participants[0];
  
  // Fallback: if no other participant found, create a placeholder user
  if (!otherParticipant) {
    console.warn('No other participant found in conversation:', apiConversation.id);
    // Return a placeholder chat - this shouldn't happen in normal operation
    return {
      id: apiConversation.id,
      user: {
        id: 'unknown',
        name: 'Unknown User',
        username: 'unknown',
        avatar: { id: 'placeholder', description: 'Unknown user', imageUrl: '', imageHint: 'Unknown' },
        bio: '',
        stats: { followers: 0, following: 0 },
        isVerified: { email: false, phone: false },
        privacy: 'public',
      },
      messages: [],
      lastMessage: '',
      lastMessageTime: formatTimestamp(apiConversation.updatedAt),
      unreadCount: apiConversation.unreadCount || 0,
    };
  }

  const user = mapApiUserToUser(otherParticipant, currentUserId);

  // Format last message preview
  const lastMessage = apiConversation.lastMessage?.content || '';
  const lastMessageTime = apiConversation.lastMessage 
    ? formatTimestamp(apiConversation.lastMessage.createdAt)
    : formatTimestamp(apiConversation.updatedAt);

  return {
    id: apiConversation.id,
    user,
    messages: [], // Messages will be loaded separately
    lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage,
    lastMessageTime,
    unreadCount: apiConversation.unreadCount || 0,
  };
}

/**
 * Formats ISO timestamp to relative time string
 */
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Just now (less than 1 minute)
    if (diffMins < 1) {
      return 'Just now';
    }

    // Today - show time
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // Yesterday
    if (diffDays === 1) {
      return 'Yesterday';
    }
    
    // This week - show day name
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // Older - show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Just now';
  }
}
