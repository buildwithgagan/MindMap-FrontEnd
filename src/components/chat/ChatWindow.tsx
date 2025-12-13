import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Info, Phone, Send, Smile, Paperclip } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { Chat } from "@/lib/data";

type ChatWindowProps = {
    chat: Chat;
    onBack?: () => void;
};

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
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

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chat.messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <TypingIndicator />
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
