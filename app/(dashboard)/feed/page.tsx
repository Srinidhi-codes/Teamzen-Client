"use client";

import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { FeedLayout } from '@/components/feed/FeedLayout';
import { Network } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Company Feed" 
          eyebrow="Community"
          description="Stay updated with the latest announcements, milestones, and team updates."
          actions={
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          }
        />
        
        <div className="mt-8">
          <FeedLayout />
        </div>
      </div>
    </div>
  );
}
