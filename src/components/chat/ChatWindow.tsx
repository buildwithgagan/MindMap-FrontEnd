import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Info, Phone, Send, Smile, Paperclip, AlertCircle, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import DateHeader from "./DateHeader";
import type { Chat, Message } from "@/lib/data";
import { useEffect, useState, useRef } from "react";
import { chatService } from "@/lib/api";
import { mapApiMessageToMessage } from "@/lib/chat-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { socketClient } from "@/lib/socket";
import type { Message as ApiMessage } from "@/lib/api/types";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

type ChatWindowProps = {
    chat: Chat;
    onBack?: () => void;
    currentUserId: string;
    isMobile?: boolean;
};

export default function ChatWindow({ chat, onBack, currentUserId, isMobile = false }: ChatWindowProps) {
    // Debug: Make currentUserId accessible in console
    if (process.env.NODE_ENV === 'development') {
        (window as any).__debugChatWindowCurrentUserId = currentUserId;
        console.log('💡 ChatWindow - currentUserId prop:', currentUserId);
    }
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | undefined>();
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const hasMarkedAsReadRef = useRef(false); // Track if we've already marked this conversation as read

    // Use typing indicator hook
    const { typingUsers, typingUsersWithNames, emitTyping, emitStopTyping } = useTypingIndicator({
        socket: socketClient,
        conversationId: chat.id,
        currentUserId,
        enabled: !!chat.id && !!currentUserId,
    });

    useEffect(() => {
        // Load messages when chat opens
        loadMessages();
        
        // Join conversation room when chat opens
        const joinRoom = () => {
            if (socketClient.isConnected()) {
                socketClient.joinConversation(chat.id);
            }
        };
        
        // Join immediately if connected, otherwise wait for connection
        joinRoom();
        
        // Also join when socket connects
        const unsubscribeConnect = socketClient.on('connect', () => {
            joinRoom();
        });
        
        // Cleanup: Leave conversation room when chat closes
        return () => {
            unsubscribeConnect();
            if (socketClient.isConnected()) {
                socketClient.leaveConversation(chat.id);
            }
        };
    }, [chat.id]);

    // Mark conversation as read when user opens/views it
    useEffect(() => {
        // Reset the read flag when conversation changes
        hasMarkedAsReadRef.current = false;
    }, [chat.id]);

    // Mark conversation as read when user opens/views it (debounced to avoid excessive calls)
    useEffect(() => {
        // Only mark as read if:
        // 1. Socket is connected
        // 2. Messages have loaded
        // 3. We haven't already marked this conversation as read
        if (socketClient.isConnected() && !loading && messages.length > 0 && !hasMarkedAsReadRef.current) {
            // Use a small delay to debounce and ensure messages are fully rendered
            const timeoutId = setTimeout(() => {
                // Emit message_read event to mark entire conversation as read
                // Backend will mark all unread messages in this conversation as read
                socketClient.send('message_read', {
                    conversationId: chat.id,
                    // No messageId = mark all messages in conversation as read
                });
                hasMarkedAsReadRef.current = true;
                console.log('📖 [ChatWindow] Marked conversation as read:', chat.id);
            }, 500); // 500ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [chat.id, loading, messages.length]);

    useEffect(() => {
        // Scroll to bottom when messages load
        if (messages.length > 0 && !loading) {
            scrollToBottom();
        }
    }, [messages, loading]);

    // Set up socket listeners for real-time messages
    useEffect(() => {
        // Listen for new messages in this conversation
        // Backend sends 'new_message' event with MessageResult payload
        const handleNewMessage = (messageData: any) => {
            // Backend sends the message directly (not wrapped in data.message)
            // The payload is the MessageResult object itself
            const message = messageData;
            
            // Check if message belongs to current conversation
            if (message.conversationId === chat.id) {
                try {
                    const mappedMessage = mapApiMessageToMessage(message as ApiMessage, currentUserId);
                    
                    // Check if message already exists (avoid duplicates)
                    setMessages(prev => {
                        const exists = prev.some(msg => msg.id === mappedMessage.id);
                        if (exists) {
                            // Update existing message (in case status changed)
                            return prev.map(msg => 
                                msg.id === mappedMessage.id ? mappedMessage : msg
                            );
                        }
                        
                        // Check if this might be replacing an optimistic message (temp ID)
                        // Match by content and sender if message was sent recently
                        const isOptimistic = mappedMessage.sender === 'me';
                        if (isOptimistic) {
                            // Find and replace optimistic message with same content
                            const optimisticIndex = prev.findIndex(msg => 
                                msg.id.startsWith('temp-') && 
                                msg.content === mappedMessage.content &&
                                msg.sender === 'me'
                            );
                            
                            if (optimisticIndex !== -1) {
                                // Replace optimistic message
                                const updated = [...prev];
                                updated[optimisticIndex] = mappedMessage;
                                return updated;
                            }
                        }
                        
                        // Add new message at the end (bottom)
                        // Ensure messages are sorted by createdAt
                        const updated = [...prev, mappedMessage].sort((a, b) => {
                            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return timeA - timeB; // Ascending: oldest first, newest last
                        });
                        return updated;
                    });
                    
                    // Acknowledge delivery if this is a received message (not from current user)
                    // and user is currently viewing this conversation
                    if (mappedMessage.sender !== 'me' && socketClient.isConnected()) {
                        // Emit message_delivered event
                        socketClient.send('message_delivered', {
                            messageId: message.id,
                            conversationId: chat.id,
                        });
                        console.log('📬 [ChatWindow] Acknowledged delivery for message:', message.id);
                    }
                    
                    // Scroll to bottom when new message arrives
                    setTimeout(() => scrollToBottom(), 100);
                } catch (error) {
                    console.error('Error mapping new message:', error);
                }
            }
        };

        // Listen for message status updates from backend
        const handleMessageStatusUpdate = (data: any) => {
            console.log('📊 [ChatWindow] Received message_status_update:', data);
            const { messageId, conversationId, status, updatedAt } = data;
            
            // Only process status updates for current conversation
            if (conversationId === chat.id && messageId) {
                // Normalize status from backend (uppercase) to frontend format (lowercase)
                const normalizedStatus = status?.toLowerCase() as 'sent' | 'delivered' | 'read';
                
                if (!normalizedStatus || !['sent', 'delivered', 'read'].includes(normalizedStatus)) {
                    console.warn('📊 [ChatWindow] Invalid status received:', status);
                    return;
                }
                
                setMessages(prev => {
                    const updated = prev.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, status: normalizedStatus } 
                            : msg
                    );
                    console.log('📊 [ChatWindow] Status updated in state:', { messageId, status: normalizedStatus, found: prev.some(m => m.id === messageId) });
                    return updated;
                });
            } else {
                console.log('📊 [ChatWindow] Status update ignored:', { 
                    conversationId, 
                    currentChatId: chat.id, 
                    messageId,
                    matches: conversationId === chat.id 
                });
            }
        };

        // Legacy handlers for backward compatibility (if backend still sends these)
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

        // Handle socket errors (suppress in staging/production)
        const handleSocketError = (errorData: any) => {
            const isDevelopment = process.env.NODE_ENV === 'development';
            if (isDevelopment) {
                console.error('Socket error:', errorData);
                if (errorData.code && errorData.message) {
                    setError(`Socket error: ${errorData.message}`);
                }
            } else {
                // Silently log in staging/production
                console.warn('Socket error (suppressed in production):', errorData.message);
            }
        };

        // Subscribe to socket events
        // Listen to both 'new_message' (backend event) and 'message:new' (for backward compatibility)
        const unsubscribeNew = socketClient.on('new_message', handleNewMessage);
        const unsubscribeNewCompat = socketClient.on('message:new', handleNewMessage);
        const unsubscribeStatusUpdate = socketClient.on('message_status_update', handleMessageStatusUpdate);
        const unsubscribeDelivered = socketClient.on('message:delivered', handleMessageDelivered);
        const unsubscribeRead = socketClient.on('message:read', handleMessageRead);
        const unsubscribeError = socketClient.on('error', handleSocketError);
        
        console.log('✅ [ChatWindow] Socket listeners set up for conversation:', chat.id);
        
        // Cleanup on unmount or conversation change
        return () => {
            unsubscribeNew();
            unsubscribeNewCompat();
            unsubscribeStatusUpdate();
            unsubscribeDelivered();
            unsubscribeRead();
            unsubscribeError();
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
                // Backend returns MessagesListResult: { messages: MessageResult[], nextCursor?, hasMore }
                // But we also support PaginatedResponse: { data: Message[], nextCursor?, hasMore }
                const messagesArray = (paginatedData as any).messages || paginatedData.data || [];
                
                if (!Array.isArray(messagesArray)) {
                    console.error('Messages data is not an array:', messagesArray);
                    setError('Invalid messages data format');
                    return;
                }

                const mappedMessages = messagesArray.map((msg: any) => 
                    mapApiMessageToMessage(msg, currentUserId)
                );

                // Sort messages by timestamp (oldest first, newest last - newest at bottom)
                const sortedMessages = [...mappedMessages].sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeA - timeB; // Ascending: oldest first, newest last
                });

                if (cursor) {
                    // Append older messages at the top (they come in oldest-first order from pagination)
                    // Merge and sort to ensure proper ordering
                    // Save current scroll position before updating
                    const container = messagesContainerRef.current;
                    const scrollHeightBefore = container?.scrollHeight || 0;
                    const scrollTopBefore = container?.scrollTop || 0;
                    
                    setMessages(prev => {
                        const merged = [...sortedMessages, ...prev];
                        return merged.sort((a, b) => {
                            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return timeA - timeB;
                        });
                    });
                    
                    // Restore scroll position after messages are rendered
                    setTimeout(() => {
                        if (container) {
                            const scrollHeightAfter = container.scrollHeight;
                            const scrollDiff = scrollHeightAfter - scrollHeightBefore;
                            container.scrollTop = scrollTopBefore + scrollDiff;
                        }
                    }, 0);
                } else {
                    // Initial load - show newest at bottom (oldest at top, newest at bottom)
                    setMessages(sortedMessages);
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

    // Handle typing - uses the hook's emitTyping which handles debouncing
    const handleTyping = () => {
        emitTyping();
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessageInput(value);
        handleTyping();
    };

    // Handle input blur - stop typing when user leaves input field
    const handleInputBlur = () => {
        emitStopTyping();
    };

    // Handle keyboard events for typing indicators
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Trigger typing on any key press (except modifier keys)
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            // Don't trigger for arrow keys, escape, etc.
            if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                handleTyping();
            }
        }
    };

    // Handle send message
    const handleSendMessage = async () => {
        const trimmedMessage = messageInput.trim();
        if (!trimmedMessage || sending) {
            return;
        }

        // Validate message length (max 2000 characters as per backend)
        if (trimmedMessage.length > 2000) {
            setError('Message is too long. Maximum length is 2000 characters.');
            return;
        }

        // Stop typing when message is sent
        emitStopTyping();

        setSending(true);
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        
        // Create optimistic message for immediate UI update
        const now = new Date().toISOString();
        const optimisticMessage: Message = {
            id: tempId,
            sender: 'me',
            content: trimmedMessage,
            timestamp: 'Just now', // Will be updated when real message arrives
            status: 'sent',
            createdAt: now, // For sorting
        };

        // Add message to local state immediately (at the end/bottom)
        setMessages(prev => {
            const updated = [...prev, optimisticMessage];
            // Ensure messages are sorted
            return updated.sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeA - timeB;
            });
        });
        setMessageInput('');
        scrollToBottom();

        try {
            // Send message via socket
            if (!socketClient.isConnected()) {
                throw new Error('Socket not connected. Please check your connection.');
            }

            // Fire send_message socket event with all necessary message items
            console.log('🚀 [ChatWindow] Firing send_message socket event:', {
                conversationId: chat.id,
                content: trimmedMessage,
                type: 'TEXT',
            });
            socketClient.send('send_message', {
                conversationId: chat.id,
                content: trimmedMessage,
                type: 'TEXT',
            });

            // The real message will come back via the 'new_message' socket event
            // which is handled in the useEffect hook above
            // The optimistic message will be replaced when the real message arrives
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setMessageInput(trimmedMessage); // Restore message input
            
            // Show error to user
            setError(error instanceof Error ? error.message : 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
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
                className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col"
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
                            <>
                                {(() => {
                                    // Group messages by date
                                    const groupedMessages: Array<{ date: Date; messages: Message[] }> = [];
                                    let currentGroup: { date: Date; messages: Message[] } | null = null;

                                    messages.forEach((msg) => {
                                        if (!msg.createdAt) return;

                                        const msgDate = new Date(msg.createdAt);
                                        msgDate.setHours(0, 0, 0, 0);

                                        if (!currentGroup || currentGroup.date.getTime() !== msgDate.getTime()) {
                                            // New date group
                                            currentGroup = {
                                                date: msgDate,
                                                messages: [msg],
                                            };
                                            groupedMessages.push(currentGroup);
                                        } else {
                                            // Same date, add to current group
                                            currentGroup.messages.push(msg);
                                        }
                                    });

                                    return (
                                        <>
                                            {groupedMessages.map((group, groupIndex) => (
                                                <div key={`date-${group.date.getTime()}-${groupIndex}`}>
                                                    <DateHeader date={group.date} />
                                                    {group.messages.map((msg) => (
                                                        <MessageBubble key={msg.id} message={msg} />
                                                    ))}
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}
                                {typingUsers.length > 0 && (() => {
                                    // Format typing text for multiple users
                                    let typingText = '';
                                    if (typingUsers.length === 1) {
                                        const userId = typingUsers[0];
                                        const userName = typingUsersWithNames.get(userId) || chat.user.name;
                                        typingText = `${userName} is typing...`;
                                    } else if (typingUsers.length === 2) {
                                        const firstUserId = typingUsers[0];
                                        const secondUserId = typingUsers[1];
                                        const firstName = typingUsersWithNames.get(firstUserId) || 'Someone';
                                        const secondName = typingUsersWithNames.get(secondUserId) || 'Someone';
                                        typingText = `${firstName} and ${secondName} are typing...`;
                                    } else {
                                        const firstUserId = typingUsers[0];
                                        const firstName = typingUsersWithNames.get(firstUserId) || 'Someone';
                                        const othersCount = typingUsers.length - 1;
                                        typingText = `${firstName} and ${othersCount} other${othersCount > 1 ? 's' : ''} are typing...`;
                                    }
                                    
                                    return (
                                        <TypingIndicator 
                                            text={typingText}
                                            showText={true}
                                        />
                                    );
                                })()}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 border-t bg-card">
                <div className="relative">
                    <Input 
                        placeholder="Type a message..." 
                        className="pr-32 rounded-full h-12" 
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onKeyPress={handleKeyPress}
                        onBlur={handleInputBlur}
                        disabled={sending}
                        maxLength={2000}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Paperclip />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Smile />
                        </Button>
                        <Button 
                            size="icon" 
                            className="rounded-full"
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || sending}
                        >
                            <Send />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
