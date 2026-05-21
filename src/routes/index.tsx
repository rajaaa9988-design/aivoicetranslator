import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Mic, MicOff, Volume2, Copy, Check, Trash2, Star } from "lucide-react";
import { translateText } from "@/lib/translate.functions";
import { LANGUAGES, getLang, DEMO_PHRASES } from "@/lib/languages";
import { LanguagePicker } from "@/components/LanguagePicker";
import { WaveBars } from "@/components/WaveBars";
import { AppHeader } from "@/components/AppHeader";
import { speak, useSpeechRecognition } from "@/hooks/useSpeech";
import { addHistory, getSettings, toggleFavorite, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "LinguaVoice AI — Real-time Voice Translator" },
      {
        name: "description",
        content:
          "Speak in one language, hear it instantly in another. AI voice translation across English, Hindi, Marathi, Spanish, French, German and more.",
      },
      { property: "og:title", content: "LinguaVoice AI" },
      { property: "og:description", content: "Real-time AI voice translation for 15+ languages." },
    ],
  }),
});

function Index() {
  const translateFn = useServerFn(translateText);
  const settingsInit = typeof window !== "undefined" ? getSettings() : null;
  const [sourceLang, setSourceLang] = useState(settingsInit?.defaultSource ?? "en");
  const [targetLang, setTargetLang] = useState(settingsInit?.defaultTarget ?? "mr");
  const [translation, setTranslation] = useState("");
  const [lastItem, setLastItem] = useState<HistoryItem | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const lastTranslated = useRef<string>("");

  const speechLang = useMemo(() => getLang(sourceLang).speechCode, [sourceLang]);
  const { transcript, interim, isListening, supported, start, stop, reset } =
    useSpeechRecognition(speechLang);

  const fullText = (transcript + " " + interim).trim();

  useEffect(() => {
    if (isListening) return;
    const text = transcript.trim();
    if (!text || text === lastTranslated.current) return;
    void runTranslate(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  const runTranslate = async (text: string) => {
    setError(null);
    setIsTranslating(true);
    lastTranslated.current = text;
    try {
      const res = await translateFn({
        data: { text, sourceLang: getLang(sourceLang).name, targetLang: getLang(targetLang).name },
      });
      setTranslation(res.translation);
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        source: text,
        target: res.translation,
        sourceLang,
        targetLang,
        ts: Date.now(),
      };
      addHistory(item);
      setLastItem(item);
      const s = getSettings();
      if (s.autoSpeak) {
        setTimeout(() => speak(res.translation, getLang(targetLang).speechCode), 150);
      }
    } catch (e: any) {
      setError(e?.message ?? "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setTranslation("");
    setLastItem(null);
    reset();
  };

  const copy = async () => {
    if (!translation) return;
    await navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearAll = () => {
    reset();
    setTranslation("");
    setLastItem(null);
    lastTranslated.current = "";
  };

  const tryDemo = async (text: string, lang: string) => {
    setSourceLang(lang);
    lastTranslated.current = "";
    // Translate from a known string directly
    await runTranslate(text);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <AppHeader title="LinguaVoice AI" subtitle="Tap. Speak. Translate." />

      {/* Language bar */}
      <div className="glass mb-4 flex items-end gap-2 rounded-2xl p-3">
        <div className="flex-1">
          <LanguagePicker label="From" value={sourceLang} onChange={setSourceLang} />
        </div>
        <button
          onClick={swapLangs}
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary hover:text-primary-foreground"
          aria-label="Swap languages"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <LanguagePicker label="To" value={targetLang} onChange={setTargetLang} />
        </div>
      </div>

      {/* Mic */}
      <div className="glass mb-4 rounded-2xl p-6">
        <div className="flex flex-col items-center">
          <button
            onClick={isListening ? stop : start}
            disabled={!supported}
            className={[
              "group relative flex h-32 w-32 items-center justify-center rounded-full transition-all",
              isListening
                ? "bg-gradient-to-br from-primary to-primary/60 scale-105 glow-primary"
                : "bg-secondary hover:bg-primary/80",
              !supported && "opacity-50 cursor-not-allowed",
            ].join(" ")}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening && (
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
            )}
            {isListening ? (
              <MicOff className="relative h-12 w-12 text-primary-foreground" />
            ) : (
              <Mic className="relative h-12 w-12 text-foreground group-hover:text-primary-foreground" />
            )}
          </button>
          <div className="mt-4 h-8">
            <WaveBars active={isListening} />
          </div>
          <p className="text-xs text-muted-foreground">
            {!supported
              ? "Voice recognition needs Chrome, Edge, or Safari"
              : isListening
                ? "Listening…"
                : "Tap to start speaking"}
          </p>
        </div>

        {/* Transcript */}
        <div className="mt-5 min-h-[80px] rounded-xl border border-border bg-background/40 p-4">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            You said · {getLang(sourceLang).nativeName}
          </div>
          <p className="text-base leading-relaxed">
            {fullText || (
              <span className="text-muted-foreground/60">Your words will appear here…</span>
            )}
          </p>
        </div>

        {fullText && (
          <button
            onClick={clearAll}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Translation */}
      <div className="glass mb-4 rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getLang(targetLang).flag}</span>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Translation
              </div>
              <div className="text-sm font-medium">{getLang(targetLang).nativeName}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {lastItem && (
              <button
                onClick={() => {
                  toggleFavorite(lastItem.id);
                  setLastItem({ ...lastItem, favorite: !lastItem.favorite });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary/20"
                aria-label="Favorite"
              >
                <Star
                  className={[
                    "h-4 w-4",
                    lastItem.favorite ? "fill-primary text-primary" : "",
                  ].join(" ")}
                />
              </button>
            )}
            <button
              onClick={() => speak(translation, getLang(targetLang).speechCode)}
              disabled={!translation}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
              aria-label="Play translation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              onClick={copy}
              disabled={!translation}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
              aria-label="Copy translation"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="min-h-[120px] rounded-xl bg-background/40 p-4">
          {isTranslating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Translating…
            </div>
          ) : translation ? (
            <p className="text-xl font-medium leading-relaxed text-foreground">{translation}</p>
          ) : (
            <p className="text-muted-foreground/60">
              Translation will appear here after you stop speaking.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </div>

      {/* Demo phrases */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Try a phrase
          </div>
          <Link to="/conversation" className="text-xs text-primary hover:underline">
            Conversation mode →
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {DEMO_PHRASES.map((d) => (
            <button
              key={d.text}
              onClick={() => tryDemo(d.text, d.lang)}
              className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-3 py-2.5 text-left text-sm transition hover:border-primary/40 hover:bg-background/60"
            >
              <span className="flex items-center gap-2">
                <span>{getLang(d.lang).flag}</span>
                <span>{d.text}</span>
              </span>
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <span
              key={l.code}
              className="rounded-full border border-border bg-secondary/30 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {l.flag} {l.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
