'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Pre-process mentions format: @[Name](id) -> **@Name** so markdown can render as styled mentions
  const processedContent = content.replace(
    /@\[([^\]]+)\]\(([^)]+)\)/g,
    '**@$1**'
  );

  return (
    <div className={`rich-post-content prose dark:prose-invert prose-sm max-w-none break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-3 mb-2 text-foreground" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-2.5 mb-1.5 text-foreground" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-2 mb-1 text-foreground" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed whitespace-pre-wrap text-foreground/90 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-5 mb-2 space-y-0.5" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside pl-5 mb-2 space-y-0.5" {...props} />,
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary/50 bg-primary/5 dark:bg-primary/10 pl-3.5 py-1 my-2 rounded-r italic text-muted-foreground" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !props['data-inline'] && !String(children).includes('\n');
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary font-medium" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-muted/80 dark:bg-muted/40 p-3 rounded-lg overflow-x-auto text-xs font-mono my-2 border border-border">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
              {...props}
            >
              {children}
            </a>
          ),
          strong: ({ node, children, ...props }) => {
            const text = String(children);
            if (text.startsWith('@')) {
              return (
                <span className="text-primary font-semibold hover:underline cursor-pointer bg-primary/10 px-1 py-0.5 rounded inline-block text-xs mx-0.5">
                  {children}
                </span>
              );
            }
            return <strong className="font-bold text-foreground" {...props}>{children}</strong>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
