"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, RefreshCw, Check, X, RotateCcw, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  onFallbackToFileUpload?: () => void;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFileUpload,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Stop all active camera tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (desiredFacing: "user" | "environment" = "user") => {
    stopStream();
    setError(null);
    setIsReady(false);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is not supported by your browser or requires a secure connection (HTTPS / localhost).");
      return;
    }

    // Check for available video inputs
    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
        if (videoDevices.length === 0) {
          setError("No camera device detected. Please connect a webcam and try again.");
          return;
        }
      }
    } catch {
      // Non-fatal, continue with getUserMedia attempt
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: desiredFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
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
        throw new Error("Could not acquire camera stream.");
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
        try {
          await videoRef.current.play();
          setIsReady(true);
        } catch {
          // Playback might wait for user gesture or metadata
        }
      }
    } catch (err: any) {
      const errName = err?.name || "";
      const errMsg = err?.message || "";

      if (
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError" ||
        errMsg.toLowerCase().includes("permission") ||
        errMsg.toLowerCase().includes("denied")
      ) {
        setError("Camera permission was denied. Please allow camera permissions in your browser address bar.");
      } else if (
        errName === "NotFoundError" ||
        errName === "DevicesNotFoundError" ||
        errMsg.toLowerCase().includes("not found") ||
        errMsg.toLowerCase().includes("no device")
      ) {
        setError("No camera hardware detected on this device.");
      } else if (errName === "NotReadableError" || errName === "TrackStartError") {
        setError("Your camera is currently in use by another application. Please close other camera apps and retry.");
      } else {
        setError(errMsg || "Failed to access webcam. Please verify your camera settings.");
      }
    }
  }, [stopStream]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setError(null);
      setIsCapturing(false);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream, facingMode]);

  // Switch between front/back or external cameras
  const toggleCamera = () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    setCapturedImage(null);
    startCamera(nextFacing);
  };

  // Take photo snapshot from video element
  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !isReady || video.videoWidth === 0) return;

    setIsCapturing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setError("Could not initialize image canvas.");
        setIsCapturing(false);
        return;
      }

      // If user facing front camera, mirror horizontally for natural preview
      if (facingMode === "user") {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedImage(dataUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to capture frame from camera.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  // Confirm photo and create File object
  const handleConfirmPhoto = async () => {
    if (!capturedImage) return;

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const fileName = `camera_photo_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      onCapture(file);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to process captured image.");
    }
  };

  const handleClose = () => {
    stopStream();
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div 
        className="relative w-full max-w-lg bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Take Photo</h3>
              <p className="text-xs text-muted-foreground">
                {capturedImage ? "Review your photo" : "Position yourself and snap a picture"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Capture Preview */}
        <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-white max-w-sm flex flex-col items-center">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-full mb-3">
                <CameraOff className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium mb-1 text-rose-200">Camera Unavailable</p>
              <p className="text-xs text-gray-400 mb-4">{error}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startCamera(facingMode)}
                  className="text-xs text-white border-white/20 hover:bg-white/10"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Try Again
                </Button>
                {onFallbackToFileUpload && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      handleClose();
                      onFallbackToFileUpload();
                    }}
                    className="text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload File Instead
                  </Button>
                )}
              </div>
            </div>
          ) : capturedImage ? (
            /* Review captured photo */
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Live camera stream */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />

              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-primary" />
                  <p className="text-xs text-gray-300">Accessing camera...</p>
                </div>
              )}

              {/* Live badge */}
              {isReady && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-white border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Camera
                </div>
              )}

              {/* Switch camera button (if multiple cameras available) */}
              {hasMultipleCameras && isReady && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md transition-colors"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-muted/30 border-t border-border/60 flex items-center justify-between">
          {capturedImage ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleConfirmPhoto}
                className="gap-1.5 text-xs rounded-full px-5"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                <span>Make sure you have good lighting</span>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={takeSnapshot}
                disabled={!isReady || !!error || isCapturing}
                className="gap-2 text-xs rounded-full px-6 shadow-md"
              >
                <Camera className="w-4 h-4" />
                {isCapturing ? "Capturing..." : "Take Photo"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
