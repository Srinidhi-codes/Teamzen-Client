"use client";

import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { FeedLayout } from '@/components/feed/FeedLayout';
export default function FeedPage() {
  return (
    <div className="w-full space-y-8 animate-fade-in pb-20">
      <PageHeader 
        title="Company Feed" 
        eyebrow="Community"
        description="Stay updated with the latest announcements, milestones, and team updates."
      />
      <div>
        <FeedLayout />
      </div>
    </div>
  );
}
