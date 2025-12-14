"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/data";
import StoryView from "./StoryView";
import { stories as initialStories } from "@/lib/data";

export default function StoriesTray() {
  const [stories, setStories] = useState<Story[]>(initialStories);

  const [viewingStory, setViewingStory] = useState<Story | null>(null);

  const handleStoryClick = (story: Story) => {
    if (story.id === "my-story" || story.items.length === 0) return;
    setViewingStory(story);

    // Mark story as seen
    setStories((prevStories) =>
      prevStories.map((s) => (s.id === story.id ? { ...s, seen: true } : s))
    );
  };

  const handleCloseStory = () => {
    setViewingStory(null);
  };

  return (
    <>
      <div className="relative">
        <div className="flex w-full space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex flex-shrink-0 flex-col items-center gap-2"
              onClick={() => handleStoryClick(story)}
            >
              {story.id === "my-story" ? (
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-transparent">
                    <AvatarImage src={story.user.avatar.imageUrl} />
                    <AvatarFallback>
                      {story.user.name && story.user.name.length > 0 
                        ? story.user.name.charAt(0).toUpperCase() 
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary">
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-full p-0.5",
                    !story.seen
                      ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                      : "bg-muted-foreground/30",
                    story.items.length > 0 && "cursor-pointer"
                  )}
                >
                  <div className="rounded-full bg-card p-0.5">
                    <Avatar className="h-[58px] w-[58px]">
                      <AvatarImage src={story.user.avatar.imageUrl} data-ai-hint={story.user.avatar.imageHint}/>
                      <AvatarFallback>
                        {story.user.name && story.user.name.length > 0 
                          ? story.user.name.charAt(0).toUpperCase() 
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
              <p
                className={cn(
                  "text-xs",
                  story.id === "my-story"
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {story.id === "my-story" ? "Your Story" : story.user.name}
              </p>
            </div>
          ))}
        </div>
      </div>
      {viewingStory && (
        <StoryView story={viewingStory} onClose={handleCloseStory} />
      )}
    </>
  );
}
