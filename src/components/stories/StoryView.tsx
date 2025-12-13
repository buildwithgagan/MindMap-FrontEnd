"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/data";

type StoryViewProps = {
  story: Story;
  onClose: () => void;
};

const STORY_DURATION = 5000; // 5 seconds per story item

export default function StoryView({ story, onClose }: StoryViewProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress when story item changes
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => prev + 100 / (STORY_DURATION / 100));
    }, 100);

    const timer = setTimeout(() => {
      if (currentItemIndex < story.items.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
      } else {
        onClose(); // Close when the last story item finishes
      }
    }, STORY_DURATION);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [currentItemIndex, story.items.length, onClose]);

  const currentItem = story.items[currentItemIndex];

  if (!currentItem) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-hidden rounded-lg bg-card md:h-[90vh] md:max-h-[800px] md:rounded-2xl">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
          {story.items.map((_, index) => (
            <div key={index} className="h-1 flex-1 rounded-full bg-white/30">
              <div
                className={cn(
                  "h-1 rounded-full bg-white",
                  index < currentItemIndex && "w-full",
                  index === currentItemIndex && "transition-all duration-100 ease-linear"
                )}
                style={{ width: index === currentItemIndex ? `${progress}%` : "0%" }}
              ></div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={story.user.avatar.imageUrl} />
              <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-white">
                {story.user.username}
              </span>
              <span className="ml-2 text-sm text-gray-300">
                {currentItem.timestamp}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="relative flex-1">
          {currentItem.type === "image" && (
            <Image
              src={currentItem.url}
              alt="Story content"
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2">
          <Input
            placeholder={`Reply to ${story.user.name}...`}
            className="h-12 flex-1 rounded-full border-none bg-black/40 text-white placeholder:text-gray-300 focus:ring-1 focus:ring-white"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-white hover:bg-white/20 hover:text-white"
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
