/** Must stay in sync with backend/attendance/face_constants.py */
export const FACE_DESCRIPTOR_DIM = 128;
/** Euclidean distance (lower = closer). Match if distance ≤ this. */
export const FACE_DISTANCE_THRESHOLD = 0.65;
/** Display similarity = max(0, 1 - distance); pass if ≥ this. */
export const FACE_MATCH_THRESHOLD = 0.35;
export const FACE_MODELS_URL = "/models/face-api";
