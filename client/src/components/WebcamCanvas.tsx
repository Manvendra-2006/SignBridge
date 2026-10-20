// src/components/WebcamCanvas.tsx
import React, { useEffect, useRef } from "react";
import { initHandLandmarker, detectHands, drawSkeleton } from "../lib/landmarks";
import { HandLandmarkerResult } from "@mediapipe/tasks-vision";

interface Props {
  /** Show the hand skeleton overlay */
  showSkeleton?: boolean;
  /** Called each frame with the detected hands (array of landmarks per hand) */
  onHands?: (hands: readonly (readonly { x: number; y: number; z: number }[])[]) => void;
}

const WebcamCanvas: React.FC<Props> = ({ showSkeleton = true, onHands }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialise MediaPipe once
  useEffect(() => {
    initHandLandmarker();
  }, []);

  // Start webcam stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();
      } catch (e) {
        console.error("Camera permission denied or unavailable", e);
      }
    };
    start();
    return () => {
      const tracks = video.srcObject instanceof MediaStream ? video.srcObject.getTracks() : [];
      tracks.forEach((t) => t.stop());
    };
  }, []);

  // Main processing loop
  useEffect(() => {
    let animationId: number;
    const process = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || video.readyState < 2) {
        animationId = requestAnimationFrame(process);
        return;
      }
      const hands = await detectHands(video);
      // hands is an array of landmarks per hand (or empty)
      if (onHands) onHands(hands as any);

      if (showSkeleton && canvas) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Resize canvas to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Draw each hand skeleton
        (hands as any).forEach((hand: any) => drawSkeleton(ctx, hand));
      }
      animationId = requestAnimationFrame(process);
    };
    animationId = requestAnimationFrame(process);
    return () => cancelAnimationFrame(animationId);
  }, [showSkeleton, onHands]);

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      {showSkeleton && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
};

export default WebcamCanvas;
