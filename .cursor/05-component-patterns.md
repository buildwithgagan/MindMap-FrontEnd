# Component Patterns

## Component Types

### Client Components
- Mark with `"use client"` directive when needed
- Required for: hooks, event handlers, browser APIs, context

```typescript
"use client";

import { useState } from "react";

export default function ClientComponent() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}
```

### Server Components
- Default in App Router
- Use for: static content, data fetching (Server Components)
- No `"use client"` directive needed

```typescript
import { Card } from "@/components/ui/card";

export default function ServerComponent() {
  return <Card>Static Content</Card>;
}
```

## Component Structure

### Standard Component Template
```typescript
"use client";

import { useState, useEffect } from "react";
import { Component } from "@/components/ui/component";
import { service } from "@/lib/api";
import type { Type } from "@/lib/api";
import { cn } from "@/lib/utils";

type ComponentProps = {
  required: string;
  optional?: number;
};

export default function Component({ required, optional }: ComponentProps) {
  // 1. State declarations
  const [state, setState] = useState<Type | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // 3. Handlers
  const handleAction = async () => {
    try {
      setLoading(true);
      const response = await service.action();
      if (response.success) {
        setState(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };
  
  // 4. Render
  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className={cn("base-classes", conditionalClasses)}>
      {/* JSX */}
    </div>
  );
}
```

## Common Component Patterns

### Data Fetching Component
```typescript
"use client";

import { useEffect, useState } from "react";
import { feedService } from "@/lib/api";
import type { Post } from "@/lib/api";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedService.getFeed({ pageSize: 20 });
      
      if (response.success && response.data) {
        setPosts(response.data.posts || response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PostCardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={loadFeed} className="text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Form Component
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export default function FormComponent() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await service.submit(data);
      if (response.success) {
        // Handle success
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### List Component with Pagination
```typescript
"use client";

import { useState, useEffect } from "react";
import { feedService } from "@/lib/api";
import type { Post } from "@/lib/api";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async (cursor?: string) => {
    try {
      setLoading(true);
      const response = await feedService.getFeed({ cursor, pageSize: 20 });
      
      if (response.success && response.data) {
        const newPosts = response.data.posts || response.data;
        if (cursor) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setNextCursor(response.data.nextCursor);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loading) {
      loadFeed(nextCursor);
    }
  };

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {nextCursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="text-primary hover:underline disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
```

## Loading States

### Skeleton Loaders
```typescript
// Use skeleton components during loading
if (loading && posts.length === 0) {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Loading Indicators
```typescript
// Inline loading indicator
{loading && (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)}
```

## Error States

### Error Display
```typescript
if (error && posts.length === 0) {
  return (
    <div className="text-center py-8">
      <p className="text-destructive mb-4">{error}</p>
      <button 
        onClick={() => loadFeed()} 
        className="text-primary hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
```

### Error Handling in Components
```typescript
const handleAction = async () => {
  try {
    setLoading(true);
    const response = await service.action();
    if (response.success) {
      // Success handling
    } else {
      setError("Action failed");
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
  } finally {
    setLoading(false);
  }
};
```

## Conditional Rendering

### Pattern
```typescript
{loading && <Skeleton />}
{error && <ErrorMessage error={error} />}
{!loading && !error && data.length === 0 && <EmptyState />}
{!loading && !error && data.length > 0 && (
  <DataList data={data} />
)}
```

### Empty States
```typescript
{posts.length === 0 ? (
  <div className="text-center py-8 text-muted-foreground">
    <p>No posts yet. Be the first to post!</p>
  </div>
) : (
  <div className="space-y-8">
    {posts.map((post) => (
      <PostCard key={post.id} post={post} />
    ))}
  </div>
)}
```

## Optimistic Updates

### Pattern
```typescript
const handleLike = async () => {
  // Optimistic update
  setIsLiked(true);
  setLikesCount(prev => prev + 1);
  
  try {
    const response = await feedService.toggleLike(postId);
    if (response.success && response.data) {
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
    } else {
      // Revert on error
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    }
  } catch (error) {
    // Revert on error
    setIsLiked(false);
    setLikesCount(prev => prev - 1);
  }
};
```

## Component Composition

### Reusable Components
```typescript
// Extract reusable sub-components
function MediaItem({ 
  mediaItem, 
  caption 
}: { 
  mediaItem: MediaItem; 
  caption?: string;
}) {
  // Component logic
}

// Use in parent component
export default function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      {post.mediaItems.map((item, index) => (
        <MediaItem key={index} mediaItem={item} caption={post.caption} />
      ))}
    </Card>
  );
}
```

## Best Practices

### Do's
- ✅ Keep components small and focused
- ✅ Extract reusable logic to hooks
- ✅ Use proper TypeScript types
- ✅ Handle loading and error states
- ✅ Use skeleton loaders for better UX
- ✅ Implement optimistic updates when appropriate

### Don'ts
- ❌ Don't create deeply nested components
- ❌ Don't fetch data in render function
- ❌ Don't ignore error states
- ❌ Don't skip loading states
- ❌ Don't mutate props directly
- ❌ Don't use inline functions in JSX (use useCallback if needed)
