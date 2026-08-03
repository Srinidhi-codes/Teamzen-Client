"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanFace, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  captureFrameImageData,
  canvasToJpegDataUrl,
  cosineSimilarity,
  extractDescriptorFromImageData,
  isFaceMatch,
  looksLikeFaceFrame,
} from "@/lib/face/descriptor";
import { FACE_MATCH_THRESHOLD } from "@/lib/face/constants";

type Mode = "enroll" | "verify";

interface FaceCaptureModalProps {
  open: boolean;
  mode: Mode;
  enrolledDescriptor?: number[] | null;
  title?: string;
  onClose: () => void;
  onSuccess: (result: {
    descriptor: number[];
    matchScore: number;
    verified: boolean;
    imageBase64: string;
  }) => void | Promise<void>;
}

export function FaceCaptureModal({
  open,
  mode,
  enrolledDescriptor,
  title,
  onClose,
  onSuccess,
}: FaceCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("Center your face in the circle");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("Camera permission denied or unavailable. Allow camera access and retry.");
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera]);

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      setError("Camera not ready yet.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const imageData = captureFrameImageData(video, canvas, { cropCenter: true });
      if (!looksLikeFaceFrame(imageData)) {
        setHint("Move closer and ensure your face is well lit");
        setError("No clear face detected. Adjust lighting and try again.");
        return;
      }
      const descriptor = extractDescriptorFromImageData(imageData);
      const imageBase64 = canvasToJpegDataUrl(canvas);

      if (mode === "verify") {
        if (!enrolledDescriptor?.length) {
          setError("No enrolled face found. Please enroll first.");
          return;
        }
        const matchScore = cosineSimilarity(descriptor, enrolledDescriptor);
        if (!isFaceMatch(matchScore)) {
          setError(
            `Face did not match (score ${matchScore.toFixed(2)}, need ≥ ${FACE_MATCH_THRESHOLD}). Try again.`
          );
          return;
        }
        await onSuccess({ descriptor, matchScore, verified: true, imageBase64 });
      } else {
        await onSuccess({
          descriptor,
          matchScore: 1,
          verified: true,
          imageBase64,
        });
      }
      stopCamera();
    } catch (e: any) {
      setError(e?.message || "Capture failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-md flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-lg sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ScanFace className="h-4 w-4 text-primary" />
            {title || (mode === "enroll" ? "Enroll your face" : "Verify face")}
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-full border-2 border-primary/40 bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className={cn("h-full w-full scale-x-[-1] object-cover")}
            />
            <div className="pointer-events-none absolute inset-4 rounded-full border border-white/40" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <p className="text-center text-xs text-muted-foreground">{hint}</p>
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="button" className="w-full gap-2 sm:w-auto" onClick={capture} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {mode === "enroll" ? "Capture & enroll" : "Verify & continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
