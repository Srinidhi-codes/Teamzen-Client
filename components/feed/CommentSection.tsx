import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePostComments, useFeedMutations } from '@/lib/graphql/feed/feedHooks';
import { Loader2, ThumbsUp, Reply, Trash2, Heart, Edit2, Send, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/lib/api/hooks';
import { toast } from 'sonner';
import { useApolloClient } from '@apollo/client/react';
import { GET_DIRECTORY_USERS } from '@/lib/graphql/users/queries';
import { GET_POST_COMMENTS } from '@/lib/graphql/feed/queries';
import { useNotifications } from '@/lib/hooks/useNotifications';
import dynamic from 'next/dynamic';
import { useDirectoryUsers } from '@/lib/graphql/users/usersHooks';
import { resolveAvatarUrl } from '@/lib/utils';

const MentionsInputWrapper = dynamic(() => import('./MentionsInputWrapper'), { ssr: false }) as any;

const flattenReplies = (replies: any[] = []): any[] => {
  return replies.reduce((acc: any[], reply: any) => {
    return [...acc, reply, ...flattenReplies(reply.replies || [])];
  }, []);
};

const CommentItem = ({ comment, postId, depth = 0, fetchMentions, onViewUser }: any) => {
  const { user } = useUser();
  const [isReplying, setIsReplying] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { createComment, deleteComment, updateComment, toggleCommentLike } = useFeedMutations();

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    try {
      await createComment({
        variables: { postId, content: replyContent, parentId: comment.id },
        refetchQueries: ['GetPostComments']
      });
      setIsReplying(false);
      setReplyContent('');
      toast.success('Reply posted');
    } catch (e) {
      toast.error('Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLike = async () => {
    try {
      await toggleCommentLike({ 
        variables: { commentId: comment.id },
        optimisticResponse: {
          toggleCommentLike: !comment.hasLiked
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment({
        variables: { id: comment.id },
        refetchQueries: ['GetPostComments']
      });
      toast.success('Comment deleted');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateComment({
        variables: { id: comment.id, content: editContent }
      });
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (e) {
      toast.error('Failed to update comment');
    }
  };

  const toggleReplying = () => {
    if (!isReplying && comment.author) {
      const authorName = `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim();
      if (authorName && comment.author.id && !replyContent) {
        setReplyContent(`<p><span data-type="mention" data-id="${comment.author.id}" data-label="${authorName}">@${authorName}</span>&nbsp;</p>`);
      }
    }
    setIsReplying(!isReplying);
  };

  const isOwner = user?.id?.toString() === comment.author?.id?.toString();

  // Format mentions to be bolded or colored
  const renderContent = (contentStr: string) => {
    if (!contentStr) return null;
    
    // Tiptap outputs HTML, so if it looks like HTML, render it directly
    if (contentStr.includes('<p>') || contentStr.includes('data-type="mention"')) {
      return (
        <div 
          className="tiptap tiptap-content text-sm"
          dangerouslySetInnerHTML={{ __html: contentStr }}
        />
      );
    }

    // Fallback for old react-mentions style @[Name](ID)
    const parts = contentStr.split(/(@\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      const match = part.match(/@\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return <span key={i} className="text-primary font-semibold">@{match[1]}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const isTopLevel = depth === 0;
  const avatarSize = isTopLevel ? "h-8 w-8 sm:h-10 sm:w-10 mt-1" : "h-6 w-6 sm:h-8 sm:w-8 mt-1";
  const allReplies = isTopLevel ? flattenReplies(comment.replies || []) : [];

  return (
    <div className={`flex gap-2 sm:gap-3 mt-3 sm:mt-4 relative w-full`}>
      {/* Thread line connecting avatar to replies */}
      {isTopLevel && allReplies.length > 0 && (
        <div className="absolute left-4 sm:left-5 top-10 sm:top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
      )}
      
      <Avatar 
        className={`shrink-0 ${avatarSize} cursor-pointer hover:opacity-85 transition-opacity`}
        onClick={() => comment.author?.id && onViewUser?.(comment.author.id.toString(), comment.author)}
        title="View profile card"
      >
        <AvatarImage src={resolveAvatarUrl(comment.author.profilePictureUrl)} className="object-cover" />
        <AvatarFallback>{comment.author.firstName?.[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 inline-block max-w-full">
          <div className="flex items-center justify-between gap-2">
            <span 
              className="font-semibold text-xs sm:text-sm truncate cursor-pointer hover:underline"
              onClick={() => comment.author?.id && onViewUser?.(comment.author.id.toString(), comment.author)}
            >
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600 focus:outline-none">
                    <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="mt-2">
              <MentionsInputWrapper
                value={editContent}
                onChange={(e: any) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="w-full bg-white dark:bg-gray-900 border rounded-xl min-h-[40px] pt-1 text-sm"
                fetchMentions={fetchMentions}
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                <button onClick={handleEdit} className="text-xs bg-primary text-white px-2 py-1 rounded">Save</button>
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-sm mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              {renderContent(comment.content)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-1 ml-1 sm:ml-2 text-xs font-medium text-gray-500">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${comment.hasLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`w-3.5 h-3.5 ${comment.hasLiked ? 'fill-current' : ''}`} />
            {comment.likesCount > 0 && comment.likesCount}
          </button>
          
          <button 
            onClick={toggleReplying}
            className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-300"
          >
            <Reply className="w-3.5 h-3.5" /> Reply
          </button>
        </div>

        {isReplying && (
          <div className="flex gap-2 mt-2 items-start relative w-full">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 shrink-0">
              <AvatarImage src={resolveAvatarUrl(user?.profilePictureUrl || (user as any)?.profilePicture)} className="object-cover" />
              <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 border rounded-2xl px-2 sm:px-3 py-1 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 min-h-[36px] sm:min-h-[40px] pt-1.5 sm:pt-2">
              <MentionsInputWrapper
                value={replyContent}
                onChange={(e: any) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full h-full text-xs sm:text-sm"
                fetchMentions={fetchMentions}
              />
            </div>
            <button 
              onClick={handleReply}
              className="text-primary hover:text-primary/80 mt-1 sm:mt-2 p-1.5 bg-primary/10 rounded-full shrink-0 disabled:opacity-50"
              disabled={!replyContent.trim() || isSubmittingReply}
            >
              {isSubmittingReply ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        )}

        {isTopLevel && allReplies.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 w-full">
            {(showAllReplies ? allReplies : allReplies.slice(0, 2)).map((reply: any) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                postId={postId} 
                depth={1} 
                fetchMentions={fetchMentions} 
                onViewUser={onViewUser}
              />
            ))}
            {!showAllReplies && allReplies.length > 2 && (
              <button 
                onClick={() => setShowAllReplies(true)}
                className="text-[11px] sm:text-xs text-primary font-medium hover:underline text-left mt-1 ml-1 sm:ml-2 flex items-center gap-1"
              >
                <div className="w-6 h-px bg-border inline-block mr-1"></div>
                View {allReplies.length - 2} more {allReplies.length - 2 === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const CommentSection = ({ 
  postId, 
  isExpanded, 
  commentsCount = 0,
  onViewUser
}: { 
  postId: string; 
  isExpanded: boolean; 
  commentsCount?: number;
  onViewUser?: (userId: string, author?: any) => void;
}) => {
  const { comments: initialComments, loading, refetch, topLevelCommentsCount } = usePostComments(postId, !isExpanded);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const { createComment, isCreatingComment } = useFeedMutations();
  const { user } = useUser();
  const client = useApolloClient();
  const [mounted, setMounted] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // Sync initial comments from query
  useEffect(() => {
    if (!isExpanded || !initialComments) return;
    if (initialComments.length === 0) {
      if (!loading) {
        setAllComments(prev => (prev.length === 0 ? prev : []));
      }
      return;
    }
    setAllComments(prev => {
      if (prev === initialComments) return prev;
      if (prev.length <= initialComments.length) {
        return initialComments;
      }
      // Keep loaded extra pages, but update items from initialComments
      const initialMap = new Map(initialComments.map((c: any) => [c.id, c]));
      const updated = prev.map((c: any) => initialMap.get(c.id) || c);
      const prevIds = new Set(prev.map((c: any) => c.id));
      const brandNew = initialComments.filter((c: any) => !prevIds.has(c.id));
      return [...brandNew, ...updated];
    });
  }, [initialComments, loading, isExpanded]);

  useNotifications((msg) => {
    if (msg?.level === 'feed_update' && msg?.target_id === postId) {
      refetch();
    }
  }, { silent: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMentions = async (query: string, callback: any) => {
    try {
      const { data } = await client.query({
        query: GET_DIRECTORY_USERS,
        variables: { search: query }
      });
      const results = ((data as any)?.directoryUsers || []).map((u: any) => ({
        id: u?.id || Math.random().toString(),
        display: `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || 'User',
        avatar: u?.profilePictureUrl,
        email: u?.email
      }));
      callback(results);
    } catch (e) {
      callback([]);
    }
  };

  if (!isExpanded || !mounted) return null;

  const handleComment = async () => {
    if (!content.trim()) return;
    try {
      await createComment({
        variables: { postId, content },
        refetchQueries: ['GetPostComments']
      });
      setContent('');
    } catch (e) {
      toast.error('Failed to post comment');
    }
  };

  const handleLoadMore = async () => {
    setFetchingMore(true);
    try {
      const { data } = await client.query({
        query: GET_POST_COMMENTS,
        variables: { postId, limit: 5, offset: allComments.length },
        fetchPolicy: 'network-only',
      });
      const moreComments = (data as any)?.post?.comments || [];
      if (moreComments.length > 0) {
        setAllComments(prev => {
          const existingIds = new Set(prev.map((c: any) => c.id));
          const newOnes = moreComments.filter((c: any) => !existingIds.has(c.id));
          return [...prev, ...newOnes];
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load more comments');
    } finally {
      setFetchingMore(false);
    }
  };

  const hasMoreComments = Boolean(
    topLevelCommentsCount !== undefined
      ? allComments.length < topLevelCommentsCount
      : false
  );

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* New Comment Input */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 items-start relative w-full">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-1 shrink-0">
          <AvatarImage src={resolveAvatarUrl(user?.profilePictureUrl || (user as any)?.profilePicture)} className="object-cover" />
          <AvatarFallback>{user?.firstName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 border rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 min-h-[40px] sm:min-h-[44px] relative group pr-12 sm:pr-14">
          <MentionsInputWrapper
            value={content}
            onChange={(e: any) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full h-full text-xs sm:text-sm pt-0.5 sm:pt-0"
            fetchMentions={fetchMentions}
          />
          
          <button 
            disabled={!content.trim() || isCreatingComment}
            onClick={handleComment}
            className="absolute right-2 sm:right-3 top-1.5 sm:top-2 text-primary hover:text-primary/80 disabled:opacity-50 p-1.5 sm:p-2 bg-primary/10 rounded-full shrink-0"
          >
            {isCreatingComment ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {loading && allComments.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {allComments.map((comment: any) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={postId} 
              fetchMentions={fetchMentions} 
              onViewUser={onViewUser}
            />
          ))}
          
          {hasMoreComments && (
            <div className="pt-2 pb-1">
              <button
                onClick={handleLoadMore}
                disabled={fetchingMore}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {fetchingMore ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Load more comments'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
