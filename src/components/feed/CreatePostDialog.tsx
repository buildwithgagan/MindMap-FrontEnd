'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ImageIcon,
  Link,
  List,
  Smile,
  X,
  Plus,
  Image as ImageIcon_1,
  FileText,
  Calendar,
  Tag,
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import { authService, feedService, mediaService } from '@/lib/api';
import type { User } from '@/lib/api';
import { useRouter } from 'next/navigation';

const AddToPostItem = ({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) => (
  <button className="flex w-full items-center justify-between rounded-lg bg-secondary p-3 text-left">
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-semibold">{label}</span>
    </div>
    <Plus className="h-5 w-5" />
  </button>
);

export function CreatePostDialog({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{ url: string; type: 'IMAGE' | 'VIDEO' }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setUserLoading(true);
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 files
    const filesToProcess = files.slice(0, 10 - uploadedMedia.length);
    setSelectedFiles(prev => [...prev, ...filesToProcess]);

    // Upload files immediately
    setLoading(true);
    try {
      const uploadPromises = filesToProcess.map(async (file) => {
        const response = await mediaService.uploadMedia(file);
        if (response.success && response.data) {
          return {
            url: response.data.url,
            type: response.data.type as 'IMAGE' | 'VIDEO',
          };
        }
        throw new Error('Upload failed');
      });

      const uploaded = await Promise.all(uploadPromises);
      setUploadedMedia(prev => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media');
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!postText.trim() && uploadedMedia.length === 0) {
      setError('Please add text or media to your post');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await feedService.createPost({
        caption: postText.trim() || undefined,
        mediaItems: uploadedMedia.map(media => ({
          url: media.url,
          type: media.type,
        })),
        settings: {
          hideLikes: false,
          turnOffComments: false,
        },
      });

      if (response.success) {
        // Reset form and close dialog
        setPostText('');
        setSelectedFiles([]);
        setUploadedMedia([]);
        setOpen(false);
        // Refresh the page to show new post
        router.refresh();
      } else {
        setError(response.message || 'Failed to create post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-4">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X />
            </Button>
          </DialogClose>
          <DialogTitle className="text-center text-xl font-bold">
            Create Post
          </DialogTitle>
          <Button 
            disabled={(!postText.trim() && uploadedMedia.length === 0) || loading} 
            className="rounded-full"
            onClick={handlePost}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </DialogHeader>
        <div className="flex gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profileImage || ''} />
            <AvatarFallback>
              {user?.name && user.name.length > 0 
                ? user.name.charAt(0).toUpperCase() 
                : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <p className="font-bold">{user?.name || 'User'}</p>
            <Textarea
              placeholder="What do you want to talk about?"
              className="mt-2 min-h-[120px] w-full border-none p-0 text-base focus-visible:ring-0"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
            {uploadedMedia.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {uploadedMedia.map((media, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    {media.type === 'IMAGE' ? (
                      <img src={media.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t p-4">
          <h3 className="mb-4 font-bold">Add to your post</h3>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={loading || uploadedMedia.length >= 10}
              />
              <AddToPostItem
                icon={<ImageIcon_1 className="text-blue-500" />}
                label="Photo/Video"
              />
            </label>
            <AddToPostItem
              icon={<FileText className="text-green-500" />}
              label="Document"
            />
            <AddToPostItem
              icon={<List className="text-yellow-500" />}
              label="Poll"
            />
            <AddToPostItem
              icon={<Calendar className="text-red-500" />}
              label="Event"
            />
            <AddToPostItem
              icon={<Tag className="text-purple-500" />}
              label="Tag people"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
