import { BLOCK, DESCRIPTOR_SIZE, FACE_MATCH_THRESHOLD } from "./constants";

/**
 * Shared client face descriptor (web + mobile).
 * Grayscale 64×64 → 8×8 block means + 32-bin histogram, L2-normalized.
 * Not a deep face embedding — good enough for v1 selfie match without cloud APIs.
 */
export function extractDescriptorFromImageData(imageData: ImageData): number[] {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Resize to DESCRIPTOR_SIZE² via nearest neighbor into square
  const size = DESCRIPTOR_SIZE;
  const resized = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.min(width - 1, Math.floor((x / size) * width));
      const sy = Math.min(height - 1, Math.floor((y / size) * height));
      resized[y * size + x] = gray[sy * width + sx];
    }
  }

  const blockMeans: number[] = [];
  const cell = size / BLOCK;
  for (let by = 0; by < BLOCK; by++) {
    for (let bx = 0; bx < BLOCK; bx++) {
      let sum = 0;
      let count = 0;
      const y0 = Math.floor(by * cell);
      const x0 = Math.floor(bx * cell);
      const y1 = Math.floor((by + 1) * cell);
      const x1 = Math.floor((bx + 1) * cell);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          sum += resized[y * size + x];
          count++;
        }
      }
      blockMeans.push(count ? sum / count / 255 : 0);
    }
  }

  const hist = new Array(32).fill(0);
  for (let i = 0; i < resized.length; i++) {
    const bin = Math.min(31, Math.floor(resized[i] / 8));
    hist[bin] += 1;
  }
  const histNorm = hist.map((v) => v / resized.length);

  return l2Normalize([...blockMeans, ...histNorm]);
}

export function l2Normalize(vec: number[]): number[] {
  let sumSq = 0;
  for (const v of vec) sumSq += v * v;
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((v) => v / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export function isFaceMatch(score: number): boolean {
  return score >= FACE_MATCH_THRESHOLD;
}

/** Draw video/image into canvas, optionally crop center oval region, return ImageData. */
export function captureFrameImageData(
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  canvas: HTMLCanvasElement,
  opts?: { cropCenter?: boolean }
): ImageData {
  const crop = opts?.cropCenter !== false;
  const sw =
    source instanceof HTMLVideoElement
      ? source.videoWidth
      : source instanceof HTMLImageElement
        ? source.naturalWidth
        : source.width;
  const sh =
    source instanceof HTMLVideoElement
      ? source.videoHeight
      : source instanceof HTMLImageElement
        ? source.naturalHeight
        : source.height;

  const side = Math.min(sw, sh);
  const sx = crop ? (sw - side) / 2 : 0;
  const sy = crop ? (sh - side) / 2 : 0;

  canvas.width = DESCRIPTOR_SIZE;
  canvas.height = DESCRIPTOR_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, sx, sy, side, side, 0, 0, DESCRIPTOR_SIZE, DESCRIPTOR_SIZE);
  return ctx.getImageData(0, 0, DESCRIPTOR_SIZE, DESCRIPTOR_SIZE);
}

export function canvasToJpegDataUrl(canvas: HTMLCanvasElement, quality = 0.85): string {
  return canvas.toDataURL("image/jpeg", quality);
}

/** Basic brightness / variance check so blank frames are rejected. */
export function looksLikeFaceFrame(imageData: ImageData): boolean {
  const { data } = imageData;
  let sum = 0;
  let sumSq = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum += g;
    sumSq += g * g;
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  return mean > 25 && mean < 240 && variance > 200;
}
