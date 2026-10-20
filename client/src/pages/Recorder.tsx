// src/pages/Recorder.tsx
import React, { useState, useRef, useEffect } from "react";
import WebcamCanvas from "../components/WebcamCanvas";
import { preprocessHands } from "../lib/preprocess";

interface Sample {
  label: string;
  frames: number[][]; // each frame flattened 126 numbers
}

const Recorder: React.FC = () => {
  const [label, setLabel] = useState("");
  const [targetCount, setTargetCount] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [samples, setSamples] = useState<Sample[]>([]);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const frameBuffer = useRef<number[][]>([]);

  // Capture a frame on each hand detection callback
  const handleHands = (hands: readonly (readonly { x: number; y: number; z: number }[])[]) => {
    if (!recording) return;
    const vec = Array.from(preprocessHands(hands));
    frameBuffer.current.push(vec);
    if (frameBuffer.current.length >= 30) {
      // Store sample
      const sample: Sample = { label, frames: [...frameBuffer.current] };
      setSamples((prev) => [...prev, sample]);
      // Update counts
      setCounts((prev) => ({ ...prev, [label]: (prev[label] || 0) + 1 }));
      // Reset for next sample
      frameBuffer.current = [];
      setRecording(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const startCapture = () => {
    if (!label) return alert("Enter a label first");
    setCountdown(3);
  };

  // When countdown reaches 0 start recording
  useEffect(() => {
    if (countdown === 0 && label) {
      setRecording(true);
    }
  }, [countdown, label]);

  const undoLast = () => {
    setSamples((prev) => prev.slice(0, -1));
    // Recompute counts
    setCounts((prev) => {
      const newCounts = { ...prev };
      newCounts[label] = Math.max((newCounts[label] || 1) - 1, 0);
      return newCounts;
    });
  };

  const deleteLabel = (lbl: string) => {
    setSamples((prev) => prev.filter((s) => s.label !== lbl));
    setCounts((prev) => {
      const { [lbl]: _, ...rest } = prev;
      return rest;
    });
  };

  const exportJSON = () => {
    const data = {
      labels: Object.keys(counts),
      samples,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signbridge_dataset.json";
    a.click();
  };

  // Add a default IDLE label hint
  useEffect(() => {
    if (!counts["IDLE"]) {
      setCounts((prev) => ({ ...prev, IDLE: 0 }));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dataset Recorder</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <WebcamCanvas showSkeleton={true} onHands={handleHands} />
          {recording && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-4xl font-bold">
              Recording…
            </div>
          )}
          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-6xl font-bold">
              {countdown}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <label className="flex flex-col">
            <span className="text-sm mb-1">Label name</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="border rounded p-2"
            />
          </label>
          <button
            onClick={startCapture}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Capture (Space)
          </button>
          <button
            onClick={undoLast}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
          >
            Undo last sample
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* List of label counts */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(counts).map(([lbl, cnt]) => (
          <div key={lbl} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <span>{lbl}</span>
            <span>{cnt}</span>
            {lbl !== "IDLE" && (
              <button
                onClick={() => deleteLabel(lbl)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recorder;
