'use client';

import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link2, 
  Smile, 
  Eye, 
  PenLine 
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RichContentRenderer } from './RichContentRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

const QUICK_EMOJIS = ['👍', '🎉', '🚀', '❤️', '👏', '🔥', '✨', '💡', '🙌', '🎯', '📢', '😊'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  minHeight = '110px',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const textToInsert = selectedText || defaultPlaceholder;
    const replacement = `${prefix}${textToInsert}${suffix}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
      }
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lastNewline = value.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyFormat('**', '**', 'bold text');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyFormat('*', '*', 'italic text');
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        applyFormat('[', '](https://)', 'link title');
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    applyFormat(emoji, '', '');
    setIsEmojiOpen(false);
  };

  return (
    <div className={`rich-text-editor rounded-xl border border-border/80 bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/50 transition-all ${className}`}>
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-2 py-1.5 gap-2 flex-wrap text-muted-foreground">
        {/* Formatting Actions (Only visible in 'write' mode) */}
        {activeTab === 'write' ? (
          <div className="flex items-center gap-0.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyFormat('**', '**', 'bold text')}
              title="Bold (Ctrl+B)"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*', 'italic text')}
              title="Italic (Ctrl+I)"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('~~', '~~', 'strikethrough')}
              title="Strikethrough"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <span className="w-px h-4 bg-border/80 mx-1" />
            <button
              type="button"
              onClick={() => applyLinePrefix('### ')}
              title="Heading 3"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('- ')}
              title="Bulleted List"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('1. ')}
              title="Numbered List"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('> ')}
              title="Quote"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('`', '`', 'code')}
              title="Inline Code"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('[', '](https://)', 'link title')}
              title="Link (Ctrl+K)"
              className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <Link2 className="w-4 h-4" />
            </button>

            {/* Quick Emoji Picker */}
            <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Insert Emoji"
                  className="p-1.5 hover:bg-muted hover:text-foreground rounded-md transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 shadow-lg" align="start">
                <div className="grid grid-cols-6 gap-1 text-center">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-1.5 text-base hover:bg-muted rounded-md transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-medium px-2 py-0.5">
            Rendered Preview
          </div>
        )}

        {/* Edit / Preview Tabs Switcher */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40 ml-auto">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'write'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full resize-none border-0 focus:outline-none p-3 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 leading-relaxed font-sans"
        />
      ) : (
        <div 
          style={{ minHeight }} 
          className="p-3.5 overflow-y-auto bg-muted/10 border-t-0"
        >
          {value.trim() ? (
            <RichContentRenderer content={value} />
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Nothing to preview yet. Type something in the Write tab to see it formatted here.
            </p>
          )}
        </div>
      )}

      {/* Footer hint */}
      <div className="flex items-center justify-between px-3 py-1 bg-muted/20 border-t border-border/40 text-[11px] text-muted-foreground/70">
        <span>Styling supported: **bold**, *italic*, # headings, - lists, `code`, &gt; quotes</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};
