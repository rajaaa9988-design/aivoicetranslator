import { useCallback, useEffect, useRef, useState } from "react";
import { getSettings } from "@/lib/storage";

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

/** Try to pick the best voice for a language code, honoring gender preference. */
function pickVoice(lang: string, gender: "female" | "male" | "auto"): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  const base = lang.split("-")[0].toLowerCase();
  const langMatch = voices.filter(
    (v) => v.lang.toLowerCase() === lang.toLowerCase() || v.lang.toLowerCase().startsWith(base),
  );
  if (!langMatch.length) return voices[0];

  if (gender === "auto") return langMatch[0];

  const femaleHints = /female|woman|samantha|victoria|karen|tessa|allison|zira|google.*?\bfemale\b|google.*?\b(?:hindi|marathi|उ?मा|aditi)\b/i;
  const maleHints = /male|man|daniel|alex|fred|david|google.*?\bmale\b|ravi|hemant/i;
  const wanted = gender === "female" ? femaleHints : maleHints;
  return langMatch.find((v) => wanted.test(v.name)) ?? langMatch[0];
}

export function speak(text: string, lang: string, overrides?: { rate?: number; gender?: "female" | "male" | "auto" }) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  const s = getSettings();
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = overrides?.rate ?? s.rate;
  utter.pitch = 1;
  const voice = pickVoice(lang, overrides?.gender ?? s.voiceGender);
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}
