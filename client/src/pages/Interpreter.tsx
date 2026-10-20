
import React, { useEffect, useState } from "react";
import WebcamCanvas from "../components/WebcamCanvas";
import CaptionPanel from "../components/CaptionPanel";
import ControlBar from "../components/ControlBar";
import SettingsDrawer from "../components/SettingsDrawer";
import StatusChip from "../components/StatusChip";
import { getRecognizer, Recognizer } from "../lib/recognizer";
import { preprocessHands } from "../lib/preprocess";
import { postprocess } from "../lib/postprocess";
import { useSpeechSynthesis } from "../hooks/useSpeech";
import { useSTT } from "../hooks/useSTT";

type Landmark = { x: number; y: number; z: number };

type DetectedHand = {
  landmarks: readonly Landmark[];
  handedness: string;
};

const Interpreter: React.FC = () => {
  const [recognizer, setRecognizer] = useState<Recognizer | null>(null);
  const [rawSigns, setRawSigns] = useState<string[]>([]);
  const [sentence, setSentence] = useState("");
  const [status, setStatus] = useState<
    "ready" | "no-hands" | "recognizing" | "error"
  >("ready");
  const [showSettings, setShowSettings] = useState(false);

  const { speak } = useSpeechSynthesis();
  const { startListening, stopListening, transcription } = useSTT();

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const r = getRecognizer();
        await r.init();

        if (active) {
          setRecognizer(r);
          console.log("SignBridge Python recognizer initialized.");
        }
      } catch (error) {
        console.error("Could not initialize Python recognizer:", error);
        if (active) setStatus("error");
      }
    };

    void init();

    return () => {
      active = false;
    };
  }, []);

  const smoothPhrase = async (gloss: string[]) => {
    if (gloss.length === 0) return;

    const response = await fetch("/api/smooth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gloss }),
    });

    if (!response.ok) {
      throw new Error(`Phrase API error: ${response.status}`);
    }

    const data = await response.json();

    setSentence(data.sentence ?? "");
    setRawSigns([]);

    if (!data.fallback && data.sentence) {
      speak(data.sentence);
    }
  };

  const handleHands = async (hands: readonly DetectedHand[]) => {
    if (hands.length === 0) {
      setStatus("no-hands");
      return;
    }

    if (!recognizer) return;

    try {
      setStatus("recognizing");

      const features = preprocessHands(hands);
      const { label, confidence } = await recognizer.predict(features);

      // Debug output: inspect this in the browser's Developer Tools Console.
      console.log("SignBridge prediction:", label, confidence);

      if (
        !label ||
        label === "IDLE" ||
        label === "COLLECTING"
      ) {
        return;
      }

      if (label === "Uncertain") {
        console.warn("SignBridge prediction is below the confidence threshold.");
        return;
      }

      const result = postprocess(label, confidence);

      if (!result) {
        console.warn("Postprocessor rejected prediction:", label, confidence);
        return;
      }

      if (result.type === "sign") {
        setRawSigns((previous) => [...previous, result.label]);
      } else if (result.type === "phraseEnd") {
        await smoothPhrase([...rawSigns, result.label]);
      }
    } catch (error) {
      console.error("Sign recognition failed:", error);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status !== "no-hands" || rawSigns.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      void smoothPhrase(rawSigns).catch((error) => {
        console.error("Could not finalize phrase:", error);
        setStatus("error");
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [status, rawSigns]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <WebcamCanvas
          showSkeleton={showSettings}
          onHands={handleHands}
        />

        <StatusChip status={status} />

        <button
          onClick={() => setShowSettings((previous) => !previous)}
          className="absolute top-2 right-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
          aria-label="Toggle Settings"
        >
          ⚙️
        </button>
      </div>

      <div className="flex flex-col h-full">
        <CaptionPanel
          raw={rawSigns.join(" ")}
          sentence={sentence}
        />

        <div className="mt-auto">
          <ControlBar
            onSpeak={() => speak(sentence)}
            onClear={() => {
              setRawSigns([]);
              setSentence("");
            }}
            onDownload={() => {
              const blob = new Blob(
                [JSON.stringify({ raw: rawSigns, sentence }, null, 2)],
                { type: "application/json" }
              );

              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");

              link.href = url;
              link.download = "transcript.json";
              link.click();

              URL.revokeObjectURL(url);
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

      {showSettings && (
        <SettingsDrawer
          onClose={() => setShowSettings(false)}
          recognizer={recognizer}
        />
      )}
    </div>
  );
};

export default Interpreter;
