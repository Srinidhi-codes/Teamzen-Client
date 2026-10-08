"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  FlipHorizontal,
  Loader2,
  RefreshCw,
  ScanFace,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
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

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [hint, setHint] = useState("Align your face and tap capture");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Start instant 60fps video feed
  const initCamera = useCallback(async (desiredFacing: "user" | "environment" = "user") => {
    stopCamera();
    setError(null);
    setCameraReady(false);

    if (typeof navigator === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setError("Webcam stream is not supported on this browser or connection (HTTPS required).");
      return;
    }

    // Proactively check connected devices if mediaDevices.enumerateDevices is available
    if (navigator?.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        if (devices.length > 0 && videoInputs.length === 0) {
          setError("No camera device detected. Please connect a webcam or enable your camera.");
          return;
        }
      } catch {
        // Enumerate error, proceed to getUserMedia test
      }
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
      const errName = e?.name || "";
      const errMsg = String(e?.message || "");

      if (
        errName === "NotFoundError" ||
        errName === "DevicesNotFoundError" ||
        errMsg.toLowerCase().includes("not found") ||
        errMsg.toLowerCase().includes("no device") ||
        errMsg.toLowerCase().includes("device not found")
      ) {
        setError("No camera device detected. Please connect a webcam or enable your camera.");
      } else if (
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError" ||
        errMsg.toLowerCase().includes("permission") ||
        errMsg.toLowerCase().includes("denied")
      ) {
        setError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (
        errName === "NotReadableError" ||
        errName === "TrackStartError"
      ) {
        setError("Camera is currently in use by another application or could not be started.");
      } else if (errName === "OverconstrainedError") {
        setError("Requested camera resolution not supported. Please retry.");
      } else {
        setError(errMsg || "Could not access camera. Please check your camera settings and retry.");
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
                  : "Live camera verification for attendance punch"}
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
            {/* Live Video Feed (Mirrored for user camera) */}
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
                <p className="text-[11px] text-white/60 mt-1">Ensure camera access is granted</p>
              </div>
            )}

            {/* Error Overlay in Viewfinder */}
            {error && !cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 px-4 text-center text-white animate-in fade-in duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive mb-2">
                  <CameraOff className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-destructive">Camera Unavailable</p>
                <p className="text-[11px] text-white/80 max-w-[220px] mt-1 line-clamp-3">
                  {error}
                </p>
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
                  verifiedSuccess ? "bg-emerald-400" : error ? "bg-destructive" : cameraReady ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  verifiedSuccess ? "bg-emerald-500" : error ? "bg-destructive" : cameraReady ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </span>
            <span>{error ? "Camera error" : hint}</span>
          </div>

          {/* Error Message with Quick Retry */}
          {error && (
            <div className="mt-3 w-full rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-xs text-destructive animate-in fade-in slide-in-from-top-1">
              <p className="font-medium">{error}</p>
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/15"
                  onClick={() => initCamera(facingMode)}
                >
                  <RefreshCw className="mr-1.5 h-3 w-3" /> Retry Camera
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions — Shutter Button + Cancel */}
        <div className="border-t border-border/80 bg-background/95 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-sm shrink-0">
          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
            {/* Primary Shutter Button */}
            <Button
              type="button"
              className="flex-1 gap-2 h-10 sm:h-11 text-xs sm:text-sm font-semibold shadow-md shadow-primary/25"
              onClick={captureFromVideo}
              disabled={busy || !cameraReady || !!error || verifiedSuccess}
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
              className="text-xs px-3 sm:px-4"
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
