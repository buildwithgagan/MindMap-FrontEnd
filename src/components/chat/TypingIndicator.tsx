import { cn } from "@/lib/utils";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 p-3 rounded-2xl bg-accent w-fit rounded-bl-none">
      <div className={cn("h-2 w-2 rounded-full bg-muted-foreground animate-pulse")}></div>
      <div className={cn("h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]")}></div>
      <div className={cn("h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]")}></div>
    </div>
  );
}
