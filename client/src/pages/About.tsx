import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout"; // assuming a Layout component exists

/**
 * About page – provides a concise overview of the SignBridge stack,
 * how the application works, and its current limitations.
 *
 * The UI follows the same design system as the rest of the app
 * (Tailwind, indigo accent, Inter font, light/dark mode). All
 * content is static, so it works offline without any backend calls.
 */
export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-6 prose prose-indigo">
        <h1 className="text-3xl font-bold">About SignBridge</h1>
        <section>
          <h2 className="text-2xl font-semibold">Tech Stack</h2>
          <ul>
            <li><strong>Frontend:</strong> React + Vite + TypeScript, Tailwind CSS, lucide‑react, Framer Motion</li>
            <li><strong>Hand tracking:</strong> @mediapipe/tasks‑vision (HandLandmarker) – runs entirely in the browser</li>
            <li><strong>Backend:</strong> Node / Express, dotenv, cors, express‑rate‑limit</li>
            <li><strong>AI services:</strong> Azure OpenAI (gloss‑to‑sentence) and Azure AI Speech (TTS / STT). Both have browser fallbacks.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <ol>
            <li>Webcam frames are fed to MediaPipe’s HandLandmarker.</li>
            <li>Landmarks are pre‑processed into a 126‑length float vector per hand.</li>
            <li>A ring‑buffer stores the last 30 frames; the mock recognizer emits a sign label when you press keys 1‑9.</li>
            <li>Post‑processing aggregates predictions, applies a confidence threshold, and triggers a phrase end.</li>
            <li>When a phrase ends, the gloss array is sent to <code>/api/smooth</code> for Azure‑based smoothing (or a simple join fallback).</li>
            <li>The resulting sentence is spoken via Azure Speech SDK or the native <code>speechSynthesis</code> API.</li>
          </ol>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Current Limitations</h2>
          <ul>
            <li>Sign recognition is a mock implementation – replace <code>src/lib/recognizer.ts</code> with a real model later.</li>
            <li>Azure credentials are optional; without them the app falls back to browser TTS/STT and raw gloss text.</li>
            <li>The hand‑tracking model runs on‑device, so performance depends on the user's hardware.</li>
          </ul>
        </section>
        <section className="mt-8">
          <Link to="/" className="inline-block text-indigo-600 hover:underline">
            ← Back to Home
          </Link>
        </section>
      </div>
    </Layout>
  );
}
