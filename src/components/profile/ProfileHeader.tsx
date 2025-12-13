import Image from 'next/image';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, Phone, MoreHorizontal } from "lucide-react";
import type { User } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { posts } from '@/lib/data';

type ProfileHeaderProps = {
  user: User;
};

const RelationButton = ({ relation }: { relation?: User['relation'] }) => {
    switch (relation) {
        case 'following':
            return <Button variant="secondary" className="rounded-lg">Following</Button>;
        case 'requested':
            return <Button variant="secondary" className="rounded-lg">Requested</Button>;
        case 'none':
            return <Button className="rounded-lg">Follow</Button>;
        default: // 'me'
            return <Button variant="secondary" className="rounded-lg">Edit Profile</Button>;
    }
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const userPosts = posts.filter(p => p.author.id === user.id);
  const isMe = user.relation === undefined;

  return (
    <div className='-mx-4 -mt-8 md:mt-0 md:-mx-0'>
      <CardHeader className="p-4 md:p-6 hidden md:flex">
        <div className="flex items-center">
            <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.username}</h1>
            </div>
            <Button variant="ghost" size="icon">
                <MoreHorizontal />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4 md:gap-8">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background">
                <AvatarImage src={user.avatar.imageUrl} alt={user.name} data-ai-hint={user.avatar.imageHint} />
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 grid grid-cols-3 text-center">
                <div>
                    <p className="text-xl font-bold">{userPosts.length}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div>
                    <p className="text-xl font-bold">{user.stats.followers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                    <p className="text-xl font-bold">{user.stats.following.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                </div>
            </div>
        </div>

        <div>
            <h2 className="font-bold">{user.name}</h2>
            <p className="text-foreground/80">
              {user.bio}
            </p>
        </div>
        
        <div className="flex gap-2">
            <div className='flex-1'>
                <RelationButton relation={user.relation} />
            </div>
            {!isMe && <Button variant="secondary" className="rounded-lg flex-1">Message</Button>}
        </div>
      </CardContent>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger value="grid" className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none'>Grid</TabsTrigger>
            <TabsTrigger value="feed" className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none'>Feed</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
            <div className="grid grid-cols-3 gap-0.5">
                {userPosts.flatMap(post => post.media).map((media, index) => (
                    <div key={index} className="relative aspect-square">
                        <Image src={media.imageUrl} alt={media.description} fill className="object-cover" data-ai-hint={media.imageHint} />
                    </div>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="feed">
             <div className="space-y-4 pt-4">
                 {/* This would be a list of PostCards */}
                <p className="p-4 text-center text-muted-foreground">Feed view coming soon.</p>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
