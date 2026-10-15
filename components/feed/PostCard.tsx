import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Eye, Hash, FileText, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFeedMutations } from '@/lib/graphql/feed/feedHooks';
import { useUser } from '@/lib/api/hooks';
import { toast } from 'sonner';
import { CommentSection } from './CommentSection';
import { PhotoOverlay } from '@/components/common/PhotoOverlay';
import { UserProfileModal } from '@/components/common/UserProfileModal';
import { RichContentRenderer } from './RichContentRenderer';
import { RichTextEditor } from './RichTextEditor';
import { resolveAvatarUrl } from '@/lib/utils';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useApolloClient } from '@apollo/client/react';
import { GET_DIRECTORY_USERS } from '@/lib/graphql/users/queries';

export const PostCard = ({ post }: { post: any }) => {
  const { user } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isOptimisticallyDeleted, setIsOptimisticallyDeleted] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(post.title || '');
  const [displayContent, setDisplayContent] = useState(post.content || '');
  const [displayMediaUrls, setDisplayMediaUrls] = useState<string[]>(post.mediaUrls || []);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editMediaUrls, setEditMediaUrls] = useState<string[]>(post.mediaUrls || []);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [viewsCount, setViewsCount] = useState<number>(post.viewsCount || 0);

  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = React.useRef(false);
  const isEditingRef = React.useRef(false);
  
  // Profile Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any | null>(null);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  
  const { togglePostLike, deletePost, updatePost, reportPost } = useFeedMutations();
  const observerRef = React.useRef<HTMLDivElement>(null);
  const [hasViewed, setHasViewed] = useState(false);
  const client = useApolloClient();

  const { sendJsonMessage } = useNotifications((msg) => {
    if (msg?.level === 'feed_update' && msg?.action === 'post_viewed' && msg?.target_id === post.id) {
      if (typeof msg?.views_count === 'number') {
        setViewsCount(msg.views_count);
      }
    }
  }, { silent: true });

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

  React.useEffect(() => {
    setDisplayTitle(post.title || '');
    setDisplayContent(post.content || '');
    setDisplayMediaUrls(post.mediaUrls || []);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditMediaUrls(post.mediaUrls || []);
    if (typeof post.viewsCount === 'number') {
      setViewsCount(post.viewsCount);
    }
  }, [post.title, post.content, post.mediaUrls, post.viewsCount]);

  React.useEffect(() => {
    if (!observerRef.current || hasViewed) return;

    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          timeoutId = setTimeout(() => {
            // View post via WebSocket instead of HTTP API call!
            try {
              sendJsonMessage?.({ action: 'view_post', post_id: post.id });
              setViewsCount(prev => prev + 1);
            } catch (err) {
              console.error('Failed to send view_post over websocket:', err);
            }
            setHasViewed(true);
            observer.disconnect();
          }, 1500);
        } else {
          clearTimeout(timeoutId);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [hasViewed, post.id, sendJsonMessage]);

  // Extract unique hashtags from post title and content
  const extractHashtags = () => {
    const textToScan = `${displayTitle} ${displayContent.replace(/<[^>]*>?/gm, ' ')}`;
    const hashtagMatches = Array.from(textToScan.matchAll(/#([a-zA-Z0-9_\u0080-\uffff]+)/g)).map(m => `#${m[1]}`);
    
    // Case-insensitive deduplication, keeping clean capitalized formatting
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const tag of hashtagMatches) {
      const lower = tag.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(tag);
      }
    }
    return unique;
  };

  const uniqueTags = extractHashtags();

  // Strip standalone or trailing hashtag lines from the body text so they only show in the clean badge row below
  const cleanContentForDisplay = (contentHtml: string) => {
    if (!contentHtml) return '';
    let cleaned = contentHtml;
    // Remove hidden tag blocks
    cleaned = cleaned.replace(/<div\s+data-tags="true"[^>]*>[\s\S]*?<\/div>/gi, '');
    // Remove trailing paragraphs that contain only hashtags (e.g. <p>#Announcement</p> or <p><br/>#Announcement</p>)
    cleaned = cleaned.replace(/<p[^>]*>(?:<br\s*\/?>|\s|&nbsp;)*(?:#[a-zA-Z0-9_\u0080-\uffff]+(?:\s|&nbsp;)*)+(?:<br\s*\/?>|\s|&nbsp;)*<\/p>\s*$/gi, '');
    // Also remove any standalone trailing hashtag line from plain text if present
    cleaned = cleaned.replace(/(?:<br\s*\/?>|\s)*#[a-zA-Z0-9_\u0080-\uffff]+(?:\s+#[a-zA-Z0-9_\u0080-\uffff]+)*\s*$/gi, '');
    return cleaned;
  };

  const isOwner = user?.id?.toString() === post.author?.id?.toString();
  const isAdmin = (user?.role as string) === 'admin' || (user?.role as string) === 'superadmin' || user?.role === 'hr';
  const canDelete = isOwner || isAdmin;

  const handleLike = async () => {
    try {
      await togglePostLike({ 
        variables: { postId: post.id },
        optimisticResponse: {
          togglePostLike: !post.hasLiked
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

    // INSTANT OPTIMISTIC UI: close dialog and hide post immediately
    setShowDeleteDialog(false);
    setIsOptimisticallyDeleted(true);
    if (deleteReason && !isOwner) {
      toast.success('Post deleted and feedback sent to user');
    } else {
      toast.success('Post deleted');
    }

    try {
      await deletePost({
        variables: { id: post.id },
        optimisticResponse: { deletePost: true }
      });
      setDeleteReason('');
    } catch (e) {
      // Revert if API failed
      setIsOptimisticallyDeleted(false);
      toast.error('Failed to delete post');
    } finally {
      setTimeout(() => {
        isDeletingRef.current = false;
        setIsDeleting(false);
      }, 500);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }
    try {
      await reportPost({ variables: { postId: post.id, reason: reportReason } });
      toast.success('Post reported to admins');
      setShowReportDialog(false);
      setReportReason('');
    } catch (e) {
      toast.error('Failed to report post');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed/${post.id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    setEditMediaUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEdit = async () => {
    if (isEditingRef.current || isSubmittingEdit) return;
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    const strippedContent = editContent.replace(/<[^>]*>?/gm, '').trim();
    const hasImage = editContent.includes('<img');
    const hasMedia = editMediaUrls.length > 0;
    if ((!editContent.trim() || !strippedContent) && !hasImage && !hasMedia) {
      toast.error('Post content or attachment cannot be empty');
      return;
    }

    isEditingRef.current = true;
    setIsSubmittingEdit(true);

    const prevTitle = displayTitle;
    const prevContent = displayContent;
    const prevMediaUrls = displayMediaUrls;

    // INSTANT OPTIMISTIC UI: show updated content and media immediately and exit edit mode
    setDisplayTitle(editTitle);
    setDisplayContent(editContent);
    setDisplayMediaUrls(editMediaUrls);
    setIsEditing(false);
    toast.success('Post updated');

    try {
      await updatePost({
        variables: {
          id: post.id,
          content: editContent,
          title: editTitle,
          mediaUrls: editMediaUrls,
        }
      });
    } catch (e) {
      // Rollback on error
      setDisplayTitle(prevTitle);
      setDisplayContent(prevContent);
      setDisplayMediaUrls(prevMediaUrls);
      setIsEditing(true);
      toast.error('Failed to update post');
    } finally {
      setTimeout(() => {
        isEditingRef.current = false;
        setIsSubmittingEdit(false);
      }, 500);
    }
  };

  if (isOptimisticallyDeleted) {
    return null;
  }

  return (
    <Card ref={observerRef} className="mb-4 sm:mb-5 bg-card text-card-foreground border border-border/50 shadow-sm hover:shadow-md hover:border-border/80 rounded-2xl transition-all duration-200 overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setSelectedUserId(post.author.id.toString());
              setSelectedUserData(post.author);
            }}
          >
            <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/25 transition-all">
              <AvatarImage src={resolveAvatarUrl(post.author.profilePictureUrl)} className="object-cover" />
              <AvatarFallback className="text-sm font-semibold">{post.author.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm sm:text-[15px] text-foreground group-hover:text-primary transition-colors leading-tight">
                {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors focus:outline-none cursor-pointer">
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>Copy Link</DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  Edit
                </DropdownMenuItem>
              )}
              {!isOwner && (
                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-red-600">
                  Report Post
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2 border-b border-border bg-transparent text-base sm:text-lg font-bold focus:outline-none focus:border-primary"
              placeholder="Post title (optional)"
            />
            <RichTextEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Edit your post..."
              minHeight="100px"
              fetchMentions={fetchMentions}
            />

            {/* Attached Media Manager in Edit Mode */}
            {editMediaUrls.length > 0 && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Attached Media ({editMediaUrls.length})</span>
                  <span className="text-[11px] font-normal text-muted-foreground">Click ✕ to delete attachment</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {editMediaUrls.map((url, idx) => {
                    const isPdf = url.toLowerCase().includes('.pdf');
                    const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0] || `Document.pdf`);

                    if (isPdf) {
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 pr-2.5 bg-muted/40 rounded-lg border border-border/60 max-w-xs group shadow-sm"
                        >
                          <div className="p-1.5 rounded bg-rose-500/10 text-rose-500 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate text-foreground" title={fileName}>
                              {fileName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">PDF Document</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="p-1 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete PDF attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border/60 bg-muted/20 shrink-0 shadow-sm"
                      >
                        <img
                          src={url}
                          alt="Attachment"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors shadow-sm cursor-pointer"
                          title="Delete image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={() => {
                  setEditTitle(displayTitle);
                  setEditContent(displayContent);
                  setEditMediaUrls(displayMediaUrls);
                  setIsEditing(false);
                }} 
                disabled={isSubmittingEdit}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleEdit} 
                disabled={isSubmittingEdit}
                className="text-sm bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer font-medium"
              >
                {isSubmittingEdit ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.isScheduled && (
              <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Scheduled for {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Future date'}</span>
              </div>
            )}
            {displayTitle && (
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground mb-1.5 leading-snug">
                {displayTitle}
              </h3>
            )}
            <div 
              className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed font-normal"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const mention = target.closest('[data-type="mention"]');
                if (mention) {
                  const id = mention.getAttribute('data-id');
                  if (id) {
                    setSelectedUserId(id);
                    return;
                  }
                }
                const img = target.closest('img') as HTMLImageElement;
                if (img && img.src) {
                  setPreviewImage(img.src);
                }
              }}
            >
              <RichContentRenderer content={cleanContentForDisplay(displayContent)} />
            </div>
          </>
        )}

        {/* Media (If any) - only shown when not editing to prevent duplicate photos */}
        {!isEditing && displayMediaUrls?.length > 0 && (() => {
          const pdfUrls = displayMediaUrls.filter((url: string) => url.toLowerCase().includes('.pdf'));
          const imageUrls = displayMediaUrls.filter((url: string) => !url.toLowerCase().includes('.pdf'));

          return (
            <div className="mt-3.5 space-y-2.5">
              {/* PDF Documents */}
              {pdfUrls.length > 0 && (
                <div className={`grid gap-2 ${pdfUrls.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {pdfUrls.map((url: string, idx: number) => {
                    const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Document.pdf');
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted/70 transition-colors rounded-xl border border-border/50 group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                            {fileName}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">PDF Document • Click to view</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Single Image (LinkedIn & Instagram feed style: clean edge-to-edge width, capped max height, no side bars) */}
              {imageUrls.length === 1 && (
                <div
                  className="relative group rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 cursor-pointer bg-muted/10 w-full"
                  onClick={() => setPreviewImage(imageUrls[0])}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPreviewImage(imageUrls[0]);
                    }
                  }}
                >
                  <img 
                    src={imageUrls[0]} 
                    alt={displayTitle || "Post attachment"} 
                    className="w-full h-auto max-h-[500px] sm:max-h-[540px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="bg-black/75 text-white rounded-full p-2 backdrop-blur-md flex items-center gap-1.5 text-xs font-medium px-3.5 shadow-lg">
                      <Eye className="w-4 h-4" />
                      <span>View full photo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2 Images (Side by Side 50/50 Grid) */}
              {imageUrls.length === 2 && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                  {imageUrls.map((url: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative group h-[240px] sm:h-[300px] overflow-hidden border border-border/50 cursor-pointer bg-muted/20 rounded-xl"
                      onClick={() => setPreviewImage(url)}
                      role="button"
                      tabIndex={0}
                    >
                      <img 
                        src={url} 
                        alt={displayTitle || "Post attachment"} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <div className="bg-black/75 text-white rounded-full p-1.5 backdrop-blur-md flex items-center gap-1 text-xs font-medium px-2.5 shadow-lg">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3 Images (1 Dominant on Left, 2 Stacked on Right) */}
              {imageUrls.length === 3 && (
                <div className="grid grid-cols-2 gap-2 h-[280px] sm:h-[340px] rounded-2xl overflow-hidden">
                  <div
                    className="relative group row-span-2 h-full overflow-hidden border border-border/50 cursor-pointer bg-muted/20 rounded-xl"
                    onClick={() => setPreviewImage(imageUrls[0])}
                    role="button"
                    tabIndex={0}
                  >
                    <img 
                      src={imageUrls[0]} 
                      alt={displayTitle || "Post attachment"} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-black/75 text-white rounded-full p-1.5 backdrop-blur-md flex items-center gap-1 text-xs font-medium px-2.5 shadow-lg">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-rows-2 gap-2 h-full">
                    {imageUrls.slice(1, 3).map((url: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative group h-full overflow-hidden border border-border/50 cursor-pointer bg-muted/20 rounded-xl"
                        onClick={() => setPreviewImage(url)}
                        role="button"
                        tabIndex={0}
                      >
                        <img 
                          src={url} 
                          alt={displayTitle || "Post attachment"} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="bg-black/75 text-white rounded-full p-1.5 backdrop-blur-md flex items-center gap-1 text-xs font-medium px-2.5 shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 or more Images (2x2 Grid with +N Overlay) */}
              {imageUrls.length >= 4 && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                  {imageUrls.slice(0, 4).map((url: string, idx: number) => {
                    const isFourth = idx === 3;
                    const extraCount = imageUrls.length - 4;
                    return (
                      <div
                        key={idx}
                        className="relative group h-[150px] sm:h-[190px] overflow-hidden border border-border/50 cursor-pointer bg-muted/20 rounded-xl"
                        onClick={() => setPreviewImage(url)}
                        role="button"
                        tabIndex={0}
                      >
                        <img 
                          src={url} 
                          alt={displayTitle || "Post attachment"} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        {isFourth && extraCount > 0 ? (
                          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                            +{extraCount} more
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="bg-black/75 text-white rounded-full p-1.5 backdrop-blur-md flex items-center gap-1 text-xs font-medium px-2.5 shadow-lg">
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Badges & Tags Section Below Content / Media */}
        {uniqueTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            {uniqueTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-default"
              >
                <Hash className="w-3 h-3 text-primary" />
                <span>{tag.replace(/^#/, '')}</span>
              </span>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border/40 text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Like Pill */}
            <div className={`inline-flex items-center rounded-full transition-all text-xs sm:text-sm font-medium ${
              post.hasLiked 
                ? 'bg-rose-500/10 text-rose-500 font-semibold' 
                : 'hover:bg-muted text-muted-foreground hover:text-rose-500'
            }`}>
              <button 
                onClick={handleLike}
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-l-full cursor-pointer transition-transform active:scale-125"
                title={post.hasLiked ? "Unlike" : "Like"}
              >
                <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all ${post.hasLiked ? 'fill-current scale-105' : ''}`} />
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className="pr-2.5 py-1.5 -ml-0.5 text-xs font-semibold hover:underline cursor-pointer">
                    {post.likesCount || 0}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 shadow-xl" align="start">
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2 px-1">Liked by</h4>
                  {post.likers?.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {post.likers.map((liker: any) => (
                        <div 
                          key={liker.id} 
                          className="flex items-center gap-2 px-1.5 py-1 cursor-pointer hover:bg-muted/70 rounded-lg transition-colors"
                          onClick={() => {
                            setSelectedUserId(liker.id.toString());
                            setSelectedUserData(liker);
                          }}
                          title="View profile card"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={resolveAvatarUrl(liker.profilePictureUrl)} />
                            <AvatarFallback className="text-[10px]">{liker.firstName?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs sm:text-sm font-medium truncate text-foreground">
                            {liker.firstName} {liker.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground px-1 py-2">No likes yet</p>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Comment Button */}
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                showComments 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'hover:bg-muted text-muted-foreground hover:text-primary'
              }`}
              title="Comments"
            >
              <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span>{post.commentsCount || 0}</span>
            </button>

            {/* Views counter (for owner) */}
            {isOwner && (
              <div 
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-muted-foreground/80 bg-muted/30" 
                title="Post views"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{viewsCount}</span>
              </div>
            )}
          </div>
          
          {/* Share */}
          <button 
            onClick={handleShare} 
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            title="Share post"
          >
            <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* Threaded Comments */}
        <CommentSection 
          postId={post.id} 
          isExpanded={showComments} 
          commentsCount={post.commentsCount || 0} 
          onViewUser={(userId, author) => {
            setSelectedUserId(userId);
            setSelectedUserData(author);
          }}
        />

        {/* Photo Preview Overlay */}
        <PhotoOverlay
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
          src={previewImage}
          name={post.title || `${post.author?.firstName || 'User'}'s post attachment`}
        />

        {/* User Profile Modal (ID Card) */}
        <UserProfileModal
          userId={selectedUserId}
          open={!!selectedUserId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUserId(null);
              setSelectedUserData(null);
            }
          }}
          initialData={selectedUserData}
        />

        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="p-6">
            <DialogHeader>
              <DialogTitle>Report Post</DialogTitle>
              <DialogDescription>
                Help us understand why you are reporting this post. Admins will review your report.
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
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
              <Button onClick={handleReport}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="p-6">
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {!isOwner && isAdmin && (
              <div className="mt-2">
                <label className="text-sm font-medium mb-1.5 block">Reason for deletion (Feedback to user)</label>
                <textarea
                  className="w-full min-h-[80px] p-3 border rounded-md text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Explain why this post is being removed..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                />
              </div>
            )}

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
