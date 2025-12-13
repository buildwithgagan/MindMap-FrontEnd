import { notifications } from "@/lib/data";
import RequestItem from "@/components/notifications/RequestItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
    const followRequests = notifications.filter(n => n.type === 'follow_request');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Notifications</h1>
            
            <Card className="border-none bg-card shadow-diffused rounded-3xl">
                <CardHeader>
                    <CardTitle>Follow Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {followRequests.length > 0 ? (
                        <div className="space-y-4">
                            {followRequests.map(notif => (
                                <RequestItem key={notif.id} notification={notif} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No new follow requests.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
