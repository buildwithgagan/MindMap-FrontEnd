import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Chat } from "@/lib/data";
import { Search, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { socketClient } from "@/lib/socket";
import { useEffect, useState } from "react";

type ChatListProps = {
    conversations: Chat[];
    selectedChat: Chat | null;
    onSelectChat: (chat: Chat) => void;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

export default function ChatList({ conversations, selectedChat, onSelectChat, loading = false, error = null, onRetry }: ChatListProps) {
    const [socketStatus, setSocketStatus] = useState(socketClient.getConnectionStatus());

    useEffect(() => {
        // Update socket status periodically
        const interval = setInterval(() => {
            setSocketStatus(socketClient.getConnectionStatus());
        }, 2000);

        // Listen for socket events
        const unsubscribeConnect = socketClient.on('connect', () => {
            setSocketStatus(socketClient.getConnectionStatus());
        });
        const unsubscribeDisconnect = socketClient.on('disconnect', () => {
            setSocketStatus(socketClient.getConnectionStatus());
        });
        const unsubscribeError = socketClient.on('error', () => {
            setSocketStatus(socketClient.getConnectionStatus());
        });

        return () => {
            clearInterval(interval);
            unsubscribeConnect();
            unsubscribeDisconnect();
            unsubscribeError();
        };
    }, []);

    return (
        <div className="flex flex-col h-full md:border-r">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold">Messages</h1>
                    <div className="flex items-center gap-2">
                        {socketStatus.isConnected ? (
                            <div className="flex items-center gap-1 text-green-500 text-xs">
                                <Wifi className="h-3 w-3" />
                                <span>Connected</span>
                            </div>
                        ) : socketStatus.isConnecting ? (
                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                <Wifi className="h-3 w-3 animate-pulse" />
                                <span>Connecting...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-500 text-xs">
                                <WifiOff className="h-3 w-3" />
                                <span>Disconnected</span>
                            </div>
                        )}
                    </div>
                </div>
                {!socketStatus.isConnected && !socketStatus.isConnecting && (
                    <Alert variant="destructive" className="mt-2 mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Socket connection failed. Real-time features unavailable. 
                            {socketStatus.reconnectAttempts > 0 && ` (Retry ${socketStatus.reconnectAttempts}/${socketStatus.reconnectAttempts})`}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search messages" className="pl-9 rounded-full"/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                    <div className="p-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error && conversations.length === 0 ? (
                    <div className="p-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="flex flex-col gap-2">
                                <span>{error}</span>
                                {onRetry && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={onRetry}
                                        className="w-fit"
                                    >
                                        Retry
                                    </Button>
                                )}
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <p className="text-muted-foreground">No conversations yet</p>
                        <p className="text-sm text-muted-foreground mt-2">Start a conversation to see messages here</p>
                    </div>
                ) : (
                    conversations.map((chat) => (
                        <div 
                            key={chat.id} 
                            className={cn(
                                "flex items-center gap-4 p-4 cursor-pointer",
                                selectedChat?.id === chat.id ? "bg-accent" : "hover:bg-accent"
                            )}
                            onClick={() => onSelectChat(chat)}
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={chat.user.avatar.imageUrl} data-ai-hint={chat.user.avatar.imageHint} />
                                <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between">
                                    <p className="font-bold truncate">{chat.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{chat.lastMessageTime}</p>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                    {chat.unreadCount > 0 && (
                                        <Badge className="h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-primary-foreground text-xs flex-shrink-0">
                                            {chat.unreadCount}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
