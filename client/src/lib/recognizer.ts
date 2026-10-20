// src/lib/recognizer.ts
/**
 * Recognizer interface – abstracts the sign‑language model.
 * The concrete implementation can be swapped without touching the UI.
 */
export interface Recognizer {
  /** Load any heavy assets (e.g., ONNX model). */
  init(): Promise<void>;
  /**
   * Predict a sign label from a flattened frame buffer.
   * @param window Float32Array of length 30*126 (30 frames of 126 numbers)
   * @returns label and confidence. "IDLE" indicates no sign detected.
   */
  predict(window: Float32Array): Promise<{ label: string; confidence: number }>;
}

/** Sample list of mock signs */
const MOCK_SIGNS = [
  "HELLO",
  "ME",
  "NAME",
  "THANK-YOU",
  "YES",
  "NO",
  "HELP",
  "WATER",
  "PLEASE",
];

/** Simple mock recognizer – reacts to number keys 1‑9 */
class MockRecognizer implements Recognizer {
  private lastKey: number | null = null;

  async init() {
    // Attach a keyboard listener for quick testing.
    window.addEventListener("keydown", (e) => {
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= MOCK_SIGNS.length) {
        this.lastKey = num;
      }
    });
  }

  async predict(_: Float32Array) {
    if (this.lastKey) {
      const label = MOCK_SIGNS[this.lastKey - 1];
      this.lastKey = null; // consume the key
      return { label, confidence: 0.9 };
    }
    return { label: "IDLE", confidence: 0 };
  }
}

/**
 * Factory – returns the recognizer used by the app.
 * Replace the body to return an OnnxRecognizer (or any other) later.
 */
export function getRecognizer(): Recognizer {
  // TODO: swap for real model implementation.
  return new MockRecognizer();
}
