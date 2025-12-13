import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Chat } from "@/lib/data";
import { Search } from "lucide-react";

type ChatListProps = {
    chats: Chat[];
    selectedChat: Chat | null;
    onSelectChat: (chat: Chat) => void;
}

export default function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
    return (
        <div className="flex flex-col border-r h-full">
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Messages</h1>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search messages" className="pl-9 rounded-full"/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
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
                            <div className="flex justify-between">
                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                {chat.unreadCount > 0 && (
                                    <Badge className="h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-primary-foreground">{chat.unreadCount}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
