"use client";

import { useState, useEffect } from "react";
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
import type { Post } from "@/lib/api";
import { feedService } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getPlaceholderImageBySeed, DEFAULT_PLACEHOLDER_IMAGE } from "@/lib/constants";

type PostCardProps = {
  post: Post;
};

// Safe Media Item Component with error handling
function MediaItem({ 
  mediaItem, 
  caption, 
  postId, 
  index 
}: { 
  mediaItem: { url: string; type: 'IMAGE' | 'VIDEO'; thumbnailUrl?: string }; 
  caption?: string; 
  postId: string;
  index: number;
}) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageSrc, setImageSrc] = useState(mediaItem.url);
  const [videoSrc, setVideoSrc] = useState(mediaItem.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Get placeholder based on post ID and index for consistency
  const placeholderImage = getPlaceholderImageBySeed(`${postId}-${index}`);
  const initialPoster = mediaItem.thumbnailUrl || placeholderImage;
  const [posterSrc, setPosterSrc] = useState(initialPoster);

  const handleImageError = () => {
    if (imageSrc !== placeholderImage && imageSrc !== DEFAULT_PLACEHOLDER_IMAGE) {
      // First fallback: use seeded placeholder
      setImageSrc(placeholderImage);
      setImageLoading(true);
    } else if (imageSrc === placeholderImage) {
      // Second fallback: use default placeholder
      setImageSrc(DEFAULT_PLACEHOLDER_IMAGE);
      setImageLoading(true);
    } else {
      // Final fallback: mark as errored
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageLoading(false);
  };

  if (mediaItem.type === 'IMAGE') {
    // Use regular img tag to avoid Next.js Image configuration errors
    // This prevents crashes when domains aren't configured
    return (
      <div 
        className="relative w-full overflow-hidden rounded-2xl bg-muted" 
        style={{ 
          aspectRatio: '16/9',
          minHeight: '400px',
          maxHeight: '600px',
          height: 'auto',
        }}
      >
        {/* Placeholder that shows while loading or on error - always rendered to prevent layout shift */}
        <img
          src={placeholderImage}
          alt={caption || 'Post image placeholder'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            opacity: (imageLoading && !imageLoaded) || imageError ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: imageError || (imageLoading && !imageLoaded) ? 1 : 0,
          }}
          onError={(e) => {
            // If placeholder fails, try default
            const target = e.target as HTMLImageElement;
            if (target.src !== DEFAULT_PLACEHOLDER_IMAGE) {
              target.src = DEFAULT_PLACEHOLDER_IMAGE;
            }
          }}
        />
        {/* Main image - always rendered to prevent layout shift */}
        {!imageError && (
          <img
            src={imageSrc}
            alt={caption || 'Post image'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              zIndex: imageLoaded ? 2 : 0,
            }}
          />
        )}
        {/* Loading indicator - only show when actively loading */}
        {imageLoading && !imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  } else {
    // Video with error handling
    const [videoLoaded, setVideoLoaded] = useState(false);

    const handleVideoError = () => {
      if (!videoError) {
        setVideoError(true);
        setVideoSrc('');
      }
    };

    const handlePosterError = () => {
      if (posterSrc !== DEFAULT_PLACEHOLDER_IMAGE) {
        setPosterSrc(DEFAULT_PLACEHOLDER_IMAGE);
      }
    };

    const handleVideoLoad = () => {
      setVideoLoaded(true);
    };

    if (videoError) {
      return (
        <div 
          className="relative w-full overflow-hidden rounded-2xl bg-muted flex items-center justify-center" 
          style={{ 
            aspectRatio: '16/9',
            minHeight: '400px',
            maxHeight: '600px',
            height: 'auto',
          }}
        >
          <img
            src={posterSrc}
            alt={caption || 'Video placeholder'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handlePosterError}
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      );
    }

    return (
      <div 
        className="relative w-full overflow-hidden rounded-2xl bg-muted" 
        style={{ 
          aspectRatio: '16/9',
          minHeight: '400px',
          maxHeight: '600px',
          height: 'auto',
        }}
      >
        {/* Poster - always rendered to prevent layout shift */}
        {posterSrc && (
          <img
            src={posterSrc}
            alt={caption || 'Video poster'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handlePosterError}
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              opacity: videoLoaded ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out',
              zIndex: videoLoaded ? 0 : 1,
            }}
          />
        )}
        <video
          src={videoSrc}
          controls
          className="absolute inset-0 w-full h-full object-cover"
          poster={posterSrc}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          style={{ 
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: videoLoaded ? 2 : 0,
          }}
        />
      </div>
    );
  }
}

