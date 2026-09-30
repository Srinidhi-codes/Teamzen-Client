"use client";

import { useState } from "react";
import {
  Megaphone,
  X,
  Bell,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserRound,
  ArrowUpRight,
  Notebook,
  NotebookPenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  targetDepartment?: string;
  actor?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    designation?: string;
  } | null;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  announcement?: AnnouncementItem | null;
  announcements?: AnnouncementItem[];
  onClose: () => void;
  isPreview?: boolean;
}

export function AnnouncementModal({
  isOpen,
  announcement,
  announcements,
  onClose,
  isPreview = false,
}: AnnouncementModalProps) {
  const router = useRouter();
  const [markRead] = useMutation(MARK_NOTIFICATION_READ);

  const [isZoomed, setIsZoomed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = announcements?.length
    ? announcements
    : announcement
      ? [announcement]
      : [];

  const currentAnnouncement = items[currentIndex];

  if (!isOpen || !currentAnnouncement) return null;

  const actorName = currentAnnouncement.actor?.firstName
    ? `${currentAnnouncement.actor.firstName} ${
        currentAnnouncement.actor.lastName || ""
      }`.trim()
    : "Company Leadership";

  let parsedMessage: any = null;

  try {
    parsedMessage = JSON.parse(currentAnnouncement.message);
  } catch {
    // Legacy announcement format
  }

  const title = parsedMessage?.title || "Company Announcement";
  const body = parsedMessage?.body || currentAnnouncement.message;
  const footer = parsedMessage?.footer || null;

  const targetBadge =
    parsedMessage?.department ||
    currentAnnouncement.targetDepartment ||
    "Company Wide";

  const designation =
    currentAnnouncement.actor?.designation || "Admin";

  const hasMultiple = items.length > 1;
  const isLast = currentIndex === items.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleAcknowledge = async () => {
    if (!isPreview && currentAnnouncement.id) {
      try {
        localStorage.setItem(
          `teamzen_seen_announcement_${currentAnnouncement.id}`,
          "true"
        );

        await markRead({
          variables: {
            id: currentAnnouncement.id,
          },
        });
      } catch {
        // Ignore read-state errors
      }
    }

    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();

      setTimeout(() => {
        setCurrentIndex(0);
      }, 300);
    }
  };

  const handleViewAll = () => {
    onClose();

    setTimeout(() => {
      setCurrentIndex(0);
    }, 300);

    router.push("/notifications");
  };

  const handleClose = () => {
    onClose();

    setTimeout(() => {
      setCurrentIndex(0);
    }, 300);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent
          className={cn(
            "w-[calc(100%-32px)] sm:max-w-2xl",
            "fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bottom-auto right-auto",
            "max-h-[72dvh] sm:max-h-[85dvh]",
            "flex flex-col",
            "p-0 overflow-hidden",
            "border border-border/70",
            "bg-background",
            "shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
            "rounded-2xl",
            "gap-0"
          )}
        >
          <DialogTitle className="sr-only">
            {title}
          </DialogTitle>

          <DialogDescription className="sr-only">
            Official company announcement broadcast
          </DialogDescription>

          {/* =========================================================
              HEADER
          ========================================================= */}
          <div className="relative shrink-0 px-6 pt-6 pb-5 sm:px-7 sm:pt-7">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                      {title}
                    </h2>

                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                      {targetBadge}
                    </span>

                    {isPreview && (
                      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        Preview
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-2 flex flex-col items-start gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground/80">
                        {actorName}
                      </span>
                      <span>·</span>
                      <span>{designation}</span>
                    </span>

                    {currentAnnouncement.createdAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {moment(currentAnnouncement.createdAt).format(
                          "MMM DD, YYYY · h:mm A"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel indicator */}
            {hasMultiple && (
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Announcement {currentIndex + 1} of {items.length}
                </span>

                <div className="flex items-center gap-1.5">
                  {items.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Go to announcement ${index + 1}`}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        index === currentIndex
                          ? "w-6 bg-primary"
                          : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-border/60" />

          {/* =========================================================
              BODY
          ========================================================= */}
          <div className="relative flex-1 overflow-y-auto min-h-0">
            {/* Navigation */}
            {hasMultiple && currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous announcement"
                className={cn(
                  "absolute left-1.5 sm:left-3 top-1/2 z-20 -translate-y-1/2",
                  "flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center",
                  "rounded-full border border-border",
                  "bg-background/90 backdrop-blur",
                  "shadow-sm",
                  "text-muted-foreground",
                  "hover:text-foreground hover:bg-muted",
                  "transition-all"
                )}
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}

            {hasMultiple && !isLast && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next announcement"
                className={cn(
                  "absolute right-1.5 sm:right-3 top-1/2 z-20 -translate-y-1/2",
                  "flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center",
                  "rounded-full border border-border",
                  "bg-background/90 backdrop-blur",
                  "shadow-sm",
                  "text-muted-foreground",
                  "hover:text-foreground hover:bg-muted",
                  "transition-all"
                )}
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}

            <div className="px-10 py-5 sm:px-14 sm:py-7">
              {/* Main message */}
              <p className="text-[14px] sm:text-[15px] leading-6 sm:leading-7 text-foreground/90 whitespace-pre-wrap">
                {body}
              </p>

              {/* Footer / support callout */}
              {footer && (
                <div
                  className={cn(
                    "mt-6 rounded-xl",
                    "border border-primary/15",
                    "bg-primary/4.5",
                    "px-4 py-3.5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="mt-0.5 shrink-0">
                      <NotebookPenIcon className="h-4 w-4 text-primary" />
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {footer}
                    </p>
                  </div>
                </div>
              )}

              {/* Image */}
              {currentAnnouncement.imageUrl && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className={cn(
                    "group relative mt-6 block w-full overflow-hidden",
                    "rounded-xl border border-border/70",
                    "bg-muted/30",
                    "text-left",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40"
                  )}
                >
                  <img
                    src={currentAnnouncement.imageUrl}
                    alt="Announcement"
                    className={cn(
                      "block w-full h-auto",
                      "max-h-[330px]",
                      "object-cover",
                      "transition-transform duration-500",
                      "group-hover:scale-[1.015]"
                    )}
                  />

                  {/* Image overlay */}
                  <div
                    className={cn(
                      "absolute inset-0",
                      "flex items-center justify-center",
                      "bg-black/0 group-hover:bg-black/35",
                      "transition-all duration-300"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        "rounded-full px-3.5 py-2",
                        "bg-black/70 text-white",
                        "text-xs font-medium",
                        "opacity-0 group-hover:opacity-100",
                        "translate-y-1 group-hover:translate-y-0",
                        "transition-all duration-300"
                      )}
                    >
                      <ZoomIn className="h-4 w-4" />
                      View image
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* =========================================================
              FOOTER
          ========================================================= */}
          <div
            className={cn(
              "flex shrink-0 flex-col-reverse sm:flex-row",
              "items-center justify-between gap-3",
              "px-6 py-4 sm:px-7",
              "bg-muted/20"
            )}
          >
            {!isPreview ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleViewAll}
                className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
              >
                <Bell className="mr-2 h-3.5 w-3.5" />
                All Notifications
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-60" />
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Preview mode
              </span>
            )}

            <Button
              type="button"
              onClick={handleAcknowledge}
              className={cn(
                "w-full sm:w-auto",
                "h-10 px-5",
                "rounded-lg",
                "font-medium text-sm",
                "shadow-sm",
                "transition-all",
                "active:scale-[0.98]"
              )}
            >
              {isLast ? "Acknowledge" : "Acknowledge & Next"}

              {!isLast && (
                <ChevronRight className="ml-1.5 h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          IMAGE LIGHTBOX
      ========================================================= */}
      {currentAnnouncement.imageUrl && (
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent
            className={cn(
              "max-w-[95vw] sm:max-w-5xl w-[95vw]",
              "p-2",
              "border-zinc-800",
              "bg-black/95",
              "text-white",
              "rounded-2xl",
              "max-h-[88dvh]",
              "fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bottom-auto"
            )}
          >
            <DialogTitle className="sr-only">
              Expanded Announcement Image
            </DialogTitle>

            <DialogDescription className="sr-only">
              Full-size announcement image
            </DialogDescription>

            <div className="relative flex min-h-[50vh] items-center justify-center">
              <img
                src={currentAnnouncement.imageUrl}
                alt="Expanded Announcement"
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />

              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                aria-label="Close image preview"
                className={cn(
                  "absolute right-3 top-3",
                  "flex h-9 w-9 items-center justify-center",
                  "rounded-full",
                  "bg-white/10 text-white",
                  "hover:bg-white/20",
                  "transition-colors"
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

