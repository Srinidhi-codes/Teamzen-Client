"use client";

import { useState } from "react";
import { Megaphone, X, CheckCircle2, Bell, ExternalLink, Calendar, UserCheck, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation } from "@apollo/client/react";
import { MARK_NOTIFICATION_READ } from "@/lib/graphql/notifications/mutations";
import { useRouter } from "next/navigation";
import moment from "moment";
import { cn } from "@/lib/utils";

export interface AnnouncementItem {
  id?: string;
  message: string;
  imageUrl?: string | null;
  createdAt?: string;
  actor?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  } | null;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  announcement: AnnouncementItem | null;
  onClose: () => void;
  isPreview?: boolean;
}

export function AnnouncementModal({
  isOpen,
  announcement,
  onClose,
  isPreview = false,
}: AnnouncementModalProps) {
  const router = useRouter();
  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !announcement) return null;

  const actorName = announcement.actor?.firstName
    ? `${announcement.actor.firstName} ${announcement.actor.lastName || ""}`.trim()
    : "Company Leadership";

  const handleAcknowledge = async () => {
    if (!isPreview && announcement.id) {
      try {
        localStorage.setItem(`teamzen_seen_announcement_${announcement.id}`, "true");
        await markRead({ variables: { id: announcement.id } });
      } catch {
        // ignore
      }
    }
    onClose();
  };

  const handleViewAll = () => {
    onClose();
    router.push("/notifications");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border/80 bg-card rounded-2xl shadow-2xl gap-0">
          <DialogTitle className="sr-only">Company Announcement</DialogTitle>
          <DialogDescription className="sr-only">
            Official company announcement broadcast
          </DialogDescription>

          {/* Decorative Header Banner */}
          <div className="relative border-b border-border/60 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/25">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Company Announcement
                  </h3>
                    {isPreview && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Live Preview
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
            {/* Announcement Image Preview */}
            {announcement.imageUrl && (
              <div
                onClick={() => setIsZoomed(true)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-xs max-h-72 flex items-center justify-center"
              >
                <img
                  src={announcement.imageUrl}
                  alt="Announcement"
                  className="w-full h-auto object-cover max-h-72 transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium backdrop-blur-xs">
                  <ZoomIn className="w-4 h-4" />
                  <span>Click to expand</span>
                </div>
              </div>
            )}

            {/* Formatted Message */}
            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 sm:p-5">
              <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap font-normal">
                {announcement.message}
              </p>
            </div>

            {/* Author & Timestamp Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                  {actorName.charAt(0)}
                </div>
                <span>
                  Sent by <strong className="text-foreground font-semibold">{actorName}</strong>
                </span>
              </div>

              {announcement.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{moment(announcement.createdAt).format("MMM DD, YYYY · h:mm A")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 sm:px-6 bg-muted/20 border-t border-border/60 flex items-center justify-between gap-3">
            {!isPreview ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAll}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>All Notifications</span>
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground">Preview mode</div>
            )}

            <Button
              onClick={handleAcknowledge}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledge</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox / Zoom Dialog */}
      {announcement.imageUrl && (
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-4xl p-2 bg-black/90 border-zinc-800 text-white">
            <DialogTitle className="sr-only">Expanded Announcement Image</DialogTitle>
            <div className="relative flex items-center justify-center min-h-[50vh]">
              <img
                src={announcement.imageUrl}
                alt="Expanded Announcement"
                className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
              />
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
