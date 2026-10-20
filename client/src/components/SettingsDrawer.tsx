// src/components/SettingsDrawer.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * Settings pane that slides in from the right.
 * Allows the user to toggle skeleton overlay, adjust confidence threshold,
 * enable mock mode (currently always on), and turn voice output on/off.
 */
interface Props {
  onClose: () => void;
  // In a full implementation we would pass callbacks to propagate settings.
  // For now we store them locally and persist to localStorage for demo.
}

const SettingsDrawer: React.FC<Props> = ({ onClose }) => {
  const [showSkeleton, setShowSkeleton] = useState(
    () => localStorage.getItem("showSkeleton") === "true"
  );
  const [confidence, setConfidence] = useState(() => {
    const val = localStorage.getItem("confidenceThreshold");
    return val ? parseFloat(val) : 0.8;
  });
  const [voiceOn, setVoiceOn] = useState(
    () => localStorage.getItem("voiceOn") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("showSkeleton", String(showSkeleton));
  }, [showSkeleton]);

  useEffect(() => {
    localStorage.setItem("confidenceThreshold", String(confidence));
  }, [confidence]);

  useEffect(() => {
    localStorage.setItem("voiceOn", String(voiceOn));
  }, [voiceOn]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={onClose}
        aria-label="Close settings"
      />
      {/* Drawer */}
      <aside className="relative w-80 bg-white dark:bg-gray-800 p-4 shadow-xl rounded-l-2xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300"
          aria-label="Close settings"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-4">
          {/* Skeleton toggle */}
          <label className="flex items-center justify-between">
            <span className="text-sm">Show skeleton</span>
            <input
              type="checkbox"
              checked={showSkeleton}
              onChange={(e) => setShowSkeleton(e.target.checked)}
            />
          </label>
          {/* Confidence threshold */}
          <div>
            <label className="block text-sm mb-1">
              Confidence threshold: {confidence.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          {/* Mock mode (always on for now) */}
          <label className="flex items-center justify-between text-gray-500">
            <span className="text-sm">Mock recognizer (always on)</span>
            <input type="checkbox" checked disabled />
          </label>
          {/* Voice toggle */}
          <label className="flex items-center justify-between">
            <span className="text-sm">Voice output</span>
            <input
              type="checkbox"
              checked={voiceOn}
              onChange={(e) => setVoiceOn(e.target.checked)}
            />
          </label>
        </div>
      </aside>
    </div>
  );
};

export default SettingsDrawer;
