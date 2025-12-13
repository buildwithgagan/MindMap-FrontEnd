import { cn } from "@/lib/utils";
import type { Message } from "@/lib/data";
import { Check, CheckCheck } from "lucide-react";

type MessageBubbleProps = {
    message: Message;
}

const MessageStatus = ({ status }: { status: Message['status']}) => {
    if (status === 'sent') {
        return <Check className="h-4 w-4" />
    }
    if (status === 'delivered' || status === 'read') {
        return <CheckCheck className={cn("h-4 w-4", status === 'read' && 'text-primary')} />
    }
    return null;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isMe = message.sender === 'me';
    return (
        <div className={cn(
            "flex items-end gap-2 max-w-lg",
            isMe ? "ml-auto flex-row-reverse" : "mr-auto"
        )}>
            <div className={cn(
                "rounded-2xl p-3",
                isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-accent rounded-bl-none"
            )}>
                <p>{message.content}</p>
            </div>
            {isMe && 
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageStatus status={message.status} />
                </div>
            }
        </div>
    );
}
