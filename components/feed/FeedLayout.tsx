import React, { useEffect, useState } from 'react';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { useFeedPosts } from '@/lib/graphql/feed/feedHooks';
import { Loader2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';

export const FeedLayout = () => {
  const { posts, loading, error, fetchMore, refetch, total } = useFeedPosts(1, 10);
  const [showFab, setShowFab] = useState(false);
  const refetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const client = useApolloClient();

  useNotifications((msg) => {
    if (msg?.level === 'feed_update') {
      // 1. View updates are silent
      if (msg?.action === 'post_viewed' || msg?.action === 'view_post') {
        return;
      }

      // 2. Real-time instant post creation
      const postPayload = msg.post || msg.data?.post;
      if (msg?.action === 'post_created' || (msg?.action === 'create_post' && postPayload)) {
        if (postPayload?.id) {
          try {
            client.cache.modify({
              fields: {
                posts(existingPosts = { results: [], total: 0 }, { readField }) {
                  const existingResults = existingPosts.results || [];
                  const filteredResults = existingResults.filter((ref: any) => {
                    const id = readField ? readField('id', ref) : (ref?.id || (ref?.__ref ? ref.__ref.replace(/^PostType:/, '') : null));
                    return String(id) !== String(postPayload.id);
                  });

                  const newPostRef = client.cache.writeFragment({
                    data: {
                      __typename: 'PostType',
                      ...postPayload,
                      hasLiked: Boolean(postPayload.hasLiked),
                      likers: postPayload.likers || [],
                      commentsCount: postPayload.commentsCount || 0,
                      likesCount: postPayload.likesCount || 0,
                      viewsCount: postPayload.viewsCount || 0,
                    },
                    fragment: gql`
                      fragment RealtimePost on PostType {
                        id
                        title
                        content
                        mediaUrls
                        likesCount
                        commentsCount
                        viewsCount
                        scheduledFor
                        isScheduled
                        createdAt
                        hasLiked
                        likers {
                          id
                          firstName
                          lastName
                          profilePictureUrl
                        }
                        author {
                          id
                          firstName
                          lastName
                          email
                          profilePictureUrl
                        }
                      }
                    `
                  });

                  return {
                    ...existingPosts,
                    total: filteredResults.length + 1,
                    results: [newPostRef, ...filteredResults]
                  };
                }
              }
            });
            return;
          } catch (e) {
            console.error('Failed to write real-time post to cache', e);
          }
        }
      }

      // 3. Real-time post deletion
      if (msg?.action === 'post_deleted' || msg?.action === 'delete_post') {
        const targetId = msg.target_id || msg.post_id || msg.data?.post_id;
        if (targetId) {
          client.cache.evict({ id: client.cache.identify({ __typename: 'PostType', id: String(targetId) }) });
          client.cache.gc();
          return;
        }
      }

      // 4. Real-time post like
      if (msg?.action === 'post_liked' || msg?.action === 'toggle_post_like') {
        const postId = msg.post_id || msg.target_id || msg.data?.post_id;
        const likesCount = msg.likes_count ?? msg.data?.likes_count;
        if (postId && likesCount !== undefined) {
          client.cache.modify({
            id: client.cache.identify({ __typename: 'PostType', id: String(postId) }),
            fields: {
              likesCount() {
                return likesCount;
              }
            }
          });
          return;
        }
      }

      // 5. Real-time comment count sync on post
      if (msg?.action === 'comment_created' || msg?.action === 'comment_deleted') {
        const postId = msg.post_id || msg.target_id;
        const commentsCount = msg.comments_count ?? msg.data?.comments_count;
        if (postId && commentsCount !== undefined) {
          client.cache.modify({
            id: client.cache.identify({ __typename: 'PostType', id: String(postId) }),
            fields: {
              commentsCount() {
                return commentsCount;
              }
            }
          });
          return;
        }
      }

      // Fallback debounce refetch if payload was omitted
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      refetchTimeoutRef.current = setTimeout(() => {
        refetch();
      }, 500);
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
              
              const getPostId = (item: any) => {
                if (!item) return '';
                if (item.id) return String(item.id);
                if (item.__ref) return String(item.__ref).replace(/^PostType:/, '');
                return '';
              };
              const existingIds = new Set((prev?.posts?.results || []).map(getPostId).filter(Boolean));
              const newPosts = (fetchMoreResult?.posts?.results || []).filter(
                (p: any) => !existingIds.has(getPostId(p))
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

  const uniquePosts = React.useMemo(() => {
    const seen = new Set<string>();
    return posts.filter((post: any) => {
      if (!post?.id) return false;
      const strId = String(post.id);
      if (seen.has(strId)) return false;
      seen.add(strId);
      return true;
    });
  }, [posts]);

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
      
      {uniquePosts.length === 0 && !loading ? (
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
          {uniquePosts.map((post: any) => (
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
