import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Info, Phone, Send, Smile, Paperclip, AlertCircle, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { Chat, Message } from "@/lib/data";
import { useEffect, useState, useRef } from "react";
import { chatService } from "@/lib/api";
import { mapApiMessageToMessage } from "@/lib/chat-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { socketClient } from "@/lib/socket";
import type { Message as ApiMessage } from "@/lib/api/types";

type ChatWindowProps = {
    chat: Chat;
    onBack?: () => void;
    currentUserId: string;
};

export default function ChatWindow({ chat, onBack, currentUserId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | undefined>();
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load messages when chat opens
        loadMessages();
    }, [chat.id]);

    useEffect(() => {
        // Scroll to bottom when messages load
        if (messages.length > 0 && !loading) {
            scrollToBottom();
        }
    }, [messages, loading]);

    // Set up socket listeners for real-time messages
    useEffect(() => {
        if (!socketClient.isConnected()) {
            return;
        }

        // Listen for new messages in this conversation
        const handleNewMessage = (data: any) => {
            // Check if message belongs to current conversation
            const message = data.message || data;
            if (message.conversationId === chat.id) {
                try {
                    const mappedMessage = mapApiMessageToMessage(message as ApiMessage, currentUserId);
                    setMessages(prev => [...prev, mappedMessage]);
                } catch (error) {
                    console.error('Error mapping new message:', error);
                }
            }
        };

        // Listen for message status updates
        const handleMessageDelivered = (data: any) => {
            if (data.conversationId === chat.id && data.messageId) {
                setMessages(prev => prev.map(msg => 
                    msg.id === data.messageId ? { ...msg, status: 'delivered' as const } : msg
                ));
            }
        };

        const handleMessageRead = (data: any) => {
            if (data.conversationId === chat.id && data.messageId) {
                setMessages(prev => prev.map(msg => 
                    msg.id === data.messageId ? { ...msg, status: 'read' as const } : msg
                ));
            }
        };

        // Subscribe to socket events
        const unsubscribeNew = socketClient.on('message:new', handleNewMessage);
        const unsubscribeDelivered = socketClient.on('message:delivered', handleMessageDelivered);
        const unsubscribeRead = socketClient.on('message:read', handleMessageRead);

        // Cleanup on unmount or conversation change
        return () => {
            unsubscribeNew();
            unsubscribeDelivered();
            unsubscribeRead();
        };
    }, [chat.id, currentUserId]);

    const loadMessages = async (cursor?: string) => {
        try {
            if (cursor) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await chatService.getMessages(chat.id, {
                cursor,
                pageSize: 50,
            });

            if (response.success && response.data) {
                const paginatedData = response.data;
                // Handle both response structures: data.data or data.messages
                const messagesArray = (paginatedData as any).messages || paginatedData.data || [];
                
                if (!Array.isArray(messagesArray)) {
                    console.error('Messages data is not an array:', messagesArray);
                    setError('Invalid messages data format');
                    return;
                }

                const mappedMessages = messagesArray.map((msg: any) => 
                    mapApiMessageToMessage(msg, currentUserId)
                );

                if (cursor) {
                    // Append older messages at the top
                    setMessages(prev => [...mappedMessages.reverse(), ...prev]);
                } else {
                    // Initial load - reverse to show newest at bottom
                    setMessages(mappedMessages.reverse());
                }

                setNextCursor(paginatedData.nextCursor);
                setHasMore(paginatedData.hasMore || false);
            } else {
                setError('Failed to load messages');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
            setError(errorMessage);
            console.error('Error loading messages:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreMessages = () => {
        if (nextCursor && !loadingMore && !loading) {
            loadMessages(nextCursor);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        // Load more when scrolled near the top
        if (container.scrollTop < 100 && hasMore && !loadingMore) {
            loadMoreMessages();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 p-4 border-b">
                {onBack && (
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
                        <ArrowLeft />
                    </Button>
                )}
                <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.user.avatar.imageUrl} data-ai-hint={chat.user.avatar.imageHint}/>
                    <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold">{chat.user.name}</p>
                    <p className="text-sm text-muted-foreground">@{chat.user.username}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Phone />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Info />
                    </Button>
                </div>
            </div>

            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6"
                onScroll={handleScroll}
            >
                {loading && messages.length === 0 ? (
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-end gap-2 max-w-lg">
                                <Skeleton className="h-16 w-48 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                ) : error && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Alert variant="destructive" className="max-w-md">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="flex flex-col gap-2">
                                <span>{error}</span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => loadMessages()}
                                    className="w-fit"
                                >
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    <>
                        {loadingMore && (
                            <div className="flex justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-muted-foreground">No messages yet</p>
                                <p className="text-sm text-muted-foreground mt-2">Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 border-t bg-card">
                <div className="relative">
                    <Input placeholder="Type a message..." className="pr-32 rounded-full h-12" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Paperclip />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Smile />
                        </Button>
                        <Button size="icon" className="rounded-full">
                            <Send />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
