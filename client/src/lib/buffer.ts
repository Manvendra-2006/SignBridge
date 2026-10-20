// src/lib/buffer.ts
/**
 * Simple fixed‑size ring buffer for Float32Array frames.
 * Stores the last N frames (default 30) used by the recognizer.
 */
export class FrameBuffer {
  private readonly size: number;
  private readonly buffer: Float32Array[];
  private index = 0;
  private filled = false;

  constructor(size: number = 30) {
    this.size = size;
    this.buffer = new Array<Float32Array>(size);
  }

  /** Add a new frame (preprocessed vector) */
  push(frame: Float32Array) {
    this.buffer[this.index] = frame;
    this.index = (this.index + 1) % this.size;
    if (this.index === 0) this.filled = true;
  }

  /** Get a concatenated Float32Array of the last N frames */
  getWindow(): Float32Array {
    const out = new Float32Array(this.size * 126);
    for (let i = 0; i < this.size; i++) {
      const srcIdx = (this.filled ? this.index : 0) + i;
      const realIdx = srcIdx % this.size;
      const frame = this.buffer[realIdx] || new Float32Array(126);
      out.set(frame, i * 126);
    }
    return out;
  }

  /** Reset the buffer */
  clear() {
    this.buffer.fill(undefined as any);
    this.index = 0;
    this.filled = false;
  }
}
