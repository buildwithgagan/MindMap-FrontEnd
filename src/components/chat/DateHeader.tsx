import { cn } from "@/lib/utils";

type DateHeaderProps = {
    date: Date;
};

export default function DateHeader({ date }: DateHeaderProps) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    const yesterdayDate = new Date(yesterday);
    yesterdayDate.setHours(0, 0, 0, 0);

    let dateLabel: string;

    if (messageDate.getTime() === todayDate.getTime()) {
        dateLabel = 'Today';
    } else if (messageDate.getTime() === yesterdayDate.getTime()) {
        dateLabel = 'Yesterday';
    } else {
        // Show date like "December 14, 2024" or shorter format
        const isCurrentYear = messageDate.getFullYear() === today.getFullYear();
        if (isCurrentYear) {
            dateLabel = messageDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
            });
        } else {
            dateLabel = messageDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    return (
        <div className="flex items-center justify-center my-4">
            <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
                {dateLabel}
            </div>
        </div>
    );
}
