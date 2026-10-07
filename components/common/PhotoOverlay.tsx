"use client";

import Image from "next/image";
import { ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="fixed !top-0 !left-0 !translate-x-0 !translate-y-0 w-screen max-w-[100vw] sm:max-w-[100vw] h-screen max-h-[100dvh] sm:max-h-[100dvh] overflow-hidden rounded-none border-0 bg-black/95 p-0 text-white shadow-none sm:rounded-none !max-w-full !w-screen !h-screen !max-h-screen">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col h-full w-full relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 shrink-0 z-50 relative bg-black/50">
            <p className="truncate text-sm font-medium">{title}</p>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {src ? (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={8}
                centerOnInit
                wheel={{ step: 0.1, disabled: true }}
                pinch={{ step: 5 }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent wrapperClass="!w-full !h-full flex items-center justify-center" contentClass="!w-full !h-full flex items-center justify-center p-4">
                      <Image
                        src={src}
                        alt={title}
                        width={1920}
                        height={1080}
                        className="max-h-full max-w-full w-auto h-auto object-contain cursor-grab active:cursor-grabbing"
                        unoptimized
                        draggable={false}
                      />
                    </TransformComponent>
                    
                    {/* Zoom Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 shadow-xl">
                      <button 
                        onClick={() => zoomOut()}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <div className="w-px h-5 bg-white/20 mx-1" />
                      <button 
                        onClick={() => zoomIn()}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <div className="w-px h-5 bg-white/20 mx-1" />
                      <button 
                        onClick={() => resetTransform()}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                        title="Reset Zoom"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </TransformWrapper>
            ) : (
              <p className="text-sm text-white/80">No photo available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
