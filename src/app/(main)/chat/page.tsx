'use client';

import { useState, useEffect } from 'react';
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import type { Chat } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { useWindowSize } from 'usehooks-ts';
import { chatService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { mapApiConversationToChat } from '@/lib/chat-utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSearchParams, usePathname } from 'next/navigation';
import { socketClient } from '@/lib/socket';
import { apiClient } from '@/lib/api/client';

export default function ChatPage() {
    const [conversations, setConversations] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { width } = useWindowSize();
    const isMobile = width < 768; // Corresponds to md breakpoint
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const conversationIdParam = searchParams.get('conversationId');

    useEffect(() => {
        if (user) {
            if (process.env.NODE_ENV === 'development') {
                console.log('💡 ChatPage - Current User ID:', user.id);
                console.log('💡 ChatPage - Full User Object:', user);
                // Make it accessible in console for debugging
                (window as any).__debugCurrentUserId = user.id;
                (window as any).__debugCurrentUser = user;
            }
            loadConversations();
        }
    }, [user]);

    // Listen for new messages to refresh conversation list
    useEffect(() => {
        if (!socketClient.isConnected()) {
            return;
        }

        const handleNewMessage = (messageData: any) => {
            // When a new message arrives, refresh the conversation list
            // to update lastMessage and unreadCounts
            if (user) {
                loadConversations();
            }
        };

        const unsubscribeNew = socketClient.on('new_message', handleNewMessage);
        const unsubscribeNewCompat = socketClient.on('message:new', handleNewMessage);

        return () => {
            unsubscribeNew();
            unsubscribeNewCompat();
        };
    }, [user]);

    // Debug: Log when selectedChat changes and user is available
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && selectedChat) {
            console.log('🔍 [ChatPage] Rendering ChatWindow with:', {
                userId: user?.id,
                userExists: !!user,
                currentUserIdValue: user?.id || '',
                selectedChatId: selectedChat?.id,
                willPassToChatWindow: user?.id || 'EMPTY STRING',
            });
        }
    }, [selectedChat, user]);

    // Retry socket connection when navigating to messages tab (only if not connected)
    useEffect(() => {
        // Only retry when on chat page
        if (pathname === '/chat' && user) {
            const connectionStatus = socketClient.getConnectionStatus();
            
            // Only retry if not connected and not already connecting
            if (!connectionStatus.isConnected && !connectionStatus.isConnecting) {
                const accessToken = apiClient.getAccessToken();
                if (accessToken) {
                    console.log('🔄 [Chat] Socket not connected, attempting to reconnect...');
                    console.log('🔍 [Chat] Connection status:', connectionStatus);
                    
                    socketClient.connect(accessToken)
                        .then(() => {
                            console.log('✅ [Chat] Socket reconnected successfully');
                        })
                        .catch((error) => {
                            console.warn('⚠️ [Chat] Failed to reconnect socket:', error.message);
                            // Don't show error - it's expected if server isn't running
                        });
                } else {
                    console.warn('⚠️ [Chat] No access token available for socket connection');
                }
            } else if (connectionStatus.isConnected) {
                console.log('✅ [Chat] Socket already connected');
            } else if (connectionStatus.isConnecting) {
                console.log('⏳ [Chat] Socket connection already in progress');
            }
        }
    }, [pathname, user]);

    useEffect(() => {
        // Select conversation from query parameter if provided
        if (conversationIdParam && conversations.length > 0) {
            const conversation = conversations.find(c => c.id === conversationIdParam);
            if (conversation) {
                setSelectedChat(conversation);
            }
        }
    }, [conversationIdParam, conversations]);

    const loadConversations = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const response = await chatService.listConversations();
            
            if (response.success && response.data) {
                const mappedConversations = response.data.map(conv => 
                    mapApiConversationToChat(conv, user.id)
                );
                setConversations(mappedConversations);
                
                // Select conversation from query parameter if provided, otherwise auto-select first
                if (conversationIdParam) {
                    const conversation = mappedConversations.find(c => c.id === conversationIdParam);
                    if (conversation) {
                        setSelectedChat(conversation);
                    } else if (mappedConversations.length > 0 && !selectedChat) {
                        setSelectedChat(mappedConversations[0]);
                    }
                } else if (mappedConversations.length > 0 && !selectedChat) {
                    setSelectedChat(mappedConversations[0]);
                }
            } else {
                setError('Failed to load conversations');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
            setError(errorMessage);
            console.error('Error loading conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
    }

    const handleBack = () => {
        setSelectedChat(null);
    }

    const showChatList = !isMobile || (isMobile && !selectedChat);
    const showChatWindow = !isMobile || (isMobile && selectedChat);

    return (
        <div className="h-[calc(100vh-10rem)]">
            <Card className="h-full w-full border-none bg-card shadow-diffused md:grid md:grid-cols-3 rounded-3xl overflow-hidden">
                <div className={cn(!showChatList && "hidden", "md:flex flex-col")}>
                    <ChatList 
                        conversations={conversations}
                        selectedChat={selectedChat} 
                        onSelectChat={handleSelectChat}
                        loading={loading}
                        error={error}
                        onRetry={loadConversations}
                    />
                </div>
                {selectedChat && (
                    <div className={cn(!showChatWindow && "hidden", "md:flex flex-col col-span-2")}>
                         <ChatWindow 
                            key={selectedChat.id} 
                            chat={selectedChat} 
                            onBack={isMobile ? handleBack : undefined}
                            currentUserId={user?.id || ''}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
