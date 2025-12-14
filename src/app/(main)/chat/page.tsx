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
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
    const [conversations, setConversations] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { width } = useWindowSize();
    const isMobile = width < 768; // Corresponds to md breakpoint
    const searchParams = useSearchParams();
    const conversationIdParam = searchParams.get('conversationId');

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

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
