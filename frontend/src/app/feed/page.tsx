'use client';

import { useEffect, useState } from 'react';
import { useFeedStore } from '@/stores/feedStore';
import { useAuthStore } from '@/stores/authStore';
import { PostComposer } from '@/components/post/PostComposer';
import { PostCard } from '@/components/post/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export default function FeedPage() {
  const { feed, isLoading, hasMore, fetchFeed } = useFeedStore();
  const { isAuthenticated } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchFeed(true);
  }, [fetchFeed]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeed(true);
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchFeed();
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b">
        <h1 className="text-xl font-bold">Home</h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Post Composer */}
      {isAuthenticated && <PostComposer />}

      {/* Feed */}
      <div className="space-y-4">
        {feed.length === 0 && isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))
        ) : feed.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          feed.map((item) => (
            item.type === 'post' && item.post ? (
              <PostCard key={item.id} post={item.post} />
            ) : null
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
