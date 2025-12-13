import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MoreHorizontal, Heart, MessageCircle, Repeat, Send } from "lucide-react";
import type { Post } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  const hasMultipleMedia = post.media.length > 1;

  return (
    <Card className="overflow-hidden border-none bg-card shadow-diffused rounded-3xl">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Link href={`/profile/${post.author.username}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar.imageUrl} alt={post.author.name} data-ai-hint={post.author.avatar.imageHint} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <Link href={`/profile/${post.author.username}`}>
                <p className="font-bold hover:underline">{post.author.name}</p>
             </Link>
            <p className="text-sm text-muted-foreground">@{post.author.username}</p>
          </div>
          <p className="text-sm text-muted-foreground">{post.timestamp}</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {post.isRepost && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat className="h-4 w-4" />
            <span>Reposted by {post.repostedBy}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.media.length > 0 && (
          <Carousel
            className={cn("w-full -ml-4", hasMultipleMedia ? "p-0" : "")}
            opts={{
              loop: hasMultipleMedia,
            }}
          >
            <CarouselContent className="ml-0">
              {post.media.map((mediaItem) => (
                <CarouselItem key={mediaItem.id} className="pl-4">
                  <div className="relative aspect-video overflow-hidden rounded-2xl">
                    <Image
                      src={mediaItem.imageUrl}
                      alt={mediaItem.description}
                      fill
                      className="object-cover"
                      data-ai-hint={mediaItem.imageHint}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {hasMultipleMedia && (
              <>
                <CarouselPrevious className="absolute left-8" />
                <CarouselNext className="absolute right-8" />
              </>
            )}
          </Carousel>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-4 gap-2 p-2">
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <Heart className="h-5 w-5" />
          <span className="text-sm">{post.stats.likes}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{post.stats.comments}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <Repeat className="h-5 w-5" />
          <span className="text-sm">{post.stats.reposts}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <Send className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
