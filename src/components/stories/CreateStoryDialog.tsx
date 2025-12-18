"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { isProd } from "@/lib/env";
import { mediaService, storiesService } from "@/lib/api";
import type { Story, StoryVisibility } from "@/lib/api";
import { Loader2, X } from "lucide-react";

type CreateStoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (story: Story) => void;
};

const DEFAULT_DURATION_SECONDS = 5;
const MIN_DURATION_SECONDS = 1;
const MAX_DURATION_SECONDS = 60;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isSupportedStoryFile(file: File): boolean {
  // Accept common image/video types; backend ultimately validates.
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

export default function CreateStoryDialog({ open, onOpenChange, onCreated }: CreateStoryDialogProps) {
  // 1. State
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<StoryVisibility>("FOLLOWERS");
  const [durationSeconds, setDurationSeconds] = useState<number>(DEFAULT_DURATION_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Effects
  useEffect(() => {
    if (!open) {
      setFile(null);
      setCaption("");
      setVisibility("FOLLOWERS");
      setDurationSeconds(DEFAULT_DURATION_SECONDS);
      setLoading(false);
      setError(null);
    }
  }, [open]);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 3. Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0] ?? null;
    setError(null);
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!isSupportedStoryFile(nextFile)) {
      setFile(null);
      setError("Please select an image or video file.");
      return;
    }
    setFile(nextFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a photo or video.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const safeDuration = clampNumber(durationSeconds, MIN_DURATION_SECONDS, MAX_DURATION_SECONDS);

      if (isProd) {
        const uploadRes = await mediaService.uploadMedia(file);
        if (!uploadRes.success || !uploadRes.data?.url) {
          throw new Error(uploadRes.message || "Failed to upload media");
        }

        const res = await storiesService.createStory({
          mediaUrl: uploadRes.data.url,
          caption: caption.trim() || undefined,
          visibility,
          durationSeconds: safeDuration,
        });

        if (!res.success || !res.data?.story) {
          throw new Error(res.message || "Failed to create story");
        }

        onCreated?.(res.data.story);
        onOpenChange(false);
        return;
      }

      const res = await storiesService.createStory({
        file,
        caption: caption.trim() || undefined,
        visibility,
        durationSeconds: safeDuration,
      });

      if (!res.success || !res.data?.story) {
        throw new Error(res.message || "Failed to create story");
      }

      onCreated?.(res.data.story);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!file && !loading;

  // 4. Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-4">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full" disabled={loading}>
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-center text-xl font-bold">Create Story</DialogTitle>
          <Button
            disabled={!canSubmit}
            className="rounded-full"
            onClick={handleSubmit}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sharing...
              </span>
            ) : (
              "Share"
            )}
          </Button>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="story-file">Photo / Video</Label>
            <Input
              id="story-file"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {previewUrl ? (
            <div className="space-y-3">
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-2xl bg-muted",
                  "border border-border"
                )}
                style={{ aspectRatio: "9/16" }}
              >
                {file?.type.startsWith("video/") ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={previewUrl}
                    autoPlay
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <Image
                    src={previewUrl}
                    alt="Story preview"
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="story-caption">Caption</Label>
                <Textarea
                  id="story-caption"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={loading}
                  className="min-h-[90px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={visibility}
                    onValueChange={(v) => setVisibility(v as StoryVisibility)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOLLOWERS">Followers</SelectItem>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-duration">Duration (seconds)</Label>
                  <Input
                    id="story-duration"
                    type="number"
                    min={MIN_DURATION_SECONDS}
                    max={MAX_DURATION_SECONDS}
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {`Between ${MIN_DURATION_SECONDS}–${MAX_DURATION_SECONDS} seconds`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Select a photo or video to preview and share.
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

