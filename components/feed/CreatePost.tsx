import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, Loader2, Camera, FileText, Hash, Tag, Plus, X, CalendarClock } from 'lucide-react';
import { useFeedMutations } from '@/lib/graphql/feed/feedHooks';
import { useUser } from '@/lib/api/hooks';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import CameraCaptureModal from './CameraCaptureModal';
import { RichTextEditor } from './RichTextEditor';
import { useApolloClient } from '@apollo/client/react';
import { GET_DIRECTORY_USERS } from '@/lib/graphql/users/queries';
import { resolveAvatarUrl } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/lib/hooks/useNotifications';

const SUGGESTED_TAGS = ['#Announcement', '#Important', '#Update', '#Kudos', '#General'];

export const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const isSubmittingRef = useRef(false);

  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    description: '',
  });
  const { user } = useUser();
  const { createPost, isCreatingPost } = useFeedMutations();
  const client = useApolloClient();

  const isSyncingFromRemoteRef = useRef(false);
  const draftDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const { sendJsonMessage, isConnected } = useNotifications((msg) => {
    if (msg?.level === 'draft_sync' && msg?.scope === 'post') {
      if (msg.action === 'draft_loaded' || msg.action === 'draft_updated') {
        const draft = msg.draft;
        if (draft) {
          isSyncingFromRemoteRef.current = true;
          if (typeof draft.title === 'string') {
            setTitle(draft.title);
          }
          if (typeof draft.content === 'string') {
            setContent(draft.content);
          }
          if (Array.isArray(draft.selectedTags)) {
            setSelectedTags(draft.selectedTags);
          }
          setTimeout(() => {
            isSyncingFromRemoteRef.current = false;
          }, 100);
        }
      } else if (msg.action === 'draft_cleared') {
        isSyncingFromRemoteRef.current = true;
        setTitle('');
        setContent('');
        setSelectedTags([]);
        setTimeout(() => {
          isSyncingFromRemoteRef.current = false;
        }, 100);
      }
    }
  }, { silent: true });

  // On mount / connection established, request any existing draft
  useEffect(() => {
    if (isConnected) {
      sendJsonMessage({ action: 'get_draft', scope: 'post' });
    }
  }, [isConnected]);

  // Synchronize draft changes across tabs and devices with typing debounce
  useEffect(() => {
    if (!isConnected || isSyncingFromRemoteRef.current) return;
    if (draftDebounceRef.current) {
      clearTimeout(draftDebounceRef.current);
    }
    draftDebounceRef.current = setTimeout(() => {
      sendJsonMessage({
        action: 'draft_sync',
        scope: 'post',
        draft: { title, content, selectedTags }
      });
    }, 400);

    return () => {
      if (draftDebounceRef.current) {
        clearTimeout(draftDebounceRef.current);
      }
    };
  }, [title, content, selectedTags, isConnected]);

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

  const toggleTag = (tag: string) => {
    const formatted = tag.startsWith('#') ? tag : `#${tag}`;
    setSelectedTags(prev => 
      prev.includes(formatted) ? prev.filter(t => t !== formatted) : [...prev, formatted]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      const formatted = customTag.trim().startsWith('#') 
        ? customTag.trim() 
        : `#${customTag.trim()}`;
      if (!selectedTags.includes(formatted)) {
        setSelectedTags(prev => [...prev, formatted]);
      }
      setCustomTag('');
      setShowTagInput(false);
    }
  };

  const handlePost = async () => {
    // Prevent double clicking / concurrent submissions immediately
    if (isSubmittingRef.current || isSubmitting || isCreatingPost) {
      return;
    }

    const hasFiles = selectedFiles.length > 0;
    const strippedContent = content.replace(/<[^>]*>?/gm, '').trim();
    const hasImage = content.includes('<img');

    if (!title.trim() && !strippedContent && !hasImage && !hasFiles) {
      setErrorModal({
        isOpen: true,
        title: 'Title and Content Required',
        description: 'Please provide both a title and either body text or an attachment (image/PDF) before publishing.',
      });
      return;
    }

    if (!title.trim()) {
      setErrorModal({
        isOpen: true,
        title: 'Title Required',
        description: 'Please enter a title for your post before publishing.',
      });
      return;
    }

    if (!strippedContent && !hasImage && !hasFiles) {
      setErrorModal({
        isOpen: true,
        title: 'Content Required',
        description: 'Please enter body text or attach an image or PDF document before publishing.',
      });
      return;
    }

    // Lock submission synchronously
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const mediaB64 = await Promise.all(
        selectedFiles.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        })
      );

      // Append selected tags if not already present in the post text
      let finalContent = content.trim() ? content : '<p></p>';
      if (selectedTags.length > 0) {
        const missingTags = selectedTags.filter(tag => !finalContent.includes(tag));
        if (missingTags.length > 0) {
          finalContent = `${finalContent}<div data-tags="true" style="display:none">${missingTags.join(' ')}</div>`;
        }
      }

      await createPost({
        variables: {
          title,
          content: finalContent,
          mediaB64: mediaB64.length > 0 ? mediaB64 : null,
          scheduledFor: scheduledDate ? new Date(scheduledDate).toISOString() : null,
        }
      });
      setTitle('');
      setContent('');
      setSelectedFiles([]);
      setSelectedTags([]);
      setShowTags(false);
      setShowTagInput(false);
      try {
        sendJsonMessage({ action: 'draft_clear', scope: 'post' });
      } catch (e) {
        // Ignore quiet websocket send errors
      }
      if (scheduledDate) {
        toast.success(`Post scheduled for ${new Date(scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}!`);
      } else {
        toast.success('Post created successfully!');
      }
      setScheduledDate('');
    } catch (err) {
      toast.error('Failed to create post');
      console.error(err);
    } finally {
      // Cooldown timer to prevent multiple rapid clicks in span of milliseconds
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }, 600);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCameraCapture = (file: File) => {
    setSelectedFiles(prev => [...prev, file]);
    toast.success('Photo captured and attached!');
  };

  const handleCameraClick = () => {
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      document.getElementById('camera-upload')?.click();
    } else {
      setIsCameraModalOpen(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  return (
    <>
      <Card className="mb-6 shadow-sm border-gray-200/60 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={resolveAvatarUrl(user?.profilePictureUrl || (user as any)?.profilePicture)} alt={user?.firstName} />
              <AvatarFallback>{user?.firstName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <input
              type="text"
              placeholder="Post Title..."
              className="flex-1 bg-transparent text-lg font-semibold focus:outline-none placeholder:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <RichTextEditor
            placeholder="Share an update, milestone, or announcement..."
            value={content}
            onChange={setContent}
            fetchMentions={fetchMentions}
            minHeight="120px"
            onToggleTags={() => setShowTags(prev => !prev)}
            isTagsOpen={showTags}
            selectedTagsCount={selectedTags.length}
          />

          {/* Selected & Suggested Tags Section (Collapsible Slide-Down) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showTags
                ? 'max-h-96 opacity-100 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60'
                : 'max-h-0 opacity-0 mt-0 pt-0 border-t-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-primary" />
                <span>Tags & Badges</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Custom #Tag</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTags(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded-full"
                  title="Close tags"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom Tag Input */}
            {showTagInput && (
              <div className="mb-2 flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">#</span>
                  <input
                    type="text"
                    placeholder="Type tag & press Enter..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    autoFocus
                    className="w-full pl-6 pr-3 py-1 text-xs rounded-full border border-gray-200 dark:border-gray-700 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowTagInput(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              {/* Any custom selected tags not in suggested list */}
              {selectedTags
                .filter(t => !SUGGESTED_TAGS.includes(t))
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-primary text-primary-foreground shadow-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:opacity-75"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          </div>

          {/* Active Tags Badge Row when collapsed */}
          {!showTags && selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/60 animate-in fade-in-0 duration-200">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3 text-primary" />
                <span>Selected Tags:</span>
              </span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="hover:opacity-75"
                    title="Remove tag"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setShowTags(true)}
                className="text-[11px] text-primary hover:underline font-medium ml-1"
              >
                + Edit tags
              </button>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60">
              {selectedFiles.map((f, i) => {
                const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 pl-2.5 pr-1.5 py-1 rounded-full group transition-all"
                  >
                    {isPdf ? (
                      <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : (
                      <ImagePlus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate max-w-[150px] font-medium">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-rose-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Scheduled date indicator badge */}
          {scheduledDate && (
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-medium w-fit">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Will publish on: {new Date(scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <button
                type="button"
                onClick={() => setScheduledDate('')}
                className="ml-1 hover:text-amber-900 dark:hover:text-amber-200"
                title="Cancel schedule"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t py-3 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 sm:gap-2">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              id="media-upload" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              id="camera-upload" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <input 
              type="file" 
              multiple
              accept="application/pdf" 
              id="pdf-upload" 
              className="hidden" 
              onChange={handleFileChange}
            />
            
            {/* Slack-style + Menu for Media, Camera, PDF */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                  title="Add attachments & media"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5 z-[9999]">
                <DropdownMenuItem 
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>Upload from device</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleCameraClick}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take photo</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Attach document</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Schedule Post Popover */}
            <Popover open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`text-xs gap-1.5 px-2.5 py-1.5 h-8 rounded-full ${
                    scheduledDate ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Schedule post"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span className="hidden sm:inline">{scheduledDate ? 'Scheduled' : 'Schedule'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 space-y-3 z-[9999]" align="start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Schedule Post</p>
                  <p className="text-[11px] text-muted-foreground">Choose when your team will see this post.</p>
                </div>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex justify-between items-center pt-1">
                  {scheduledDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScheduledDate('');
                        setIsScheduleOpen(false);
                      }}
                      className="text-xs text-destructive hover:text-destructive h-7 px-2"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsScheduleOpen(false)}
                    className="text-xs h-7 px-3 ml-auto"
                  >
                    Set Schedule
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            onClick={handlePost} 
            disabled={isSubmitting || isCreatingPost}
            className="rounded-full px-4 sm:px-6 shrink-0"
          >
            {(isSubmitting || isCreatingPost) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {scheduledDate ? 'Schedule' : 'Post'}
          </Button>
        </CardFooter>
      </Card>

      <ConfirmationModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        description={errorModal.description}
        confirmText="Got it"
        variant="error"
        hideCancel={true}
      />

      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onFallbackToFileUpload={() => document.getElementById('media-upload')?.click()}
      />
    </>
  );
};
