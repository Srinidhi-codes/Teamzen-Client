import * as faceapi from "@vladmandic/face-api";
import {
  FACE_DESCRIPTOR_DIM,
  FACE_DISTANCE_THRESHOLD,
  FACE_MATCH_THRESHOLD,
  FACE_MODELS_URL,
} from "./constants";

let modelsReady: Promise<void> | null = null;

/** Load tiny face detector + landmarks + FaceNet recognition (once). */
export function loadFaceModels(): Promise<void> {
  if (!modelsReady) {
    modelsReady = (async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODELS_URL),
      ]);
    })().catch((err) => {
      modelsReady = null;
      throw err;
    });
  }
  return modelsReady;
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
  return Math.max(0, 1 - distance);
}

export function isFaceMatch(distance: number): boolean {
  return distance <= FACE_DISTANCE_THRESHOLD;
}

export { FACE_DESCRIPTOR_DIM, FACE_DISTANCE_THRESHOLD, FACE_MATCH_THRESHOLD };

/**
 * Detect a single frontal face and return FaceNet 128-d descriptor.
 * Rejects no-face / multi-face frames.
 */
export async function extractFaceDescriptor(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<{ descriptor: number[]; detectionScore: number }> {
  await loadFaceModels();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5,
  });

  const detections = await faceapi
    .detectAllFaces(input, options)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length) {
    throw new Error("No face detected. Center your face and improve lighting.");
  }
  if (detections.length > 1) {
    throw new Error("Multiple faces detected. Only one person should be in frame.");
  }

  const best = detections[0];
  const box = best.detection.box;
  const minSide = Math.min(
    input instanceof HTMLVideoElement
      ? input.videoWidth
      : input instanceof HTMLImageElement
        ? input.naturalWidth
        : input.width,
    input instanceof HTMLVideoElement
      ? input.videoHeight
      : input instanceof HTMLImageElement
        ? input.naturalHeight
        : input.height
  );
  // Require face to occupy a reasonable portion of the frame (anti spoof-lite / distance)
  if (box.width < minSide * 0.18 || box.height < minSide * 0.18) {
    throw new Error("Move closer so your face fills more of the circle.");
  }

  const descriptor = Array.from(best.descriptor);
  if (descriptor.length !== FACE_DESCRIPTOR_DIM) {
    throw new Error("Face model returned an unexpected descriptor. Please retry.");
  }

  return {
    descriptor,
    detectionScore: best.detection.score,
  };
}

/** Snapshot video to JPEG data URL for audit upload. */
export function captureJpegFromVideo(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  quality = 0.85
): string {
  const w = video.videoWidth;
  const h = video.videoHeight;
  const side = Math.min(w, h);
  const sx = (w - side) / 2;
  const sy = (h - side) / 2;
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, sx, sy, side, side, 0, 0, 320, 320);
  return canvas.toDataURL("image/jpeg", quality);
}
