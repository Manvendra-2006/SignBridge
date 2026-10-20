
import {
  HandLandmarker,
  HandLandmarkerResult,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;

export async function initHandLandmarker(): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

export async function detectHands(
  image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
) {
  if (!handLandmarker) await initHandLandmarker();

  if (!(image instanceof HTMLVideoElement)) return [];

  const results: HandLandmarkerResult =
    handLandmarker!.detectForVideo(image, performance.now());

  return results.landmarks.map((landmarks, i) => ({
    landmarks,
    handedness:
      results.handedness[i]?.[0]?.categoryName ?? "Right",
  }));
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  handLandmarks: readonly { x: number; y: number; z: number }[]
): void {
  const connections: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
  ];

  ctx.strokeStyle = "rgba(99,102,241,0.8)";
  ctx.lineWidth = 2;

  for (const [a, b] of connections) {
    const p1 = handLandmarks[a];
    const p2 = handLandmarks[b];

    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
      ctx.stroke();
    }
  }
}
