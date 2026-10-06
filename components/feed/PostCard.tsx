import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFeedMutations } from '@/lib/graphql/feed/feedHooks';
import { useUser } from '@/lib/api/hooks';
import { toast } from 'sonner';
import { CommentSection } from './CommentSection';
import { PhotoOverlay } from '@/components/common/PhotoOverlay';
import { RichContentRenderer } from './RichContentRenderer';
import { RichTextEditor } from './RichTextEditor';

export const PostCard = ({ post }: { post: any }) => {
  const { user } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { togglePostLike, deletePost, updatePost } = useFeedMutations();

  const isOwner = user?.id?.toString() === post.author?.id?.toString();

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
    try {
      await deletePost({ variables: { id: post.id } });
      toast.success('Post deleted');
    } catch (e) {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed/${post.id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updatePost({ variables: { id: post.id, content: editContent, title: editTitle } });
      setIsEditing(false);
      toast.success('Post updated');
    } catch (e) {
      toast.error('Failed to update post');
    }
  };

  return (
    <Card className="mb-6 shadow-sm border-gray-200/60 dark:border-gray-800 transition-all hover:shadow-md">
      <CardContent className="pt-6">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.profilePictureUrl} />
              <AvatarFallback>{post.author.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600 focus:outline-none">
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>Copy Link</DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </>
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
              className="w-full p-2 border-b border-gray-200 dark:border-gray-800 bg-transparent text-lg font-bold focus:outline-none focus:border-primary"
              placeholder="Post title (optional)"
            />
            <RichTextEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Edit your post..."
              minHeight="100px"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleEdit} className="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </div>
        ) : (
          <>
            {post.title && (
              <div className="mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {post.title}
                </h3>
              </div>
            )}
            <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              <RichContentRenderer content={post.content} />
            </div>
          </>
        )}

        {/* Media (If any) */}
        {post.mediaUrls?.length > 0 && (
          <div className={`mt-4 grid gap-2 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.mediaUrls.map((url: string, idx: number) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer"
                onClick={() => setPreviewImage(url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewImage(url);
                  }
                }}
              >
                <img 
                  src={url} 
                  alt={post.title || "Post attachment"} 
                  className="rounded-xl object-cover max-h-96 w-full transition-transform duration-200 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 text-white rounded-full p-2 backdrop-blur-sm flex items-center gap-1.5 text-xs font-medium px-3 shadow-md">
                    <Eye className="w-4 h-4" />
                    <span>View photo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-500">
          <div className="flex gap-6">
            <div className="flex items-center gap-1 text-sm font-medium">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors hover:text-red-500 p-1 -ml-1 rounded-md ${post.hasLiked ? 'text-red-500' : ''}`}
                title={post.hasLiked ? "Unlike" : "Like"}
              >
                <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className="hover:underline text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
                    {post.likesCount || 0}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 shadow-xl" align="start">
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2 px-1">Liked by</h4>
                  {post.likers?.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {post.likers.map((liker: any) => (
                        <div key={liker.id} className="flex items-center gap-2 px-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={liker.profilePictureUrl} />
                            <AvatarFallback className="text-[10px]">{liker.firstName?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">
                            {liker.firstName} {liker.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 px-1 py-2">No likes yet</p>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentsCount || 0}</span>
            </button>
          </div>
          
          <button onClick={handleShare} className="hover:text-primary transition-colors text-sm font-medium">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Threaded Comments */}
        <CommentSection postId={post.id} isExpanded={showComments} commentsCount={post.commentsCount || 0} />

        {/* Photo Preview Overlay */}
        <PhotoOverlay
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
          src={previewImage}
          name={post.title || `${post.author?.firstName || 'User'}'s post attachment`}
        />

      </CardContent>
    </Card>
  );
};
