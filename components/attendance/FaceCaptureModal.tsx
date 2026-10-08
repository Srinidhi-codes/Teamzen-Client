"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  CheckCircle2,
  FlipHorizontal,
  Loader2,
  RefreshCw,
  ScanFace,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, isMobileDevice } from "@/lib/utils";
import {
  compressPhoto,
  captureJpegFromVideo,
  extractAndVerifyFace,
} from "@/lib/face/descriptor";

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
  title,
  onClose,
  onSuccess,
}: FaceCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [hint, setHint] = useState("Align your face and tap capture");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(isMobileDevice());
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Start instant 60fps video feed (NO TensorFlow, NO model downloads)
  const initCamera = useCallback(async (desiredFacing: "user" | "environment" = "user") => {
    stopCamera();
    setError(null);
    setCameraReady(false);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("Webcam stream is not supported on this browser. Use the device camera button below.");
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: desiredFacing,
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch {
        // Fallback without resolution constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: desiredFacing },
          audio: false,
        });
      }

      if (!stream) {
        throw new Error("Unable to access camera feed.");
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          setCameraReady(true);
        };
        try {
          await video.play();
          setCameraReady(true);
        } catch {
          setCameraReady(true);
        }
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (
        msg.includes("Permission") ||
        msg.includes("denied") ||
        msg.includes("NotAllowedError")
      ) {
        setError("Camera permission denied. Please allow camera access in browser settings or use the device camera button below.");
      } else {
        setError("Could not start live webcam. You can use your device's built-in camera below.");
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setVerifiedSuccess(false);
      setError(null);
      setBusy(false);
      return;
    }

    setVerifiedSuccess(false);
    setHint("Align your face and tap capture");

    // Check if on a mobile touchscreen device:
    const isMobile =
      typeof navigator !== "undefined" &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2));

    // If mobile, automatically prompt native built-in camera app
    if (isMobile && fileInputRef.current) {
      const timer = setTimeout(() => {
        try {
          fileInputRef.current?.click();
        } catch {
          // ignore
        }
      }, 150);
      void initCamera(facingMode);
      return () => clearTimeout(timer);
    }

    void initCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [open, initCamera, stopCamera, facingMode]);

  // Process a captured photo through backend AI engine
  const processPhoto = async (photoBase64: string) => {
    setBusy(true);
    setError(null);
    setHint("Verifying face with AI…");

    try {
      const result = await extractAndVerifyFace(photoBase64, {
        verify: mode === "verify",
        enroll: mode === "enroll",
      });

      setVerifiedSuccess(true);
      setHint(mode === "enroll" ? "Face enrolled successfully!" : "Face verified!");
      stopCamera();

      // Brief delay to show success checkmark
      setTimeout(() => {
        handleClose();
        void Promise.resolve(
          onSuccess({
            descriptor: result.descriptor,
            matchScore: result.matchScore ?? 1.0,
            verified: result.verified ?? true,
            imageBase64: result.imageBase64,
          })
        );
      }, 350);
    } catch (e: any) {
      setHint("Ensure good lighting and face camera directly");
      setError(e?.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Capture from live video stream
  const captureFromVideo = async () => {
    const video = videoRef.current;
    if (!video || !cameraReady || video.readyState < 2) {
      setError("Camera is still warming up. Please hold steady and try again.");
      return;
    }

    try {
      const photoBase64 = captureJpegFromVideo(video);
      if (!photoBase64) {
        setError("Could not capture frame. Please try again.");
        return;
      }
      await processPhoto(photoBase64);
    } catch (e: any) {
      setError(e?.message || "Capture error. Please try again.");
    }
  };

  // Handle photo from built-in device camera input
  const handleNativeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      setHint("Processing photo…");
      const compressed = await compressPhoto(file, 480, 0.82);
      await processPhoto(compressed);
    } catch (err: any) {
      setError(err?.message || "Failed to read camera photo.");
      setBusy(false);
    } finally {
      // Clear input so same file can be captured again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toggleFacingMode = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    void initCamera(next);
  };

  if (!open || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="face-capture-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Hidden native built-in camera input for mobile hardware shutter */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleNativeFile}
        className="hidden"
        aria-hidden="true"
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[92dvh] flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5 sm:py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ScanFace className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 id="face-capture-title" className="text-xs sm:text-sm font-semibold tracking-tight">
                {title || (mode === "enroll" ? "Enroll Your Face" : "Face Verification")}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
                {mode === "enroll"
                  ? "Take a clear selfie to register your biometric profile"
                  : "Quick selfie verification for attendance punch"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Viewfinder Content */}
        <div className="flex flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative aspect-4/3 w-full max-w-[280px] sm:max-w-sm max-h-[40vh] overflow-hidden rounded-2xl border-2 border-primary/20 bg-black shadow-inner">
            {/* Live Video Feed (60 FPS, Mirrored) */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
                facingMode === "user" ? "-scale-x-100" : "",
                cameraReady ? "opacity-100" : "opacity-0"
              )}
            />

            {/* Face Alignment Oval Guide */}
            {cameraReady && !verifiedSuccess && !busy && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-32 sm:h-52 sm:w-40 rounded-full border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] transition-all animate-pulse" />
              </div>
            )}

            {/* Camera Warming Up / Starting Overlay */}
            {!cameraReady && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 px-4 text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-xs font-medium">Opening camera…</p>
                <p className="text-[11px] text-white/60 mt-1">Ensure good lighting</p>
              </div>
            )}

            {/* Verifying with AI Overlay */}
            {busy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 px-4 text-center text-white backdrop-blur-xs animate-in fade-in duration-150">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-2.5" />
                <p className="text-sm font-semibold">Verifying Face…</p>
                <p className="text-[11px] text-white/70 mt-0.5">Matching with enrolled profile</p>
              </div>
            )}

            {/* Instant Verified Feedback Overlay */}
            {verifiedSuccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/90 px-4 text-center text-white backdrop-blur-xs animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-2 animate-bounce" />
                <p className="text-sm font-bold">Face Verified!</p>
                <p className="text-[11px] text-emerald-200/90 mt-0.5">Submitting attendance…</p>
              </div>
            )}

            {/* Flip Camera Button (if multiple cameras available) */}
            {cameraReady && !busy && (
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/75 transition-colors"
                title="Flip Camera"
              >
                <FlipHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status / Guidance Pill */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted/80 px-3 py-1 text-center text-xs font-medium text-muted-foreground border border-border/60">
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  verifiedSuccess ? "bg-emerald-400" : cameraReady ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  verifiedSuccess ? "bg-emerald-500" : cameraReady ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </span>
            <span>{hint}</span>
          </div>

          {/* Error Message with Quick Retry */}
          {error && (
            <div className="mt-3 w-full rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-xs text-destructive animate-in fade-in slide-in-from-top-1">
              <p className="font-medium">{error}</p>
              <div className="mt-2.5 flex items-center justify-center gap-2">
                {isMobile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/15"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Smartphone className="mr-1 h-3 w-3" /> Built-in Camera App
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/15"
                  onClick={() => initCamera(facingMode)}
                >
                  <RefreshCw className="mr-1 h-3 w-3" /> Retry Stream
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions — Big Shutter Button + Native Camera Option */}
        <div className="border-t border-border/80 bg-background/95 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-sm shrink-0">
          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
            {/* Built-in Device Camera Trigger (Native phone camera app only) */}
            {isMobile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-medium px-2.5 sm:px-3"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy || verifiedSuccess}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Native Camera</span>
              </Button>
            )}

            {/* Primary Shutter Button */}
            <Button
              type="button"
              className="flex-1 gap-2 h-10 sm:h-11 text-xs sm:text-sm font-semibold shadow-md shadow-primary/25"
              onClick={captureFromVideo}
              disabled={busy || !cameraReady || verifiedSuccess}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying…</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>{mode === "enroll" ? "Capture & Enroll" : "Snap & Punch"}</span>
                </>
              )}
            </Button>

            {/* Cancel Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs px-2 sm:px-3"
              onClick={handleClose}
              disabled={busy && verifiedSuccess}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
