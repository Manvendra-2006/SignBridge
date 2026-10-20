// src/lib/postprocess.ts
/**
 * Simple post‑processing of recognizer predictions.
 *
 * - `confidenceThreshold` (default 0.8) – ignore predictions below this.
 * - `requiredStreak` (default 3) – need N consecutive identical predictions
 *   to emit a sign.
 * - `cooldownMs` (800) – after the last hand disappears we wait this long
 *   before finalising the phrase.
 * - `idleLabel` – label used by the recognizer when nothing is detected.
 *
 * The module keeps minimal state between calls (last label, streak count,
 * timestamp of the last non‑idle prediction). It returns an object describing
 * the result of the current frame:
 *   - `{type: "sign", label}` when a stable sign is recognised.
 *   - `{type: "phraseEnd"}` when the cooldown expires and we should ask the
 *     backend to smooth the collected glosses.
 *   - `null` when nothing noteworthy happened.
 */

export type PostprocessResult =
  | { type: "sign"; label: string }
  | { type: "phraseEnd" }
  | null;

interface Options {
  confidenceThreshold?: number;
  requiredStreak?: number;
  cooldownMs?: number;
  idleLabel?: string;
}

export function createPostprocess(options: Options = {}) {
  const {
    confidenceThreshold = 0.8,
    requiredStreak = 3,
    cooldownMs = 800,
    idleLabel = "IDLE",
  } = options;

  let lastLabel: string | null = null;
  let streak = 0;
  let lastActiveTs = Date.now();

  return function process(label: string, confidence: number): PostprocessResult {
    const now = Date.now();
    // Reset cooldown timer on any hand activity.
    if (label !== idleLabel && confidence > 0) {
      lastActiveTs = now;
    }

    // Ignore low confidence predictions.
    if (confidence < confidenceThreshold) {
      return null;
    }

    // Handle idle – possible phrase end.
    if (label === idleLabel) {
      if (now - lastActiveTs >= cooldownMs && streak >= requiredStreak) {
        // Phrase has ended after a pause.
        streak = 0;
        lastLabel = null;
        return { type: "phraseEnd" };
      }
      return null;
    }

    // New non‑idle prediction.
    if (label === lastLabel) {
      streak++;
    } else {
      lastLabel = label;
      streak = 1;
    }

    if (streak >= requiredStreak) {
      // Emit the sign and keep streak so repeated frames don't flood.
      // Reset streak so we need the next consecutive block again.
      streak = 0;
      return { type: "sign", label };
    }
    return null;
  };
}

// Export a default instance used by the UI.
export const postprocess = createPostprocess();
