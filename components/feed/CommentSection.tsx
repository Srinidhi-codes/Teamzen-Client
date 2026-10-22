import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePostComments, useFeedMutations } from '@/lib/graphql/feed/feedHooks';
import { Loader2, ThumbsUp, Reply, Trash2, Heart, Edit2, Send, MoreHorizontal, X, Flag } from 'lucide-react';
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

const insertCommentIntoTree = (comments: any[], newComment: any, parentId?: string | null): any[] => {
  if (!parentId) {
    if (comments.some(c => c.id === newComment.id)) return comments;
    return [...comments, { ...newComment, replies: newComment.replies || [] }];
  }
  return comments.map(c => {
    if (c.id === parentId) {
      const existingReplies = c.replies || [];
      if (existingReplies.some((r: any) => r.id === newComment.id)) return c;
      return {
        ...c,
        replies: [...existingReplies, { ...newComment, replies: newComment.replies || [] }]
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: insertCommentIntoTree(c.replies, newComment, parentId)
      };
    }
    return c;
  });
};

const removeCommentFromTree = (comments: any[], commentId: string): any[] => {
  return comments
    .filter(c => c.id !== commentId)
    .map(c => {
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: removeCommentFromTree(c.replies, commentId)
        };
      }
      return c;
    });
};

const updateCommentInTree = (comments: any[], commentId: string, updates: Partial<any>): any[] => {
  return comments.map(c => {
    if (c.id === commentId) {
      return { ...c, ...updates };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: updateCommentInTree(c.replies, commentId, updates)
      };
    }
    return c;
  });
};

