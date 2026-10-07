import React, { useEffect, useState } from 'react';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { useFeedPosts } from '@/lib/graphql/feed/feedHooks';
import { Loader2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { useNotifications } from '@/lib/hooks/useNotifications';

export const FeedLayout = () => {
  const { posts, loading, error, fetchMore, refetch, total } = useFeedPosts(1, 10);
  const [showFab, setShowFab] = useState(false);

  useNotifications((msg) => {
    if (msg?.level === 'feed_update') {
      // Just a lightweight refetch when someone interacts with the feed
      refetch();
    }
  }, { silent: true });

  const observerTarget = React.useRef(null);

  // FAB visibility based on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Optimized Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && posts.length < total) {
          fetchMore({
            variables: { page: Math.ceil(posts.length / 10) + 1 },
            updateQuery: (prev: any, { fetchMoreResult }: any) => {
              if (!fetchMoreResult) return prev;
              
              // Prevent duplicate posts by filtering
              const existingIds = new Set((prev?.posts?.results || []).map((p: any) => p.id));
              const newPosts = (fetchMoreResult?.posts?.results || []).filter(
                (p: any) => !existingIds.has(p.id)
              );

              return {
                posts: {
                  ...fetchMoreResult?.posts,
                  results: [...(prev?.posts?.results || []), ...newPosts]
                }
              };
            }
          });
        }
      },
      { rootMargin: '200px' } // Pre-fetch before it comes into view
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, posts.length, total, fetchMore]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Failed to load feed. Please try again.
      </div>
    );
  }

  return (
    <div className="mx-auto py-6">
      <CreatePost />
      
      {posts.length === 0 && !loading ? (
        <EmptyState 
          title="No posts yet" 
          description="Be the first to share an update with your team!" 
        >
          <div className="flex justify-center mt-2">
            <MessageCircle className="w-10 h-10 text-gray-300" />
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {loading && posts.length === 0 && (
        <div className="py-4">
          <PageSkeleton variant="list" />
        </div>
      )}

      {loading && posts.length > 0 && posts.length < total && (
        <div className="py-4 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {/* Invisible div for Intersection Observer to detect scroll */}
      <div ref={observerTarget} className="h-4 w-full" />

      {/* Floating Action Button for creating post */}
      {showFab && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed top-24 right-8 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">New Post</span>
        </button>
      )}
    </div>
  );
};

// Only import if you use the icon in EmptyState above
import { MessageCircle } from 'lucide-react';
