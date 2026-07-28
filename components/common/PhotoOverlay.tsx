"use client";

import Image from "next/image";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,28rem)] border-0 bg-black/90 p-0 text-white shadow-2xl">
        <DialogTitle className="sr-only">
          {name ? `${name} profile photo` : "Profile photo"}
        </DialogTitle>
        <div className="relative overflow-hidden rounded-xl">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-medium">
            {name || "Profile photo"}
          </div>
          <div className="relative flex min-h-80 items-center justify-center bg-black/70 p-3">
            {src ? (
              <Image
                src={src}
                alt={name ? `${name} profile photo` : "Profile photo"}
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
