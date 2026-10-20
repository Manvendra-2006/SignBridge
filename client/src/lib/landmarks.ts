// src/lib/landmarks.ts
import { HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { FilesetResolver } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;

/** Initialize MediaPipe HandLandmarker */
export async function initHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    // The wasm path can be relative; MediaPipe hosts it via CDN.
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    model: "lite", // small model for in‑browser performance
  });
}

/** Run inference on a video frame and return up to two hand results */
export async function detectHands(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
  if (!handLandmarker) {
    await initHandLandmarker();
  }
  const results: HandLandmarkerResult = await handLandmarker!.detectForVideo(image, Date.now());
  // Return an array of landmarks arrays (each hand) – empty if no hand.
  return results.handedness.map((_, i) => results.landmarks[i]);
}

/** Utility: draw skeleton onto a canvas */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  handLandmarks: readonly { x: number; y: number; z: number }[]
) {
  const connections = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
  ];

  ctx.strokeStyle = "rgba(99,102,241,0.8)"; // indigo‑600 with opacity
  ctx.lineWidth = 2;
  connections.forEach(([a, b]) => {
    const p1 = handLandmarks[a];
    const p2 = handLandmarks[b];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
      ctx.stroke();
    }
  });
}
