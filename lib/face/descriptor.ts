import {
  FACE_DESCRIPTOR_DIM,
  FACE_DISTANCE_THRESHOLD,
  FACE_MATCH_THRESHOLD,
  FACE_MODELS_URL,
} from "./constants";

export {
  FACE_DESCRIPTOR_DIM,
  FACE_DISTANCE_THRESHOLD,
  FACE_MATCH_THRESHOLD,
};

let modelsReady: Promise<void> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let faceapiModule: any = null;

async function getFaceApi() {
  // TF backend must init before face-api nets
  await import("@tensorflow/tfjs");
  if (!faceapiModule) {
    faceapiModule = await import("@vladmandic/face-api");
  }
  return faceapiModule;
}

/** Load tiny face detector + landmarks + FaceNet recognition (once). */
export function loadFaceModels(): Promise<void> {
  if (!modelsReady) {
    modelsReady = (async () => {
      const faceapi = await getFaceApi();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODELS_URL),
      ]);
      if (!faceapi.nets.faceRecognitionNet.isLoaded) {
        throw new Error("Face recognition model failed to load.");
      }
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

/** Normalize to a plain number[] of exact FaceNet length. */
export function normalizeDescriptor(raw: ArrayLike<number>): number[] {
  const out: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    const v = Number(raw[i]);
    if (!Number.isFinite(v)) {
      throw new Error("Face descriptor contained invalid numbers. Please retry.");
    }
    out.push(v);
  }
  if (out.length !== FACE_DESCRIPTOR_DIM) {
    throw new Error(
      `Face model returned ${out.length} values (need ${FACE_DESCRIPTOR_DIM}). Hard-refresh the page and re-enroll.`
    );
  }
  return out;
}

/**
 * Detect a single frontal face and return FaceNet 128-d descriptor.
 * Rejects no-face / multi-face frames.
 */
export async function extractFaceDescriptor(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<{ descriptor: number[]; detectionScore: number }> {
  await loadFaceModels();
  const faceapi = await getFaceApi();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
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
  if (box.width < minSide * 0.15 || box.height < minSide * 0.15) {
    throw new Error("Move closer so your face fills more of the circle.");
  }

  if (!best.descriptor || best.descriptor.length === 0) {
    throw new Error(
      "Face embedding missing — recognition model may not have loaded. Hard-refresh and retry."
    );
  }

  const descriptor = normalizeDescriptor(best.descriptor);

  return {
    descriptor,
    detectionScore: best.detection.score,
  };
}

/** Snapshot video to JPEG data URL for audit upload. */
export function captureJpegFromVideo(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  quality = 0.7
): string {
  const w = video.videoWidth;
  const h = video.videoHeight;
  const side = Math.min(w, h);
  const sx = (w - side) / 2;
  const sy = (h - side) / 2;
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, sx, sy, side, side, 0, 0, 256, 256);
  return canvas.toDataURL("image/jpeg", quality);
}
