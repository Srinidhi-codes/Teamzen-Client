"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PhotoOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src?: string | null;
  name?: string;
}

export function PhotoOverlay({
  open,
  onOpenChange,
  src,
  name,
}: PhotoOverlayProps) {
  const title = name || "Photo preview";

  const openExternal = () => {
    if (!src) return;
    window.open(src, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,28rem)] border-0 bg-black/90 p-0 text-white shadow-2xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 pr-12">
            <p className="truncate text-sm font-medium">{title}</p>
            {src && (
              <button
                type="button"
                onClick={openExternal}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/20"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </button>
            )}
          </div>
          <div className="relative flex min-h-80 items-center justify-center bg-black/70 p-3">
            {src ? (
              <Image
                src={src}
                alt={title}
                width={800}
                height={800}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                unoptimized
              />
            ) : (
              <p className="text-sm text-white/80">No photo available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