const CommentItem = ({ comment, postId, depth = 0, fetchMentions, onViewUser, onReply }: any) => {
  const { user } = useUser();
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayContent, setDisplayContent] = useState(comment.content);
  const [editContent, setEditContent] = useState(comment.content);
  const [isOptimisticallyDeleted, setIsOptimisticallyDeleted] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const isDeletingRef = useRef(false);
  const isEditingRef = useRef(false);

  const { deleteComment, updateComment, toggleCommentLike, reportComment } = useFeedMutations();

  useEffect(() => {
    setDisplayContent(comment.content);
    setEditContent(comment.content);
  }, [comment.content]);

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
    if (isDeletingRef.current || isDeleting) return;
    isDeletingRef.current = true;
    setIsDeleting(true);

    // INSTANT OPTIMISTIC UI: hide comment immediately
    setIsOptimisticallyDeleted(true);
    toast.success('Comment deleted');

    try {
      await deleteComment({
        variables: { id: comment.id },
        optimisticResponse: { deleteComment: true }
      });
    } catch (e) {
      setIsOptimisticallyDeleted(false);
      toast.error('Failed to delete comment');
    } finally {
      setTimeout(() => {
        isDeletingRef.current = false;
        setIsDeleting(false);
      }, 500);
    }
  };

  const handleEdit = async () => {
    if (isEditingRef.current || isSubmittingEdit || !editContent.trim()) return;
    isEditingRef.current = true;
    setIsSubmittingEdit(true);

    const prevContent = displayContent;
    // INSTANT OPTIMISTIC UI: update display immediately and close edit mode
    setDisplayContent(editContent);
    setIsEditing(false);
    toast.success('Comment updated');

    try {
      await updateComment({
        variables: { id: comment.id, content: editContent }
      });
    } catch (e) {
      setDisplayContent(prevContent);
      setIsEditing(true);
      toast.error('Failed to update comment');
    } finally {
      setTimeout(() => {
        isEditingRef.current = false;
        setIsSubmittingEdit(false);
      }, 500);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }
    setIsSubmittingReport(true);
    try {
      await reportComment({
        variables: { commentId: comment.id, reason: reportReason }
      });
      toast.success('Comment reported to admins');
      setShowReportDialog(false);
      setReportReason('');
    } catch (e) {
      toast.error('Failed to report comment');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isOptimisticallyDeleted) {
    return null;
  }

  const isOwner = user?.id?.toString() === comment.author?.id?.toString();
  const isAdmin = (user?.role as string) === 'admin' || (user?.role as string) === 'superadmin' || user?.role === 'hr';
  const canDelete = isOwner || isAdmin;

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
    <div className={`flex gap-2 sm:gap-3 mt-3 relative w-full`}>
      {/* Thread line connecting avatar to replies */}
      {isTopLevel && allReplies.length > 0 && (
        <div className="absolute left-4 sm:left-5 top-10 sm:top-12 bottom-0 w-px bg-border/60" />
      )}
      
      <Avatar 
        className={`shrink-0 ${avatarSize} cursor-pointer hover:opacity-85 transition-opacity ring-1 ring-border/40`}
        onClick={() => comment.author?.id && onViewUser?.(comment.author.id.toString(), comment.author)}
        title="View profile card"
      >
        <AvatarImage src={resolveAvatarUrl(comment.author.profilePictureUrl)} className="object-cover" />
        <AvatarFallback className="text-xs font-semibold">{comment.author.firstName?.[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-muted/40 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/30 border border-border/30 rounded-2xl px-3.5 py-2.5 inline-block max-w-full transition-colors">
          <div className="flex items-center justify-between gap-2.5">
            <span 
              className="font-semibold text-xs sm:text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => comment.author?.id && onViewUser?.(comment.author.id.toString(), comment.author)}
            >
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted/80 transition-colors focus:outline-none cursor-pointer">
                  <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setIsEditing(!isEditing)} className="cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem 
                      onClick={() => setShowReportDialog(true)} 
                      className="text-amber-600 dark:text-amber-400 focus:text-amber-600 cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5 mr-2" />
                      Report Comment
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {isEditing ? (
            <div className="mt-2">
              <MentionsInputWrapper
                value={editContent}
                onChange={(e: any) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="w-full bg-background border border-border rounded-xl min-h-[40px] pt-1 text-sm text-foreground"
                fetchMentions={fetchMentions}
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button 
                  onClick={() => {
                    setEditContent(displayContent);
                    setIsEditing(false);
                  }} 
                  disabled={isSubmittingEdit}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEdit} 
                  disabled={isSubmittingEdit}
                  className="text-xs bg-primary text-white px-3 py-1 rounded-md disabled:opacity-50 font-medium cursor-pointer"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-sm mt-1 text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
              {renderContent(displayContent)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3.5 mt-1.5 ml-2 text-xs font-medium text-muted-foreground">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer ${comment.hasLiked ? 'text-rose-500 font-semibold' : ''}`}
          >
            <Heart className={`w-3.5 h-3.5 ${comment.hasLiked ? 'fill-current' : ''}`} />
            {comment.likesCount > 0 && comment.likesCount}
          </button>
          
          <button 
            onClick={() => onReply?.(comment)}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" /> Reply
          </button>
        </div>

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
                onReply={onReply}
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
      {/* Report Comment Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Help us understand why you are reporting this comment. Admins will review your report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            <label className="text-sm font-medium mb-1.5 block">Reason for reporting</label>
            <textarea
              className="w-full min-h-[80px] p-3 border rounded-md text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Spam, inappropriate content, harassment..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)} disabled={isSubmittingReport}>
              Cancel
            </Button>
            <Button onClick={handleReport} disabled={isSubmittingReport || !reportReason.trim()}>
              {isSubmittingReport ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);
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
    if (!isExpanded || msg?.level !== 'feed_update') return;
    const msgPostId = msg.post_id || msg.target_id || msg.data?.post_id;
    if (String(msgPostId) !== String(postId)) return;

    if (msg.action === 'comment_created' || (msg.action === 'create_comment' && (msg.comment || msg.data?.comment))) {
      const newComment = msg.comment || msg.data?.comment;
      if (newComment?.id) {
        setAllComments(prev => insertCommentIntoTree(prev, newComment, msg.parent_id || msg.data?.parent_id || newComment.parentId));
        return;
      }
    }

    if (msg.action === 'comment_deleted' || (msg.action === 'delete_comment' && (msg.comment_id || msg.data?.comment_id))) {
      const commentId = msg.comment_id || msg.data?.comment_id;
      if (commentId) {
        setAllComments(prev => removeCommentFromTree(prev, String(commentId)));
        return;
      }
    }

    if (msg.action === 'comment_updated' || (msg.action === 'update_comment' && (msg.comment || msg.data?.comment))) {
      const updated = msg.comment || msg.data?.comment;
      if (updated?.id) {
        setAllComments(prev => updateCommentInTree(prev, String(updated.id), { content: updated.content, updatedAt: updated.updatedAt }));
        return;
      }
    }

    if (msg.action === 'comment_liked' || msg.action === 'toggle_comment_like') {
      const commentId = msg.comment_id || msg.data?.comment_id;
      const likesCount = msg.likes_count ?? msg.data?.likes_count;
      if (commentId && likesCount !== undefined) {
        setAllComments(prev => updateCommentInTree(prev, String(commentId), { likesCount }));
        return;
      }
    }

    refetch();
  }, { silent: true });

  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const isSubmittingCommentRef = useRef(false);

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

  const handleReplyClick = (targetComment: any) => {
    const authorName = `${targetComment.author?.firstName || ''} ${targetComment.author?.lastName || ''}`.trim() || 'User';
    setReplyingTo({ id: targetComment.id, authorName });
  };

  const handleComment = async () => {
    if (!content.trim() || isSubmittingCommentRef.current || isSubmittingComment || isCreatingComment) return;
    isSubmittingCommentRef.current = true;
    setIsSubmittingComment(true);

    const commentText = content;
    const parentId = replyingTo?.id || null;
    setContent('');
    setReplyingTo(null);

    try {
      const res = await createComment({
        variables: { postId, content: commentText, parentId }
      });
      const created = res?.data?.createComment;
      if (created) {
        setAllComments(prev => insertCommentIntoTree(prev, created, parentId));
      }
      toast.success(parentId ? 'Reply posted' : 'Comment posted');
    } catch (e) {
      setContent(commentText);
      toast.error('Failed to post comment');
    } finally {
      setTimeout(() => {
        isSubmittingCommentRef.current = false;
        setIsSubmittingComment(false);
      }, 500);
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

  if (!isExpanded || !mounted) return null;

  return (
    <div className="mt-3.5 pt-3 border-t border-border/30 animate-in fade-in-50 slide-in-from-top-1 duration-200">
      {/* Comments List (Above Input, like Instagram) */}
      {loading && allComments.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2.5 mb-3.5">
          {allComments.map((comment: any) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={postId} 
              fetchMentions={fetchMentions} 
              onViewUser={onViewUser}
              onReply={handleReplyClick}
            />
          ))}
          
          {hasMoreComments && (
            <div className="pt-1.5 pb-0.5">
              <button
                onClick={handleLoadMore}
                disabled={fetchingMore}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {fetchingMore ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Load more comments'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Comment & Reply Input (At bottom) */}
      <div className="pt-1">
        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-1.5 mb-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-foreground animate-in fade-in-50 duration-150">
            <div className="flex items-center gap-1.5 min-w-0">
              <Reply className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">
                Replying to <span className="font-semibold text-primary">@{replyingTo.authorName}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:text-foreground hover:bg-primary/20 rounded-full transition-colors cursor-pointer"
              title="Cancel reply"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex gap-2.5 sm:gap-3 items-center relative w-full">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 ring-1 ring-border/50">
            <AvatarImage src={resolveAvatarUrl(user?.profilePictureUrl || (user as any)?.profilePicture)} className="object-cover" />
            <AvatarFallback className="text-xs font-semibold">{user?.firstName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-2xl px-3.5 py-1.5 sm:px-4 sm:py-2 bg-muted/40 dark:bg-muted/20 border border-border/50 hover:border-border/80 focus-within:border-primary/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/15 transition-all min-h-[42px] sm:min-h-[44px] relative group pr-11 sm:pr-12 flex items-center">
            <MentionsInputWrapper
              value={content}
              onChange={(e: any) => setContent(e.target.value)}
              placeholder={replyingTo ? `Reply to @${replyingTo.authorName}...` : "Write a comment..."}
              className="w-full text-xs sm:text-sm text-foreground focus:outline-none"
              fetchMentions={fetchMentions}
            />
            
            <button 
              disabled={!content.trim() || isSubmittingComment || isCreatingComment}
              onClick={handleComment}
              className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                content.trim() && !isSubmittingComment && !isCreatingComment 
                  ? 'bg-primary text-white shadow-sm hover:bg-primary/90 hover:scale-105 active:scale-95' 
                  : 'text-muted-foreground/30 bg-transparent cursor-not-allowed'
              }`}
              title="Send comment"
            >
              {(isSubmittingComment || isCreatingComment) ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-primary" />
              ) : (
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
