// src/hooks/useSTT.ts
import { useEffect, useRef, useState } from "react";
/**
 * Hook that wraps the Web Speech API for speech‑to‑text.
 * Falls back gracefully if the API is unavailable.
 */
export function useSTT() {
  const [supported, setSupported] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        let interim = "";
        for (let i = event.resultIndex; i < results.length; ++i) {
          const result = results[i];
          if (result.isFinal) {
            setTranscript((prev) => prev + result[0].transcript + " ");
          } else {
            interim += result[0].transcript;
          }
        }
        // Show interim text as well (optional UI can display it separately)
        // we merge it into transcript for simplicity.
        setTranscript((prev) => prev + interim);
      };
      recognitionRef.current = rec;
    }
  }, []);

  const start = () => {
    if (supported && recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stop = () => {
    if (supported && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return { startListening: start, stopListening: stop, transcription: transcript, supported };
}
