"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { storiesService } from "@/lib/api";

type StoryViewProps = {
  story: {
    author: {
      id: string;
      name: string;
      profileImage?: string;
    };
    stories: Array<{
      id: string;
      authorId: string;
      mediaUrl: string;
      mediaType: "IMAGE" | "VIDEO";
      caption?: string;
      duration: number; // seconds
      createdAt: string;
      isViewed: boolean;
    }>;
  };
  initialIndex?: number;
  onClose: () => void;
  onViewed?: (storyId: string) => void;
};

const DEFAULT_STORY_DURATION_MS = 5000; // 5 seconds

export default function StoryView({ story, onClose, initialIndex = 0, onViewed }: StoryViewProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Initialize index when opening a story
  useEffect(() => {
    setCurrentItemIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, story.author.id]);

  useEffect(() => {
    // Reset progress when story item changes
    setProgress(0);
    const currentItem = story.stories[currentItemIndex];
    const durationMs =
      currentItem?.duration && currentItem.duration > 0
        ? currentItem.duration * 1000
        : DEFAULT_STORY_DURATION_MS;

    const progressInterval = setInterval(() => {
      setProgress((prev) => prev + 100 / (durationMs / 100));
    }, 100);

    const timer = setTimeout(() => {
      if (currentItemIndex < story.stories.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
      } else {
        onClose(); // Close when the last story item finishes
      }
    }, durationMs);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [currentItemIndex, story.stories.length, onClose, story.stories]);

  // Mark as viewed when item becomes active
  useEffect(() => {
    let cancelled = false;
    const currentItem = story.stories[currentItemIndex];
    if (!currentItem) return;
    const markViewed = async () => {
      // Optimistic UI update first
      onViewed?.(currentItem.id);
      try {
        await storiesService.markStoryViewed(currentItem.id);
      } catch (e) {
        if (cancelled) return;
        console.error("❌ Failed to mark story viewed:", e);
        // Note: we don't revert automatically here because backend may still
        // have recorded it; tray will re-sync on refresh.
      }
    };
    markViewed();
    return () => {
      cancelled = true;
    };
  }, [currentItemIndex, onViewed, story.stories]);

  const currentItem = story.stories[currentItemIndex];
  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-hidden rounded-lg bg-card md:h-[90vh] md:max-h-[800px] md:rounded-2xl">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
          {story.stories.map((_, index) => (
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
              <AvatarImage src={story.author.profileImage} />
              <AvatarFallback>
                {story.author.name && story.author.name.length > 0
                  ? story.author.name.charAt(0).toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-white">
                {story.author.name}
              </span>
              <span className="ml-2 text-sm text-gray-300">{/* TODO: format createdAt */}</span>
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
          {currentItem.mediaType === "IMAGE" && (
            <Image
              src={currentItem.mediaUrl}
              alt="Story content"
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
          {currentItem.mediaType === "VIDEO" && (
            <video
              className="h-full w-full object-cover"
              src={currentItem.mediaUrl}
              autoPlay
              muted
              playsInline
              controls={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2">
          <Input
            placeholder={`Reply to ${story.author.name}...`}
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
