/**
 * Ultra-fast, lightweight face descriptor & verification service.
 * Operates identically to the mobile app:
 * - Uses native built-in camera capture or direct hardware webcam stream.
 * - Compresses photo to 480px JPEG in milliseconds on browser canvas.
 * - Delegates 128-d face detection & verification to the server-side AI engine (/api/attendance/face/extract/).
 * - ZERO client-side neural net models (no TensorFlow, no face-api lag, no memory bloat).
 */

import {
  FACE_DESCRIPTOR_DIM,
  FACE_DISTANCE_THRESHOLD,
  FACE_MATCH_THRESHOLD,
} from "./constants";

export {
  FACE_DESCRIPTOR_DIM,
  FACE_DISTANCE_THRESHOLD,
  FACE_MATCH_THRESHOLD,
};

export interface FaceExtractionResult {
  descriptor: number[];
  detectionConfidence: number;
  verified?: boolean;
  distance?: number;
  matchScore?: number;
  imageBase64: string;
}

/** Instant no-op for backward compatibility. Server runs the AI models now. */
export function loadFaceModels(): Promise<void> {
  return Promise.resolve();
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return Number.POSITIVE_INFINITY;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function distanceToSimilarity(distance: number): number {
  return Math.max(0, Math.min(1, 1 - (distance * distance) / 2));
}

export function isFaceMatch(distance: number): boolean {
  return distance <= FACE_DISTANCE_THRESHOLD;
}

/**
 * Downscale and compress an image source to max 480px width JPEG data URL.
 * Prevents large payload transfer and memory spikes.
 */
export async function compressPhoto(
  source: File | Blob | HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | string,
  maxWidth = 480,
  quality = 0.8
): Promise<string> {
  if (typeof window === "undefined") return "";

  // If already a small data URL and not too large
  if (typeof source === "string" && source.startsWith("data:image/") && source.length < 200000) {
    return source;
  }

  return new Promise<string>((resolve, reject) => {
    const processImageElement = (img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => {
      try {
        const sw = img instanceof HTMLVideoElement ? img.videoWidth : img.width;
        const sh = img instanceof HTMLVideoElement ? img.videoHeight : img.height;
        if (!sw || !sh) {
          throw new Error("Unable to read video/image dimensions");
        }

        const scale = Math.min(1, maxWidth / sw);
        const dw = Math.round(sw * scale);
        const dh = Math.round(sh * scale);

        const canvas = document.createElement("canvas");
        canvas.width = dw;
        canvas.height = dh;
        const ctx = canvas.getContext("2d", { willReadFrequently: false });
        if (!ctx) {
          throw new Error("Canvas 2D context unavailable");
        }

        // Mirror front camera if it's a video element
        if (img instanceof HTMLVideoElement) {
          ctx.save();
          ctx.translate(dw, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, dw, dh);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0, dw, dh);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    if (source instanceof HTMLVideoElement || source instanceof HTMLCanvasElement) {
      processImageElement(source);
      return;
    }

    if (source instanceof HTMLImageElement) {
      if (source.complete) {
        processImageElement(source);
      } else {
        source.onload = () => processImageElement(source);
        source.onerror = () => reject(new Error("Failed to load source image"));
      }
      return;
    }

    // File or Blob or string URL
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      processImageElement(img);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image file"));
    };

    if (typeof source === "string") {
      img.src = source;
    } else if (typeof Blob !== "undefined" && source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else {
      reject(new Error("Unsupported image source"));
    }
  });
}

/**
 * Snapshot video frame to JPEG data URL.
 */
export function captureJpegFromVideo(
  video: HTMLVideoElement,
  canvas?: HTMLCanvasElement | null,
  quality = 0.8
): string {
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  const targetCanvas = canvas || document.createElement("canvas");
  
  const scale = Math.min(1, 480 / w);
  const dw = Math.round(w * scale);
  const dh = Math.round(h * scale);
  targetCanvas.width = dw;
  targetCanvas.height = dh;
  
  const ctx = targetCanvas.getContext("2d");
  if (!ctx) return "";
  
  // Mirror for natural selfie orientation
  ctx.save();
  ctx.translate(dw, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, dw, dh);
  ctx.restore();
  
  return targetCanvas.toDataURL("image/jpeg", quality);
}

/**
 * Upload captured photo to backend AI engine for face detection & verification.
 * Same endpoint and contract as the mobile app.
 */
export async function extractAndVerifyFace(
  imageBase64: string,
  options: { verify?: boolean; enroll?: boolean; append?: boolean } = {}
): Promise<FaceExtractionResult> {
  // Compress before upload if not already compressed
  const compressed = await compressPhoto(imageBase64, 480, 0.82);

  const response = await fetch("/api/attendance/face/extract/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Send session/auth cookies
    body: JSON.stringify({
      photo_base64: compressed,
      verify: !!options.verify,
      enroll: !!options.enroll,
      append: !!options.append,
    }),
  });

  const rawText = await response.text();
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Face verification server response error (${response.status}). Please retry.`);
  }

  if (!response.ok || data.error) {
    const errorMsg =
      data.error ||
      (response.status === 400
        ? "Face verification failed. Please ensure good lighting and face the camera directly."
        : `Server error (${response.status}). Please retry.`);
    throw new Error(errorMsg);
  }

  return {
    descriptor: data.descriptor || [],
    detectionConfidence: data.detection_confidence || 1.0,
    verified: data.verified !== undefined ? data.verified : true,
    distance: data.distance,
    matchScore: data.match_score ?? 1.0,
    imageBase64: compressed,
  };
}

/**
 * Backward compatibility wrapper for extractFaceDescriptor.
 */
export async function extractFaceDescriptor(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<{ descriptor: number[]; detectionScore: number; verified?: boolean; matchScore?: number; imageBase64?: string }> {
  const photoBase64 = await compressPhoto(input, 480, 0.82);
  const result = await extractAndVerifyFace(photoBase64, { verify: true });
  return {
    descriptor: result.descriptor,
    detectionScore: result.detectionConfidence,
    verified: result.verified,
    matchScore: result.matchScore,
    imageBase64: result.imageBase64,
  };
}
