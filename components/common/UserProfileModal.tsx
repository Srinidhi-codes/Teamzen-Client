"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserDetails } from '@/lib/api/hooks';
import { Loader2, Mail, Phone, MapPin, Briefcase, Building2 } from 'lucide-react';
import { resolveAvatarUrl } from '@/lib/utils';

interface UserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const BARCODE_BARS = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 4, 1, 2, 1, 3, 2, 4, 1, 3, 2, 1, 3, 2, 4, 1];

export function UserProfileModal({ userId, open, onOpenChange, initialData }: UserProfileModalProps) {
  const { data: userDetails, isLoading } = useUserDetails(userId || undefined);
  const user = userDetails || initialData;

  const rawPic =
    user?.profile_picture ||
    user?.profilePictureUrl ||
    user?.profile_picture_url ||
    user?.profilePicture?.url ||
    user?.avatar ||
    user?.avatar_url;
  const avatarUrl = resolveAvatarUrl(rawPic);

  const firstName = user?.firstName || user?.first_name || (user?.name ? user.name.split(' ')[0] : '');
  const lastName = user?.lastName || user?.last_name || (user?.name ? user.name.split(' ').slice(1).join(' ') : '');
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || user?.username || 'Team Member';

  const roleOrDesignation =
    user?.designation?.name ||
    user?.designation_name ||
    (typeof user?.designation === 'string' ? user.designation : null) ||
    user?.role ||
    'Employee';

  const departmentName =
    user?.department?.name ||
    user?.department_name ||
    (typeof user?.department === 'string' ? user.department : null);

  const orgName =
    user?.organization_name ||
    user?.organization?.name;

  const locationName =
    user?.office_location_details?.name ||
    user?.location;

  const email = user?.email;
  const phone = user?.phone_number || user?.phoneNumber;

  const metaDetails = [
    roleOrDesignation !== 'Employee' ? roleOrDesignation : null,
    departmentName,
    locationName
  ].filter(Boolean).join(' • ');

  const initial = (firstName?.[0] || displayName?.[0] || '?').toUpperCase();
  const employeeId = user?.employee_id || (user?.id ? String(user.id).substring(0, 8) : 'STAFF');

  return (
    <Dialog open={open && !!(userId || user)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">User Profile - {displayName}</DialogTitle>
        {isLoading && !user ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : user ? (
          <div className="relative">
            {/* Lanyard Top Slot Element */}
            <div className="h-32 bg-gradient-to-br from-primary/90 via-primary to-primary/80 w-full relative flex items-center justify-center">
              {/* Lanyard punch clip hole */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-background/60 rounded-b-lg shadow-inner flex items-center justify-center">
                <div className="w-8 h-1 bg-background/90 rounded-full" />
              </div>

              {/* Organization badge watermark if exists */}
              {orgName && (
                <div className="absolute top-4 left-5 flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/90 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 opacity-80" />
                  <span>{orgName}</span>
                </div>
              )}

              {/* Avatar centered on the boundary */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-1 bg-card rounded-2xl shadow-xl ring-4 ring-background/20">
                <Avatar className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 border-border/40 bg-muted">
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={displayName}
                      className="object-cover w-full h-full"
                    />
                  )}
                  <AvatarFallback className="text-3xl sm:text-4xl font-bold rounded-xl bg-primary/10 text-primary uppercase">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Content */}
            <div className="pt-20 pb-7 px-6 sm:px-8 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {displayName}
              </h2>
              <p className="text-primary font-medium mt-1 flex items-center justify-center gap-1.5 capitalize text-sm">
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>{roleOrDesignation}</span>
              </p>

              {/* Details List */}
              <div className="mt-6 flex flex-col text-sm text-left divide-y divide-border/60 border-t border-b border-border/60">
                {email && (
                  <div className="flex items-center gap-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground">
                    <Mail className="w-4 h-4 shrink-0 text-primary/70" />
                    <a href={`mailto:${email}`} className="truncate hover:underline">
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground">
                    <Phone className="w-4 h-4 shrink-0 text-primary/70" />
                    <a href={`tel:${phone}`} className="truncate hover:underline">
                      {phone}
                    </a>
                  </div>
                )}
                {metaDetails && (
                  <div className="flex items-center gap-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground">
                    <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                    <span className="truncate">{metaDetails}</span>
                  </div>
                )}
              </div>

              {/* Barcode/Footer */}
              <div className="mt-6 pt-4 border-t border-border/40 flex justify-center">
                <div className="flex gap-1 h-7 opacity-40">
                  {BARCODE_BARS.map((width, i) => (
                    <div
                      key={i}
                      className="bg-foreground rounded-xs"
                      style={{
                        width: `${width}px`,
                        opacity: (i % 2 === 0) ? 0.9 : 0.6
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5 font-mono">
                ID: {employeeId}
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
