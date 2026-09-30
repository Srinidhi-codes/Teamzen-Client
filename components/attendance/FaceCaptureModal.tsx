"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, RefreshCw, ScanFace, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  captureJpegFromVideo,
  distanceToSimilarity,
  euclideanDistance,
  extractFaceDescriptor,
  isFaceMatch,
  loadFaceModels,
  FACE_DISTANCE_THRESHOLD,
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
  const [modelsLoading, setModelsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [hint, setHint] = useState("Center your face in the circle");

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

  const initCamera = useCallback(async () => {
    stopCamera();
    setError(null);
    setCameraReady(false);
    setModelsLoading(true);

    try {
      // Step 1: Load face models
      await loadFaceModels();
      setModelsLoading(false);

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported or not allowed on this browser. Ensure HTTPS is used."
        );
      }

      // Step 2: Acquire camera stream with mobile PWA fallbacks
      let stream: MediaStream | null = null;
      try {
        // Ideal for mobile front camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });
      } catch {
        try {
          // Fallback without resolution constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        } catch {
          // Final fallback
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!stream) {
        throw new Error("Unable to initialize camera video feed.");
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
          // Autoplay on iOS / mobile may wait for play event
          setCameraReady(true);
        }
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("face") || msg.includes("model")) {
        setError("Biometric models could not be loaded. Please check your network and retry.");
      } else if (
        msg.includes("Permission") ||
        msg.includes("denied") ||
        msg.includes("NotAllowedError")
      ) {
        setError("Camera permission was denied. Please allow camera access in browser settings.");
      } else {
        setError(msg || "Camera unavailable. Please check camera permissions and retry.");
      }
    } finally {
      setModelsLoading(false);
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
    setHint("Center your face in the circle");
    void initCamera();

    return () => {
      stopCamera();
    };
  }, [open, initCamera, stopCamera]);

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2 || !video.videoWidth) {
      setError("Camera is still warming up. Please wait a moment and tap again.");
      return;
    }

    setBusy(true);
    setError(null);
    setHint("Analyzing facial biometrics…");

    try {
      const { descriptor } = await extractFaceDescriptor(video);
      const imageBase64 = captureJpegFromVideo(video, canvas);

      if (mode === "verify") {
        if (!enrolledDescriptor || !enrolledDescriptor.length) {
          setError("No enrolled face template found. Please enroll first in your profile.");
          setHint("Face enrollment required.");
          setBusy(false);
          return;
        }

        const distance = euclideanDistance(descriptor, enrolledDescriptor);
        const matchScore = distanceToSimilarity(distance);

        if (!isFaceMatch(distance)) {
          setError(
            `Face did not match enrolled template (score: ${(matchScore * 100).toFixed(0)}%). Hold still and tap to retry.`
          );
          setHint("Hold still & face camera directly");
          setBusy(false);
          return;
        }

        // Verification Succeeded!
        setVerifiedSuccess(true);
        setHint("Face verified successfully!");
        stopCamera();

        // Close modal immediately and invoke success handler
        handleClose();
        void Promise.resolve(
          onSuccess({
            descriptor: [...descriptor],
            matchScore,
            verified: true,
            imageBase64,
          })
        );
        return;
      }

      // Enrollment Succeeded!
      setVerifiedSuccess(true);
      setHint("Face captured successfully!");
      stopCamera();

      handleClose();
      void Promise.resolve(
        onSuccess({
          descriptor: [...descriptor],
          matchScore: 1,
          verified: true,
          imageBase64,
        })
      );
    } catch (e: any) {
      setHint("Hold still, face the camera, and ensure good lighting");
      setError(e?.message || "Capture failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex flex-col bg-background sm:items-center sm:justify-center sm:bg-black/75 sm:p-4"
      style={{ height: "100dvh", maxHeight: "100dvh" }}
    >
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-background sm:h-auto sm:max-h-[min(90dvh,720px)] sm:max-w-md sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 pt-[max(0.875rem,env(safe-area-inset-top))] sm:py-3.5 sm:pt-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ScanFace className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {title || (mode === "enroll" ? "Enroll Face Biometrics" : "Face Attendance Verification")}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {mode === "enroll" ? "Register your face ID" : "Verify identity for check in/out"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy && verifiedSuccess}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Center Section */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 sm:py-6 overflow-y-auto min-h-0">
          <div className="relative mx-auto aspect-square w-64 sm:w-72 max-w-[80vw] overflow-hidden rounded-full border-2 border-primary/50 shadow-2xl bg-black ring-4 ring-primary/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full scale-x-[-1] object-cover"
            />

            {/* Inner Circular Target Guide */}
            <div className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-white/40" />

            {/* Scanning Beam Micro-Animation */}
            {cameraReady && !modelsLoading && !error && (
              <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/80 to-transparent animate-pulse" />
            )}

            {/* Loading / Camera Starting Overlay */}
            {(modelsLoading || !cameraReady) && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 px-4 text-center text-white backdrop-blur-xs">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2.5" />
                <p className="text-xs font-medium">
                  {modelsLoading ? "Loading biometric models…" : "Starting camera…"}
                </p>
                <p className="text-[10px] text-white/70 mt-1">Please hold steady</p>
              </div>
            )}

            {/* Instant Verified Feedback Overlay */}
            {verifiedSuccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 px-4 text-center text-white backdrop-blur-xs animate-in fade-in duration-200">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-2 animate-bounce" />
                <p className="text-sm font-bold">Face Verified!</p>
                <p className="text-[11px] text-emerald-200/90 mt-0.5">Recording attendance…</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Real-time Guidance Pill */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted/70 px-3.5 py-1.5 text-center text-xs font-medium text-muted-foreground border border-border/60">
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  cameraReady ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  cameraReady ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </span>
            <span>{hint}</span>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div className="mt-3 w-full max-w-sm rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-xs text-destructive animate-in fade-in slide-in-from-top-1">
              <p className="font-semibold">{error}</p>
              {error.toLowerCase().includes("camera") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2.5 h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/15"
                  onClick={initCamera}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry Camera
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/80 bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:bg-card sm:p-4">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:h-10 w-full sm:w-auto text-sm font-medium"
              onClick={handleClose}
              disabled={busy && verifiedSuccess}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              className="h-11 sm:h-10 w-full gap-2 sm:w-auto text-sm font-semibold shadow-md shadow-primary/20"
              onClick={capture}
              disabled={busy || modelsLoading || !cameraReady || verifiedSuccess}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying…</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>
                    {error ? "Try Again" : mode === "enroll" ? "Capture & Enroll" : "Verify & Continue"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
