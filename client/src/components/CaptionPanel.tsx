// src/components/CaptionPanel.tsx
import React from "react";
/**
 * Displays the raw sign stream and the smoothed sentence.
 * The raw captions are shown instantly; the sentence updates when the
 * backend returns a smoothed result.
 */
interface Props {
  raw: string; // space‑separated raw signs
  sentence: string; // smoothed sentence from backend
}

const CaptionPanel: React.FC<Props> = ({ raw, sentence }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow space-y-2">
      <div className="text-sm text-gray-500 dark:text-gray-400">Raw signs</div>
      <div
        className="text-xl font-medium text-gray-800 dark:text-gray-100 break-words"
        aria-live="polite"
      >
        {raw || "—"}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">Sentence</div>
      <div
        className="text-lg font-semibold text-indigo-600 dark:text-indigo-400"
        aria-live="polite"
      >
        {sentence || "—"}
      </div>
    </div>
  );
};

export default CaptionPanel;
