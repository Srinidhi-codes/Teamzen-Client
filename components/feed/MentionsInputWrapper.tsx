'use client';

import React from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const defaultMentionStyle = {
  control: {
    backgroundColor: 'transparent',
    fontSize: 14,
    fontWeight: 'normal',
  },
  '&multiLine': {
    control: {
      fontFamily: 'inherit',
    },
    highlighter: {
      padding: 0,
      margin: 0,
      border: 'none',
      boxSizing: 'border-box',
      lineHeight: '1.5',
    },
    input: {
      padding: 0,
      margin: 0,
      border: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      lineHeight: '1.5',
    },
  },
  '&singleLine': {
    display: 'inline-block',
    width: 180,
    highlighter: {
      padding: 1,
      border: '2px inset transparent',
    },
    input: {
      padding: 1,
      border: '2px inset',
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'var(--popover)',
      color: 'var(--popover-foreground)',
      border: '1px solid var(--border)',
      fontSize: 14,
      borderRadius: '8px',
      overflow: 'auto',
      maxHeight: '200px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    },
    item: {
      padding: '8px 12px',
      borderBottom: '1px solid var(--border)',
      '&focused': {
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-foreground)',
      },
    },
  },
};

const renderSuggestion = (suggestion: any) => (
  <div className="flex items-center gap-3">
    <Avatar className="h-8 w-8">
      <AvatarImage src={suggestion.avatar} className="object-cover" />
      <AvatarFallback>{suggestion.display[0]}</AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="text-sm font-medium">{suggestion.display}</span>
      {suggestion.email && (
        <span className="text-xs text-muted-foreground">{suggestion.email}</span>
      )}
    </div>
  </div>
);

export default function MentionsInputWrapper({ value, onChange, placeholder, className, fetchMentions }: any) {
  return (
    <>
      <style jsx global>{`
        .mentions-wrapper textarea,
        .mentions-wrapper .react-mentions__highlighter {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1.5 !important;
          font-family: inherit !important;
          font-size: 14px !important;
          letter-spacing: normal !important;
          box-sizing: border-box !important;
          border: none !important;
        }
      `}</style>
      <MentionsInput
        value={value || ''}
        onChange={onChange}
        style={defaultMentionStyle}
        placeholder={placeholder}
        className={`mentions-wrapper ${className}`}
        allowSuggestionsAboveCursor
      >
        <Mention
          trigger="@"
          data={fetchMentions}
          markup="@[__display__](__id__)"
          appendSpaceOnAdd={true}
          renderSuggestion={renderSuggestion}
          displayTransform={(id: string, display: string) => `@${display}`}
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.25)', borderRadius: '4px', color: 'transparent' }}
        />
      </MentionsInput>
    </>
  );
}
