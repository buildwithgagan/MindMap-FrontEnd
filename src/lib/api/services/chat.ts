import { apiClient } from '../client';
import type {
  ApiResponse,
  CreateConversationRequest,
  Conversation,
  PaginatedResponse,
  Message,
  GetMessagesQuery,
} from '../types';

export interface SendMessageRequest {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
}

export const chatService = {
  // Create or find conversation
  async createOrFindConversation(data: CreateConversationRequest): Promise<ApiResponse<Conversation>> {
    return apiClient.fetchWithAuth<Conversation>('/api/v1/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // List conversations
  async listConversations(): Promise<ApiResponse<Conversation[]>> {
    return apiClient.fetchWithAuth<Conversation[]>('/api/v1/chat/conversations');
  },

  // Get messages
  async getMessages(conversationId: string, query?: GetMessagesQuery): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const params = new URLSearchParams();
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/chat/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;

    return apiClient.fetchWithAuth<PaginatedResponse<Message>>(endpoint);
  },

  // Send message
  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<ApiResponse<Message>> {
    return apiClient.fetchWithAuth<Message>(`/api/v1/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: data.content,
        type: data.type || 'TEXT',
      }),
    });
  },
};
