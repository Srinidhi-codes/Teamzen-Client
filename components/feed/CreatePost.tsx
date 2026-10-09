import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, Loader2, Camera, FileText } from 'lucide-react';
import { useFeedMutations } from '@/lib/graphql/feed/feedHooks';
import { useUser } from '@/lib/api/hooks';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { RichTextEditor } from './RichTextEditor';
import { useApolloClient } from '@apollo/client/react';
import { GET_DIRECTORY_USERS } from '@/lib/graphql/users/queries';
import { resolveAvatarUrl } from '@/lib/utils';

export const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    description: '',
  });
  const { user } = useUser();
  const { createPost, isCreatingPost } = useFeedMutations();
  const client = useApolloClient();

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

  const handlePost = async () => {
    if (!title.trim() && !content.trim()) {
      setErrorModal({
        isOpen: true,
        title: 'Header and Body Required',
        description: 'Please provide both a title (header) and body text for your post before publishing.',
      });
      return;
    }

    if (!title.trim()) {
      setErrorModal({
        isOpen: true,
        title: 'Header Required',
        description: 'Please enter a title (header) for your post before publishing.',
      });
      return;
    }

    const strippedContent = content.replace(/<[^>]*>?/gm, '').trim();
    const hasImage = content.includes('<img');

    if ((!content.trim() || !strippedContent) && !hasImage) {
      setErrorModal({
        isOpen: true,
        title: 'Body Required',
        description: 'Please enter body text or an image for your post before publishing.',
      });
      return;
    }

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

      await createPost({
        variables: {
          title,
          content,
          mediaB64: mediaB64.length > 0 ? mediaB64 : null,
        }
      });
      setTitle('');
      setContent('');
      setSelectedFiles([]);
      toast.success('Post created successfully!');
    } catch (err) {
      toast.error('Failed to create post');
      console.error(err);
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
          />
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedFiles.map((f, i) => (
                <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t py-3 border-gray-100 dark:border-gray-800">
          <div className="flex gap-1 sm:gap-2">
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
            
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 px-2 sm:px-3" onClick={() => document.getElementById('media-upload')?.click()}>
              <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Add Media</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 px-2 sm:px-3" onClick={() => document.getElementById('camera-upload')?.click()}>
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Camera</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 px-2 sm:px-3" onClick={() => document.getElementById('pdf-upload')?.click()}>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
          <Button 
            onClick={handlePost} 
            disabled={isCreatingPost}
            className="rounded-full px-4 sm:px-6 shrink-0"
          >
            {isCreatingPost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
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
    </>
  );
};
