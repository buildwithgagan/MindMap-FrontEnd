"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoriesFeedItem, User } from "@/lib/api";
import StoryView from "./StoryView";
import { StoriesTraySkeleton } from "./StoriesTraySkeleton";
import CreateStoryDialog from "./CreateStoryDialog";
import { authService, storiesService } from "@/lib/api";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadStories = useCallback(async () => {
    const res = await storiesService.getStoriesFeed();
    setFeedItems(res?.data?.items ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const [userRes] = await Promise.allSettled([
          authService.getCurrentUser(),
        ]);

        if (!cancelled) {
          if (userRes.status === "fulfilled" && userRes.value.success) {
            setCurrentUser(userRes.value.data);
          } else {
            setCurrentUser(null);
          }
        }

        await loadStories();
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
  }, [loadStories]);

  const trayItems = useMemo(() => {
    const meId = currentUser?.id ?? "me";
    const myFeedItem = feedItems.find((fi) => fi.author.id === meId);
    const otherItems = feedItems.filter((fi) => fi.author.id !== meId);

    const myItem: StoriesFeedItem = myFeedItem ?? {
      author: {
        id: meId,
        name: "Your Story",
        profileImage: currentUser?.profileImage,
      },
      stories: [],
      hasUnseen: false,
      latestStoryAt: "",
    };

    return [myItem, ...otherItems];
  }, [currentUser?.id, currentUser?.profileImage, feedItems]);

  const handleStoryClick = (item: StoriesFeedItem) => {
    const meId = currentUser?.id ?? "me";
    const isMine = item.author.id === meId;
    const hasStories = item.stories.length > 0;

    // Instagram-like: if you have no stories, tapping opens create flow
    if (isMine && !hasStories) {
      setCreateOpen(true);
      return;
    }
    if (!hasStories) return;

    const viewer: ViewerStory = {
      author: {
        id: item.author.id,
        name: isMine ? (currentUser?.name ?? "Your Story") : item.author.name,
        profileImage: isMine ? currentUser?.profileImage : item.author.profileImage,
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

  const handleOpenCreate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCreateOpen(true);
  };

  const handleCloseStory = () => {
    setViewingStory(null);
  };

  const handleViewed = useCallback((storyId: string) => {
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
  }, []);

  if (loading) {
    return <StoriesTraySkeleton />;
  }

  const meId = currentUser?.id ?? "me";

  return (
    <>
      <div className="relative">
        <div className="flex w-full space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {trayItems.map((item) => (
            <div
              key={item.author.id === meId ? "my-story" : item.author.id}
              className="flex flex-shrink-0 flex-col items-center gap-2"
              onClick={() => handleStoryClick(item)}
            >
              {item.author.id === meId ? (
                <div className="relative">
                  <div
                    className={cn(
                      "rounded-full p-0.5",
                      item.stories.length > 0
                        ? (item.hasUnseen ?? item.stories.some((s) => !s.isViewed))
                          ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                          : "bg-muted-foreground/30"
                        : "bg-muted-foreground/30"
                    )}
                  >
                    <div className="rounded-full bg-card p-0.5">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={currentUser?.profileImage} />
                        <AvatarFallback>
                          {currentUser?.name && currentUser.name.length > 0
                            ? currentUser.name.charAt(0).toUpperCase()
                            : "Y"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={handleOpenCreate}
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-card bg-primary p-0"
                    aria-label="Add story"
                  >
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </Button>
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
                  item.author.id === meId
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {item.author.id === meId ? "Your Story" : item.author.name}
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
      <CreateStoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async () => {
          try {
            await loadStories();
          } catch (e) {
            console.error("❌ Failed to refresh stories after create:", e);
          }
        }}
      />
    </>
  );
}
