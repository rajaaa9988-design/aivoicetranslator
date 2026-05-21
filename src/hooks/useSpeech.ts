import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

export function useSpeechRecognition(lang: string) {
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec: SpeechRecognitionLike = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;
    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {}
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    setTranscript("");
    setInterim("");
    rec.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) finalText += text;
        else interimText += text;
      }
      if (finalText) setTranscript((prev) => (prev + " " + finalText).trim());
      setInterim(interimText);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    try {
      rec.start();
      setIsListening(true);
    } catch {
      // already started
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterim("");
  }, []);

  return { transcript, interim, isListening, supported, start, stop, reset };
}

export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}
