'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import tippy from 'tippy.js';
import { MentionList } from './MentionList';

export default function MentionsInputWrapper({ value, onChange, placeholder, className, fetchMentions }: any) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
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

                if (!props.clientRect) {
                  return;
                }

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
                if (!props.clientRect) {
                  return;
                }
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
      onChange({ target: { value: editor.getHTML() } });
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert focus:outline-none min-h-[40px] max-h-[300px] overflow-y-auto ${className || ''}`,
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

  return (
    <div className="tiptap-wrapper w-full h-full relative">
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
           margin: 0;
        }
      `}</style>
      <EditorContent editor={editor} className="w-full h-full" />
    </div>
  );
}
