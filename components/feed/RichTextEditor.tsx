'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  SquareTerminal, 
  Smile, 
  Image as ImageIcon, 
  AtSign, 
  Tag, 
  Hash,
  Link as LinkIcon,
  Unlink,
  Type
} from 'lucide-react';
import tippy from 'tippy.js';
import { MentionList } from './MentionList';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmojiPicker } from './EmojiPicker';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  fetchMentions?: any;
  onToggleTags?: () => void;
  isTagsOpen?: boolean;
  selectedTagsCount?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  minHeight = '44px',
  className = '',
  fetchMentions,
  onToggleTags,
  isTagsOpen = false,
  selectedTagsCount = 0,
}) => {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isHeadingOpen, setIsHeadingOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: 'text-primary underline font-medium hover:opacity-80',
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl w-full my-3 border border-border/50 shadow-sm block h-auto object-contain',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'text-primary font-semibold',
        },
        suggestion: {
          items: ({ query }) => {
            return new Promise((resolve) => {
              if (!fetchMentions) {
                resolve([]);
                return;
              }
              fetchMentions(query, (results: any) => resolve(results));
            });
          },
          render: () => {
            let component: ReactRenderer<any>;
            let popup: any;

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });
                if (!props.clientRect) return;
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as any,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  zIndex: 99999,
                });
              },
              onUpdate(props) {
                component.updateProps(props);
                if (!props.clientRect) return;
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect as any,
                });
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }
                return component.ref?.onKeyDown(props) || false;
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert focus:outline-none w-full max-w-none ${className}`,
        style: `min-height: ${minHeight}; padding: 12px;`,
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                const reader = new FileReader();
                reader.onload = () => {
                  const src = reader.result as string;
                  const node = view.state.schema.nodes.image?.create({ src });
                  if (node) {
                    const tr = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(tr);
                  }
                };
                reader.readAsDataURL(file);
                return true;
              }
            }
          }
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = () => {
              const src = reader.result as string;
              const node = view.state.schema.nodes.image?.create({ src });
              if (node) {
                const tr = view.state.tr.replaceSelectionWith(node);
                view.dispatch(tr);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) {
      if (!value && editor.getHTML() !== '<p></p>') {
        editor.commands.setContent('');
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setIsEmojiOpen(false);
  };

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const formatted = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
        ? linkUrl 
        : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: formatted }).run();
    }
    setIsLinkOpen(false);
    setLinkUrl('');
  };

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all flex flex-col">
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap {
           outline: none !important;
        }
        .tiptap img {
           width: 100% !important;
           max-width: 100% !important;
           height: auto !important;
           max-height: none !important;
           display: block !important;
           border-radius: 0.75rem !important;
           margin: 0.75rem 0 !important;
           object-fit: contain !important;
           border: 1px solid var(--color-border);
           box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .tiptap p:has(> img) {
           width: 100% !important;
        }
        .tiptap p {
           margin-top: 0.25em;
           margin-bottom: 0.25em;
        }
        .tiptap p:first-child { margin-top: 0; }
        .tiptap p:last-child { margin-bottom: 0; }
        .tiptap ul {
           list-style-type: disc;
           padding-left: 1.5rem;
           margin-top: 0.5rem;
           margin-bottom: 0.5rem;
        }
        .tiptap ol {
           list-style-type: decimal;
           padding-left: 1.5rem;
           margin-top: 0.5rem;
           margin-bottom: 0.5rem;
        }
        .tiptap pre {
           background-color: var(--color-muted);
           padding: 0.75rem;
           border-radius: 0.5rem;
           font-family: monospace;
           margin-top: 0.5rem;
           margin-bottom: 0.5rem;
           overflow-x: auto;
        }
        .tiptap code {
           background-color: var(--color-muted);
           padding: 0.125rem 0.25rem;
           border-radius: 0.25rem;
           font-family: monospace;
           font-size: 0.875em;
        }
        .tiptap pre code {
           background-color: transparent;
           padding: 0;
        }
        .tiptap blockquote {
           border-left: 3px solid var(--color-primary);
           padding-left: 1rem;
           margin-left: 0;
           margin-right: 0;
           font-style: italic;
           color: var(--color-muted-foreground);
        }
      `}</style>
      <div className="max-h-[500px] overflow-y-auto">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
      
      {/* Sleek Toolbar pinned to the bottom */}
      <div className="p-2 border-t bg-muted/20 flex items-center gap-1 flex-wrap shrink-0">
        {/* Aa Text Styles */}
        <Popover open={isHeadingOpen} onOpenChange={setIsHeadingOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`p-1.5 rounded-md transition-colors flex items-center gap-0.5 text-xs font-semibold ${
                editor.isActive('heading') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Text Styles (Aa)"
            >
              <Type className="w-4 h-4" />
              <span className="text-[11px]">Aa</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1.5 space-y-0.5 z-[9999]" align="start">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setIsHeadingOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                !editor.isActive('heading') ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
              }`}
            >
              Normal Text
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setIsHeadingOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-sm font-bold rounded-md transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              }`}
            >
              Large Title (H1)
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setIsHeadingOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              }`}
            >
              Medium Title (H2)
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setIsHeadingOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              }`}
            >
              Small Title (H3)
            </button>
          </PopoverContent>
        </Popover>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('underline') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('strike') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        {/* Link Attachment */}
        <Popover open={isLinkOpen} onOpenChange={(open) => {
          setIsLinkOpen(open);
          if (open) {
            setLinkUrl(editor.getAttributes('link').href || '');
          }
        }}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('link') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Attach Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-2.5 z-[9999]" align="start">
            <p className="text-xs font-semibold text-foreground">Attach a Link</p>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSetLink();
                  }
                }}
                placeholder="https://example.com"
                className="flex-1 px-2.5 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSetLink}
                className="px-2.5 py-1.5 text-xs bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90"
              >
                Apply
              </button>
            </div>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setIsLinkOpen(false);
                  setLinkUrl('');
                }}
                className="text-[11px] text-destructive hover:underline flex items-center gap-1"
              >
                <Unlink className="w-3 h-3" /> Remove link
              </button>
            )}
          </PopoverContent>
        </Popover>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('blockquote') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('code') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('codeBlock') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Code Block"
        >
          <SquareTerminal className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        
        <button
          type="button"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = () => {
              if (input.files?.length) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  editor.chain().focus().setImage({ src: reader.result as string }).run();
                };
              }
            };
            input.click();
          }}
          className="p-1.5 rounded-md transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertContent('@').run()}
          className="p-1.5 rounded-md transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Mention someone (@)"
        >
          <AtSign className="w-4 h-4" />
        </button>

        {onToggleTags && (
          <button
            type="button"
            onClick={onToggleTags}
            className={`relative p-1.5 rounded-md transition-all ${
              isTagsOpen
                ? 'bg-primary text-primary-foreground shadow-sm'
                : selectedTagsCount > 0
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={isTagsOpen ? "Hide Tags & Badges" : "Tags & Badges (#)"}
          >
            <Tag className="w-4 h-4" />
            {selectedTagsCount > 0 && !isTagsOpen && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground rounded-full px-0.5 shadow-sm">
                {selectedTagsCount}
              </span>
            )}
          </button>
        )}

        <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`p-1.5 rounded-md transition-colors ${
                isEmojiOpen
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Insert Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0 shadow-none bg-transparent" align="start" sideOffset={6}>
            <EmojiPicker
              onSelectEmoji={insertEmoji}
              onClose={() => setIsEmojiOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
