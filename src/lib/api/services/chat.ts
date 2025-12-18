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

export interface PollMessagesQuery {
  since?: string; // ISO timestamp
  lastMessageId?: string;
  limit?: number; // 1-100 (default 20)
}

export interface SendMessageViaApiRequest {
  conversationId: string;
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

    try {
      return await apiClient.fetchWithAuth<PaginatedResponse<Message>>(endpoint);
    } catch (err) {
      // Some deployments use a flatter messages endpoint instead of the conversations/:id/messages route.
      // If we get a 404, retry a compatible alternative:
      // GET /api/v1/chat/messages?conversationId=...&cursor=...&pageSize=...
      const status = (err as any)?.status;
      if (status === 404) {
        const altParams = new URLSearchParams();
        altParams.append('conversationId', conversationId);
        if (query?.cursor) altParams.append('cursor', query.cursor);
        if (query?.pageSize) altParams.append('pageSize', query.pageSize.toString());
        const altEndpoint = `/api/v1/chat/messages?${altParams.toString()}`;
        return apiClient.fetchWithAuth<PaginatedResponse<Message>>(altEndpoint);
      }
      throw err;
    }
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

  // Poll messages (staging transport)
  async pollMessages(query: PollMessagesQuery = {}): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const params = new URLSearchParams();
    if (query.since) params.append('since', query.since);
    if (query.lastMessageId) params.append('lastMessageId', query.lastMessageId);
    if (typeof query.limit === 'number') params.append('limit', query.limit.toString());

    const qs = params.toString();
    const endpoint = `/api/v1/chat/messages/poll${qs ? `?${qs}` : ''}`;
    return apiClient.fetchWithAuth<PaginatedResponse<Message>>(endpoint);
  },

  // Send message via REST (staging transport)
  async sendMessageViaApi(data: SendMessageViaApiRequest): Promise<ApiResponse<Message>> {
    try {
      return await apiClient.fetchWithAuth<Message>('/api/v1/chat/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: data.conversationId,
          content: data.content,
          type: data.type || 'TEXT',
        }),
      });
    } catch (err) {
      // Some deployments use POST /api/v1/chat/messages (no /send).
      // If we get a 404, retry the alternative route with the same payload.
      const status = (err as any)?.status;
      if (status === 404) {
        return apiClient.fetchWithAuth<Message>('/api/v1/chat/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: data.conversationId,
            content: data.content,
            type: data.type || 'TEXT',
          }),
        });
      }
      throw err;
    }
  },
};
