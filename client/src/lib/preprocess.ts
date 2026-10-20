// src/lib/preprocess.ts
/**
 * Preprocess raw hand landmarks into a fixed‑size vector.
 *
 * Input: up to two hands, each with 21 landmarks (x, y, z).
 * Output: Float32Array of length 126 (2 * 21 * 3).
 *   - Missing hand -> zeros.
 *   - For each present hand we:
 *       1. Translate so the wrist (landmark 0) becomes the origin.
 *       2. Scale by the maximum absolute coordinate value of that hand
 *          (so the vector is roughly in [-1, 1]).
 *
 * This mirrors the Python implementation we will later use for model training.
 */
export function preprocessHands(
  hands: readonly (readonly { x: number; y: number; z: number }[])[]
): Float32Array {
  const VECTOR_SIZE = 126; // 2 hands * 21 landmarks * 3 coords
  const result = new Float32Array(VECTOR_SIZE);

  // Helper to flatten one hand into 63 numbers after normalization
  const flattenHand = (hand: readonly { x: number; y: number; z: number }[], offset: number) => {
    const wrist = hand[0];
    // Translate all points relative to wrist
    const translated = hand.map((pt) => ({
      x: pt.x - wrist.x,
      y: pt.y - wrist.y,
      z: pt.z - wrist.z,
    }));
    // Find max absolute value across all coordinates for scaling
    let maxAbs = 0;
    translated.forEach((pt) => {
      maxAbs = Math.max(maxAbs, Math.abs(pt.x), Math.abs(pt.y), Math.abs(pt.z));
    });
    const scale = maxAbs === 0 ? 1 : maxAbs;
    // Fill result slice
    translated.forEach((pt, i) => {
      const base = offset + i * 3;
      result[base] = pt.x / scale;
      result[base + 1] = pt.y / scale;
      result[base + 2] = pt.z / scale;
    });
  };

  // Left hand first, then right hand (if present). MediaPipe does not guarantee order,
  // so we simply use the order it gives us – callers should sort if needed.
  if (hands[0]) {
    flattenHand(hands[0], 0);
  }
  if (hands[1]) {
    flattenHand(hands[1], 63);
  }
  // If a hand is missing its slice remains zeros.
  return result;
}
