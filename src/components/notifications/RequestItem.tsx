import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/data";

type RequestItemProps = {
    notification: Notification;
}

export default function RequestItem({ notification }: RequestItemProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl p-3 hover:bg-accent">
            <Avatar className="h-12 w-12">
                <AvatarImage src={notification.user.avatar.imageUrl} alt={notification.user.name} data-ai-hint={notification.user.avatar.imageHint} />
                <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p>
                    <span className="font-bold">{notification.user.name}</span>
                    <span className="text-muted-foreground"> wants to follow you.</span>
                </p>
                <p className="text-sm text-muted-foreground">{notification.timestamp}</p>
            </div>
            <div className="flex gap-2">
                <Button size="sm" className="rounded-full">Accept</Button>
                <Button size="sm" variant="secondary" className="rounded-full">Decline</Button>
            </div>
        </div>
    );
}
