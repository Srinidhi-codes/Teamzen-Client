"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserDetails } from '@/lib/api/hooks';
import { Loader2, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';

interface UserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileModal({ userId, open, onOpenChange }: UserProfileModalProps) {
  const { data: user, isLoading } = useUserDetails(userId || undefined);

  return (
    <Dialog open={open && !!userId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-none shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">User Profile</DialogTitle>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : user ? (
          <div className="relative">
            {/* Lanyard/Header Design Element */}
            <div className="h-32 bg-gradient-to-br from-primary/80 to-primary w-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-background/50 rounded-b-lg shadow-sm" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-background/80 rounded-full" />
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-1.5 bg-card rounded-2xl shadow-lg">
                <Avatar className="w-32 h-32 rounded-xl border-4 border-card">
                  <AvatarImage src={user.profilePictureUrl || user.profile_picture_url} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold rounded-xl bg-primary/10 text-primary uppercase">
                    {user.firstName?.[0] || user.first_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Content */}
            <div className="pt-20 pb-8 px-8 text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {user.firstName || user.first_name} {user.lastName || user.last_name}
              </h2>
              <p className="text-primary font-medium mt-1 flex items-center justify-center gap-1.5 capitalize">
                <Briefcase className="w-4 h-4" />
                {user.role || 'Employee'}
              </p>
              
              <div className="mt-8 flex flex-col text-sm text-left divide-y divide-gray-200 dark:divide-gray-800 border-t border-b border-gray-200 dark:border-gray-800">
                {(user.email) && (
                  <div className="flex items-center gap-3 py-3 text-muted-foreground transition-colors hover:text-foreground">
                    <Mail className="w-4 h-4 shrink-0 text-primary/70" />
                    <a href={`mailto:${user.email}`} className="truncate hover:underline">
                      {user.email}
                    </a>
                  </div>
                )}
                {(user.phone_number || user.phoneNumber) && (
                  <div className="flex items-center gap-3 py-3 text-muted-foreground transition-colors hover:text-foreground">
                    <Phone className="w-4 h-4 shrink-0 text-primary/70" />
                    <span>{user.phone_number || user.phoneNumber}</span>
                  </div>
                )}
                {(user.designation_name || user.designation || user.department_name || user.department || user.location) && (
                  <div className="flex items-center gap-3 py-3 text-muted-foreground transition-colors hover:text-foreground">
                    <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                    <span>
                      {[
                        user.designation_name || user.designation,
                        user.department_name || user.department,
                        user.location
                      ].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Barcode/Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-center">
                <div className="flex gap-1 h-8 opacity-40">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-foreground"
                      style={{ 
                        width: `${Math.random() * 3 + 1}px`,
                        opacity: Math.random() * 0.5 + 0.5
                      }} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-mono">
                ID: {user.id ? String(user.id).substring(0, 8) : 'STAFF'}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <p>User not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
