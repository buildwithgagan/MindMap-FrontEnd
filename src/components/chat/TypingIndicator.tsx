import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  /**
   * Optional text to display next to the typing dots
   * e.g., "John is typing..." or "John and 2 others are typing..."
   */
  text?: string;
  /**
   * Whether to show the text label
   */
  showText?: boolean;
}

export default function TypingIndicator({ text, showText = false }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center space-x-1.5 p-3 rounded-2xl bg-accent w-fit rounded-bl-none">
        <div 
          className={cn(
            "h-2 w-2 rounded-full bg-muted-foreground",
            "animate-typing-bounce"
          )}
          style={{ animationDelay: '0s' }}
        />
        <div 
          className={cn(
            "h-2 w-2 rounded-full bg-muted-foreground",
            "animate-typing-bounce"
          )}
          style={{ animationDelay: '0.2s' }}
        />
        <div 
          className={cn(
            "h-2 w-2 rounded-full bg-muted-foreground",
            "animate-typing-bounce"
          )}
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      {showText && text && (
        <span className="text-xs text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  );
}
