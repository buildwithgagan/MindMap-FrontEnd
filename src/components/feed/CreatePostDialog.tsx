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
import { users } from '@/lib/data';
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
import { ReactNode, useState } from 'react';

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
  const [postText, setPostText] = useState('');
  const user = users.find((u) => u.id === 'user-1');

  return (
    <Dialog>
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
          <Button disabled={!postText.trim()} className="rounded-full">
            Post
          </Button>
        </DialogHeader>
        <div className="flex gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar.imageUrl} />
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <p className="font-bold">{user?.name}</p>
            <Textarea
              placeholder="What do you want to talk about?"
              className="mt-2 min-h-[120px] w-full border-none p-0 text-base focus-visible:ring-0"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
          </div>
        </div>
        <div className="border-t p-4">
          <h3 className="mb-4 font-bold">Add to your post</h3>
          <div className="grid grid-cols-2 gap-3">
            <AddToPostItem
              icon={<ImageIcon_1 className="text-blue-500" />}
              label="Photo/Video"
            />
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
