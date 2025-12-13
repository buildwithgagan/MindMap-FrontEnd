
'use client';

import { useState } from 'react';
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { chats, type Chat } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { useWindowSize } from 'usehooks-ts';

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0]);
    const { width } = useWindowSize();
    const isMobile = width < 768; // Corresponds to md breakpoint

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
                    <ChatList chats={chats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
                </div>
                {selectedChat && (
                    <div className={cn(!showChatWindow && "hidden", "md:flex flex-col col-span-2")}>
                         <ChatWindow 
                            key={selectedChat.id} 
                            chat={selectedChat} 
                            onBack={isMobile ? handleBack : undefined} 
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
