// src/pages/Interpreter.tsx
import React, { useEffect, useState } from "react";
import WebcamCanvas from "../components/WebcamCanvas";
import CaptionPanel from "../components/CaptionPanel";
import ControlBar from "../components/ControlBar";
import SettingsDrawer from "../components/SettingsDrawer";
import StatusChip from "../components/StatusChip";
import { getRecognizer, Recognizer } from "../lib/recognizer";
import { FrameBuffer } from "../lib/buffer";
import { preprocessHands } from "../lib/preprocess";
import { postprocess } from "../lib/postprocess";
import { useSpeechSynthesis } from "../hooks/useSpeech";
import { useSTT } from "../hooks/useSTT";

const Interpreter: React.FC = () => {
  const [recognizer, setRecognizer] = useState<Recognizer | null>(null);
  const bufferRef = useState(() => new FrameBuffer(30))[0];
  const [rawSigns, setRawSigns] = useState<string[]>([]);
  const [sentence, setSentence] = useState<string>("");
  const [status, setStatus] = useState<"ready" | "no-hands" | "recognizing" | "error">("ready");
  const [showSettings, setShowSettings] = useState(false);
  const { speak } = useSpeechSynthesis();
  const { startListening, stopListening, transcription } = useSTT();

  // Initialise recognizer once
  useEffect(() => {
    const init = async () => {
      const r = getRecognizer();
      await r.init();
      setRecognizer(r);
    };
    init();
  }, []);

  // Handle hand landmarks each frame
  const handleHands = async (hands: readonly (readonly { x: number; y: number; z: number }[])[]) => {
    try {
      if (hands.length === 0) {
        setStatus("no-hands");
      } else {
        setStatus("recognizing");
      }
      const vec = preprocessHands(hands);
      bufferRef.push(vec);
      if (!recognizer) return;
      const windowVec = bufferRef.getWindow();
      const { label, confidence } = await recognizer.predict(windowVec);
      const result = postprocess(label, confidence);
      if (result?.type === "sign") {
        setRawSigns((prev) => [...prev, result.label]);
      }
      if (result?.type === "phraseEnd") {
        const gloss = rawSigns.concat(result.label);
        const resp = await fetch("/api/smooth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gloss }),
        });
        const data = await resp.json();
        setSentence(data.sentence);
        setRawSigns([]);
        if (!data.fallback) speak(data.sentence);
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  // Cool‑down: finalize phrase after 1.2 s of no hands
  useEffect(() => {
    const timer = setInterval(() => {
      if (status === "no-hands" && rawSigns.length > 0) {
        (async () => {
          const resp = await fetch("/api/smooth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gloss: rawSigns }),
          });
          const data = await resp.json();
          setSentence(data.sentence);
          setRawSigns([]);
          if (!data.fallback) speak(data.sentence);
        })();
      }
    }, 1200);
    return () => clearInterval(timer);
  }, [status, rawSigns, speak]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Left column – webcam + optional skeleton */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <WebcamCanvas showSkeleton={showSettings} onHands={handleHands} />
        <StatusChip status={status} />
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="absolute top-2 right-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
          aria-label="Toggle Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Right column – captions and controls */}
      <div className="flex flex-col h-full">
        <CaptionPanel raw={rawSigns.join(" ")} sentence={sentence} />
        <div className="mt-auto">
          <ControlBar
            onSpeak={() => speak(sentence)}
            onClear={() => {
              setRawSigns([]);
              setSentence("");
            }}
            onDownload={() => {
              const blob = new Blob([JSON.stringify({ raw: rawSigns, sentence }, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "transcript.json";
              a.click();
            }}
            onToggleLarge={() => {
              document.documentElement.classList.toggle("text-xl");
            }}
            onStartSTT={startListening}
            onStopSTT={stopListening}
            sttText={transcription}
          />
        </div>
      </div>

      {showSettings && <SettingsDrawer onClose={() => setShowSettings(false)} recognizer={recognizer} />}
    </div>
  );
};

export default Interpreter;
