// src/hooks/useSpeech.ts
import { useEffect, useState } from "react";
/**
 * Simple hook that wraps the Web Speech API (speechSynthesis).
 * If Azure Speech token is configured, you could instantiate the Azure SDK
 * here – for now we just fall back to the native browser TTS.
 */
export function useSpeechSynthesis() {
  const [available, setAvailable] = useState<boolean>(false);

  useEffect(() => {
    setAvailable("speechSynthesis" in window);
  }, []);

  const speak = (text: string) => {
    if (!available) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  };

  return { speak, available };
}
