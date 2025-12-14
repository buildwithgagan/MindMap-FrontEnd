"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/feed/PostCard";
import StoriesTray from "@/components/stories/StoriesTray";
import { StoriesTraySkeleton } from "@/components/stories/StoriesTraySkeleton";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { feedService } from "@/lib/api";
import type { Post } from "@/lib/api";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async (cursor?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.getFeed({ cursor, pageSize: 20 });
      
      // Debug: Log the full response structure
      console.log('🔍 Feed API Response:', {
        fullResponse: response,
        hasSuccess: 'success' in response,
        success: (response as any).success,
        hasData: 'data' in response,
        dataType: typeof (response as any).data,
        dataKeys: (response as any).data ? Object.keys((response as any).data) : null,
      });
      
      // Handle different response structures
      // Case 1: Standard ApiResponse format with posts in data.posts
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        const apiResponse = response as { success: boolean; data: any };
        if (apiResponse.success && apiResponse.data) {
          // Check if data has posts array (actual API structure)
          if (apiResponse.data && typeof apiResponse.data === 'object' && 'posts' in apiResponse.data) {
            const postsData = Array.isArray(apiResponse.data.posts) ? apiResponse.data.posts : [];
            
            if (cursor) {
              setPosts(prev => [...prev, ...postsData]);
            } else {
              setPosts(postsData);
            }
            setNextCursor(apiResponse.data.nextCursor);
          }
          // Check if data has the paginated structure with 'data' property
          else if (apiResponse.data && typeof apiResponse.data === 'object' && 'data' in apiResponse.data) {
            const postsData = Array.isArray(apiResponse.data.data) ? apiResponse.data.data : [];
            
            if (cursor) {
              setPosts(prev => [...prev, ...postsData]);
            } else {
              setPosts(postsData);
            }
            setNextCursor(apiResponse.data.nextCursor);
          } else if (Array.isArray(apiResponse.data)) {
            // If data is directly an array
            const postsData = apiResponse.data;
            if (cursor) {
              setPosts(prev => [...prev, ...postsData]);
            } else {
              setPosts(postsData);
            }
          } else {
            console.warn('⚠️ Unexpected data structure:', apiResponse.data);
            if (!cursor) {
              setPosts([]);
            }
          }
        } else {
          console.warn('⚠️ API response not successful:', apiResponse);
          if (!cursor) {
            setPosts([]);
          }
        }
      } 
      // Case 2: Direct paginated response (without ApiResponse wrapper)
      else if (response && typeof response === 'object' && 'data' in response && !('success' in response)) {
        const paginatedResponse = response as { data: any[]; nextCursor?: string; hasMore?: boolean };
        const postsData = Array.isArray(paginatedResponse.data) ? paginatedResponse.data : [];
        
        if (cursor) {
          setPosts(prev => [...prev, ...postsData]);
        } else {
          setPosts(postsData);
        }
        setNextCursor(paginatedResponse.nextCursor);
      }
      // Case 3: Direct array response
      else if (Array.isArray(response)) {
        const postsData = response;
        if (cursor) {
          setPosts(prev => [...prev, ...postsData]);
        } else {
          setPosts(postsData);
        }
      }
      // Case 4: Unknown structure
      else {
        console.error('❌ Unknown response structure:', response);
        if (!cursor) {
          setPosts([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
      console.error("❌ Error loading feed:", err);
      // On error, ensure posts is an empty array if it's the initial load
      if (!cursor) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loading) {
      loadFeed(nextCursor);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-8">
        <StoriesTraySkeleton />
        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="space-y-8">
        <StoriesTray />
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => loadFeed()} 
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StoriesTray />
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {nextCursor && (
            <div className="flex flex-col items-center gap-4 py-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
              {loading && <PostCardSkeleton />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
