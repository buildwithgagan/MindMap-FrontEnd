import PostCard from "@/components/feed/PostCard";
import StoriesTray from "@/components/stories/StoriesTray";
import { posts } from "@/lib/data";

export default function FeedPage() {
  return (
    <div className="space-y-8">
      <StoriesTray />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
