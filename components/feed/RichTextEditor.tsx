'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, SquareTerminal, Smile, Image as ImageIcon, AtSign } from 'lucide-react';
import tippy from 'tippy.js';
import { MentionList } from './MentionList';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  fetchMentions?: any;
}

const QUICK_EMOJIS = ['👍', '🎉', '🚀', '❤️', '👏', '🔥', '✨', '💡', '🙌', '🎯', '📢', '😊'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  minHeight = '44px',
  className = '',
  fetchMentions,
}) => {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-border/50 shadow-sm max-h-[500px] object-contain w-auto h-auto',
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
      <div className="max-h-[300px] overflow-y-auto">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
      
      {/* Sleek Toolbar pinned to the bottom */}
      <div className="p-2 border-t bg-muted/20 flex items-center gap-1 flex-wrap shrink-0">
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
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive('strike') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
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
          title="Mention someone"
        >
          <AtSign className="w-4 h-4" />
        </button>

        <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-md transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Insert Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-2" align="start">
            <div className="grid grid-cols-6 gap-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="p-2 text-xl hover:bg-muted rounded-md transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
