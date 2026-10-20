// src/components/ControlBar.tsx
import React from "react";
import { Mic, MicOff, Download, Speaker, RefreshCw, TextCursorInput } from "lucide-react";

interface Props {
  onSpeak: () => void;
  onClear: () => void;
  onDownload: () => void;
  onToggleLarge: () => void;
  onStartSTT: () => void;
  onStopSTT: () => void;
  sttText: string;
}

const ControlBar: React.FC<Props> = ({
  onSpeak,
  onClear,
  onDownload,
  onToggleLarge,
  onStartSTT,
  onStopSTT,
  sttText,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
      <button
        onClick={onSpeak}
        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        aria-label="Speak sentence"
      >
        <Speaker size={20} /> Speak
      </button>
      <button
        onClick={onClear}
        className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300"
        aria-label="Clear captions"
      >
        <RefreshCw size={20} /> Clear
      </button>
      <button
        onClick={onDownload}
        className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300"
        aria-label="Download transcript"
      >
        <Download size={20} /> Download
      </button>
      <button
        onClick={onToggleLarge}
        className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300"
        aria-label="Toggle large text"
      >
        <TextCursorInput size={20} /> Large Text
      </button>
      {/* STT controls */}
      <button
        onClick={onStartSTT}
        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
        aria-label="Start listening"
      >
        <Mic size={20} /> Listen
      </button>
      <button
        onClick={onStopSTT}
        className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        aria-label="Stop listening"
      >
        <MicOff size={20} /> Stop
      </button>
      {/* Show live STT transcription */}
      <div className="flex-1 min-w-[150px] text-sm italic text-gray-600 dark:text-gray-300">
        {sttText || ""}
      </div>
    </div>
  );
};

export default ControlBar;
