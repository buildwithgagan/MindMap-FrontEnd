import { cn } from "@/lib/utils";
import type { Message } from "@/lib/data";
import { Check } from "lucide-react";

type MessageBubbleProps = {
    message: Message;
}

const MessageStatus = ({ status }: { status: Message['status']}) => {
    // Normalize status to lowercase for comparison (backend sends uppercase)
    const normalizedStatus = status?.toLowerCase() || 'sent';
    
    if (process.env.NODE_ENV === 'development') {
        console.log('📊 MessageStatus render:', { status, normalizedStatus });
    }
    
    // SENT: Single gray checkmark
    if (normalizedStatus === 'sent') {
        return (
            <Check className="h-3.5 w-3.5 text-gray-400" />
        );
    }
    
    // DELIVERED: Double gray checkmark
    if (normalizedStatus === 'delivered') {
        return (
            <div className="flex items-center -space-x-1">
                <Check className="h-3.5 w-3.5 text-gray-400" />
                <Check className="h-3.5 w-3.5 text-gray-400" />
            </div>
        );
    }
    
    // READ: Double blue checkmark
    if (normalizedStatus === 'read') {
        return (
            <div className="flex items-center -space-x-1">
                <Check className="h-3.5 w-3.5 text-blue-500" />
                <Check className="h-3.5 w-3.5 text-blue-500" />
            </div>
        );
    }
    
    return null;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isMe = message.sender === 'me';
    
    // Debug log to see message sender
    if (process.env.NODE_ENV === 'development') {
        console.log('💬 MessageBubble render:', {
            messageId: message.id,
            sender: message.sender,
            senderType: typeof message.sender,
            isMe,
            content: message.content.substring(0, 30),
        });
    }
    
    return (
        <div className={cn(
            "flex flex-col gap-1 max-w-lg",
            isMe ? "ml-auto items-end" : "mr-auto items-start"
        )}>
            <div className={cn(
                "flex items-end gap-2",
                isMe ? "flex-row-reverse" : "flex-row"
            )}>
                <div className={cn(
                    "rounded-2xl p-3",
                    isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-accent rounded-bl-none"
                )}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                {isMe && 
                    <div className="flex items-center gap-0.5 shrink-0">
                        <MessageStatus status={message.status} />
                    </div>
                }
            </div>
            {/* Timestamp - Show time only (date is shown in DateHeader) */}
            <div className={cn(
                "text-xs text-muted-foreground px-1 mb-1",
                isMe ? "text-right" : "text-left"
            )}>
                {message.createdAt ? (() => {
                    // Extract time from timestamp (show only time, not date since date header shows date)
                    try {
                        const msgDate = new Date(message.createdAt);
                        const now = new Date();
                        const diffMs = now.getTime() - msgDate.getTime();
                        const diffMins = Math.floor(diffMs / 60000);

                        // Show "Just now" for very recent messages, otherwise show time
                        if (diffMins < 1) {
                            return 'Just now';
                        }
                        return msgDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    } catch {
                        return message.timestamp.split(' ').pop() || message.timestamp; // Fallback: extract time from formatted timestamp
                    }
                })() : message.timestamp}
            </div>
        </div>
    );
}