// Format number for display (e.g., 1234 -> 1.2K, 1234567 -> 1.2M)
function formatCount(count: number | undefined): string {
  const num = count ?? 0;
  if (num === 0) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

// Helper function to extract counts from post (handles both camelCase and snake_case)
function getPostCounts(post: Post, isRepost: boolean) {
  const displayPost = isRepost && post.originalPost ? post.originalPost : post;
  
  // Handle both camelCase and snake_case from API, and ensure numbers
  const likes = Number(displayPost.likesCount ?? (displayPost as any).likes_count ?? 0);
  const comments = Number(displayPost.commentsCount ?? (displayPost as any).comments_count ?? 0);
  const reposts = Number(displayPost.repostsCount ?? (displayPost as any).reposts_count ?? 0);
  const liked = displayPost.isLiked ?? (displayPost as any).is_liked ?? false;
  
  return { likes, comments, reposts, liked };
}

export default function PostCard({ post }: PostCardProps) {
  // Safely handle mediaItems - ensure it's always an array
  const displayPost = post.type === 'REPOST' && post.originalPost ? post.originalPost : post;
  
  // Get initial counts
  const initialCounts = getPostCounts(post, post.type === 'REPOST');
  
  const [isLiked, setIsLiked] = useState(initialCounts.liked);
  const [likesCount, setLikesCount] = useState(initialCounts.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [repostsCount, setRepostsCount] = useState(initialCounts.reposts);
  const [commentsCount, setCommentsCount] = useState(initialCounts.comments);

  const displayMediaItems = displayPost.mediaItems || [];
  const hasMultipleMedia = displayMediaItems.length > 1;
  const timestamp = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Update counts when post prop changes
  useEffect(() => {
    const counts = getPostCounts(post, post.type === 'REPOST');
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 PostCard counts update:', {
        postId: post.id,
        postType: post.type,
        counts,
        hasOriginalPost: !!post.originalPost,
        originalPostLikes: post.originalPost?.likesCount,
        postLikes: post.likesCount,
      });
    }
    
    setLikesCount(counts.likes);
    setCommentsCount(counts.comments);
    setRepostsCount(counts.reposts);
    setIsLiked(counts.liked);
  }, [
    post.id, 
    post.type,
    post.likesCount, 
    post.commentsCount, 
    post.repostsCount, 
    post.isLiked,
    post.originalPost?.likesCount, 
    post.originalPost?.commentsCount, 
    post.originalPost?.repostsCount, 
    post.originalPost?.isLiked
  ]);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await feedService.toggleLike(post.id);
      if (response.success && response.data) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    try {
      const response = await feedService.repost(post.id);
      if (response.success && response.data) {
        // Update repost count from the response
        const updatedPost = response.data.post || response.data;
        if (updatedPost.repostsCount !== undefined) {
          setRepostsCount(updatedPost.repostsCount);
        } else {
          // Fallback: increment if count not in response
          setRepostsCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error reposting:", error);
    }
  };

  // Get username from author (fallback to name or email if username not available)
  const username = (post.author as any).username || 
    (post.author.name ? post.author.name.toLowerCase().replace(/\s+/g, '') : 
     (post.author.email ? post.author.email.split('@')[0] : 'user'));

  return (
    <Card className="overflow-hidden border-none bg-card shadow-diffused rounded-3xl">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Link href={`/profile/${username}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.profileImage || ''} alt={post.author.name || post.author.email || 'User'} />
              <AvatarFallback>
                {post.author.name && post.author.name.length > 0 
                  ? post.author.name.charAt(0).toUpperCase() 
                  : (post.author.email ? post.author.email.charAt(0).toUpperCase() : 'U')}
              </AvatarFallback>
            </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <Link href={`/profile/${username}`}>
                <p className="font-bold hover:underline">{post.author.name || post.author.email || 'User'}</p>
             </Link>
          </div>
          <p className="text-sm text-muted-foreground">{timestamp}</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {post.type === 'REPOST' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat className="h-4 w-4" />
            <span>Reposted by {post.author.name || post.author.email || 'User'}</span>
          </div>
        )}
        {displayPost.caption && (
          <p className="whitespace-pre-wrap">{displayPost.caption}</p>
        )}
        {displayMediaItems.length > 0 && (
          <div className="w-full" style={{ minHeight: '400px', maxHeight: '600px' }}>
            <Carousel
              className={cn("w-full -ml-4", hasMultipleMedia ? "p-0" : "")}
              opts={{
                loop: hasMultipleMedia,
              }}
            >
              <CarouselContent className="ml-0">
                {displayMediaItems.map((mediaItem, index) => (
                  <CarouselItem key={`${mediaItem.url}-${index}`} className="pl-4">
                    <MediaItem
                      mediaItem={mediaItem}
                      caption={displayPost.caption}
                      postId={post.id}
                      index={index}
                    />
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
          </div>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-4 gap-2 p-2">
        <Button 
          variant="ghost" 
          className={cn("flex items-center gap-2 rounded-lg", isLiked && "text-red-500")}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          <span className="text-sm font-medium">{formatCount(likesCount)}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{formatCount(commentsCount)}</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 rounded-lg"
          onClick={handleRepost}
        >
          <Repeat className="h-5 w-5" />
          <span className="text-sm font-medium">{formatCount(repostsCount)}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 rounded-lg">
          <Send className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
