"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoriesFeedItem } from "@/lib/api";
import StoryView from "./StoryView";
import { StoriesTraySkeleton } from "./StoriesTraySkeleton";
import { storiesService } from "@/lib/api";

type ViewerStoryItem = {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  caption?: string;
  duration: number; // seconds
  createdAt: string;
  isViewed: boolean;
};

type ViewerStory = {
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  stories: ViewerStoryItem[];
};

export default function StoriesTray() {
  const [feedItems, setFeedItems] = useState<StoriesFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState<ViewerStory | null>(null);
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await storiesService.getStoriesFeed();
        if (cancelled) return;
        setFeedItems(res?.data?.items ?? []);
      } catch (e) {
        if (cancelled) return;
        console.error("❌ Error loading stories feed:", e);
        setFeedItems([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasMyStory = true;

  const trayItems = useMemo(() => {
    // Keep a "Your Story" item to match current UI. If/when backend supports it,
    // we can replace it with real data.
    const myStory = hasMyStory
      ? ([
          {
            id: "my-story",
            author: { id: "me", name: "Your Story", profileImage: undefined },
            stories: [],
            hasUnseen: false,
            latestStoryAt: "",
          } satisfies StoriesFeedItem,
        ] as StoriesFeedItem[])
      : [];
    return [...myStory, ...feedItems];
  }, [feedItems, hasMyStory]);

  const handleStoryClick = (item: StoriesFeedItem) => {
    if (item.author.id === "me" || item.stories.length === 0) return;

    const viewer: ViewerStory = {
      author: {
        id: item.author.id,
        name: item.author.name,
        profileImage: item.author.profileImage,
      },
      stories: item.stories.map((s) => ({
        id: s.id,
        authorId: s.authorId,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        duration: s.duration,
        createdAt: s.createdAt,
        isViewed: s.isViewed,
      })),
    };

    const firstUnviewed = viewer.stories.findIndex((s) => !s.isViewed);
    setInitialIndex(firstUnviewed >= 0 ? firstUnviewed : 0);
    setViewingStory(viewer);
  };

  const handleCloseStory = () => {
    setViewingStory(null);
  };

  const handleViewed = (storyId: string) => {
    // Optimistically mark viewed in both tray state and the currently viewed story.
    setFeedItems((prev) =>
      prev.map((fi) => {
        if (!fi.stories.some((s) => s.id === storyId)) return fi;
        const nextStories = fi.stories.map((s) => (s.id === storyId ? { ...s, isViewed: true } : s));
        const nextHasUnseen = nextStories.some((s) => !s.isViewed);
        return { ...fi, stories: nextStories, hasUnseen: nextHasUnseen };
      })
    );

    setViewingStory((prev) => {
      if (!prev) return prev;
      if (!prev.stories.some((s) => s.id === storyId)) return prev;
      return {
        ...prev,
        stories: prev.stories.map((s) => (s.id === storyId ? { ...s, isViewed: true } : s)),
      };
    });
  };

  if (loading) {
    return <StoriesTraySkeleton />;
  }

  return (
    <>
      <div className="relative">
        <div className="flex w-full space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {trayItems.map((item) => (
            <div
              key={item.author.id === "me" ? "my-story" : item.author.id}
              className="flex flex-shrink-0 flex-col items-center gap-2"
              onClick={() => handleStoryClick(item)}
            >
              {item.author.id === "me" ? (
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-transparent">
                    <AvatarImage src={item.author.profileImage} />
                    <AvatarFallback>
                      Y
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
                    (item.hasUnseen ?? item.stories.some((s) => !s.isViewed))
                      ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                      : "bg-muted-foreground/30",
                    item.stories.length > 0 && "cursor-pointer"
                  )}
                >
                  <div className="rounded-full bg-card p-0.5">
                    <Avatar className="h-[58px] w-[58px]">
                      <AvatarImage src={item.author.profileImage} />
                      <AvatarFallback>
                        {item.author.name && item.author.name.length > 0
                          ? item.author.name.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
              <p
                className={cn(
                  "text-xs",
                  item.author.id === "me"
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {item.author.id === "me" ? "Your Story" : item.author.name}
              </p>
            </div>
          ))}
        </div>
      </div>
      {viewingStory && (
        <StoryView
          story={viewingStory}
          initialIndex={initialIndex}
          onClose={handleCloseStory}
          onViewed={handleViewed}
        />
      )}
    </>
  );
}
