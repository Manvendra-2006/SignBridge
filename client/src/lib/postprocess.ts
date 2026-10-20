
/**
 * SignBridge prediction post-processing.
 *
 * Accepts the model's trained labels:
 * EAT, GO, HELLO, HELP, NO, PLEASE, WATER, YES.
 *
 * Requires stable consecutive predictions to reduce flicker.
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
    confidenceThreshold = 0.30,
    requiredStreak = 3,
    cooldownMs = 800,
    idleLabel = "IDLE",
  } = options;

  let lastLabel: string | null = null;
  let streak = 0;
  let lastEmittedLabel: string | null = null;
  let lastActiveTs = Date.now();

  return function process(
    label: string,
    confidence: number
  ): PostprocessResult {
    const now = Date.now();

    if (
      !label ||
      label === idleLabel ||
      label === "COLLECTING" ||
      label === "Uncertain"
    ) {
      if (
        now - lastActiveTs >= cooldownMs &&
        lastEmittedLabel !== null
      ) {
        lastEmittedLabel = null;
        lastLabel = null;
        streak = 0;
        return { type: "phraseEnd" };
      }

      return null;
    }

    if (confidence < confidenceThreshold) {
      lastLabel = null;
      streak = 0;
      return null;
    }

    lastActiveTs = now;

    if (label === lastLabel) {
      streak++;
    } else {
      lastLabel = label;
      streak = 1;
    }

    if (streak < requiredStreak) {
      return null;
    }

    // Avoid emitting the same sign on every subsequent frame.
    if (label === lastEmittedLabel) {
      return null;
    }

    lastEmittedLabel = label;
    streak = 0;

    return { type: "sign", label };
  };
}

export const postprocess = createPostprocess();
