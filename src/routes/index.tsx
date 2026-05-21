import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Languages, Mic, MicOff, Sparkles, Volume2, Copy, Check, Trash2 } from "lucide-react";
import { translateText } from "@/lib/translate.functions";
import { LANGUAGES, getLang } from "@/lib/languages";
import { LanguagePicker } from "@/components/LanguagePicker";
import { WaveBars } from "@/components/WaveBars";
import { speak, useSpeechRecognition } from "@/hooks/useSpeech";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lingua — AI Voice Translator" },
      {
        name: "description",
        content:
          "Speak in one language, hear it in another. Real-time AI voice translation across 16 languages.",
      },
      { property: "og:title", content: "Lingua — AI Voice Translator" },
      { property: "og:description", content: "Real-time AI voice translation across 16 languages." },
    ],
  }),
});

type HistoryItem = {
  id: string;
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  ts: number;
};

function Index() {
  const translateFn = useServerFn(translateText);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const lastTranslated = useRef<string>("");

  const speechLang = useMemo(() => getLang(sourceLang).speechCode, [sourceLang]);
  const { transcript, interim, isListening, supported, start, stop, reset } =
    useSpeechRecognition(speechLang);

  const fullText = (transcript + " " + interim).trim();

  // Auto-translate when listening stops & we have new final text
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
      setHistory((h) => [item, ...h].slice(0, 20));
      // Auto-speak
      setTimeout(() => speak(res.translation, getLang(targetLang).speechCode), 150);
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
    lastTranslated.current = "";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/40 glow-primary">
              <Languages className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Lingua</h1>
              <p className="text-xs text-muted-foreground">AI Voice Translator</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <Sparkles className="h-3 w-3 text-primary" />
            Powered by Lovable AI
          </div>
        </header>

        {/* Hero copy */}
        <div className="mb-8 max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Speak freely. <span className="text-gradient">We translate.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real-time voice translation across 16 languages — tap the mic, talk, and hear the
            translation back instantly.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]">
          {/* Source card */}
          <div className="glass rounded-2xl p-6 md:col-span-3 md:row-span-2">
            <div className="mb-4 flex items-start justify-between gap-3">
              <LanguagePicker label="From" value={sourceLang} onChange={setSourceLang} />
              <button
                onClick={swapLangs}
                className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary hover:text-primary-foreground"
                aria-label="Swap languages"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
              <LanguagePicker label="To" value={targetLang} onChange={setTargetLang} />
            </div>

            {/* Mic button */}
            <div className="my-6 flex flex-col items-center">
              <button
                onClick={isListening ? stop : start}
                disabled={!supported}
                className={[
                  "group relative flex h-28 w-28 items-center justify-center rounded-full transition-all",
                  isListening
                    ? "bg-gradient-to-br from-primary to-primary/60 scale-105"
                    : "bg-secondary hover:bg-primary/80",
                  !supported && "opacity-50 cursor-not-allowed",
                ].join(" ")}
                aria-label={isListening ? "Stop recording" : "Start recording"}
              >
                {isListening && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                )}
                {isListening ? (
                  <MicOff className="relative h-10 w-10 text-primary-foreground" />
                ) : (
                  <Mic className="relative h-10 w-10 text-foreground group-hover:text-primary-foreground" />
                )}
              </button>
              <div className="mt-4 h-8">
                <WaveBars active={isListening} />
              </div>
              <p className="text-xs text-muted-foreground">
                {!supported
                  ? "Voice recognition unsupported — try Chrome or Edge"
                  : isListening
                    ? "Listening…"
                    : "Tap to start speaking"}
              </p>
            </div>

            {/* Transcript */}
            <div className="min-h-[120px] rounded-xl border border-border bg-background/40 p-4">
              <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                You said
              </div>
              <p className="text-lg leading-relaxed">
                {fullText || (
                  <span className="text-muted-foreground/60">Your words will appear here…</span>
                )}
              </p>
            </div>

            {fullText && (
              <button
                onClick={clearAll}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Translation card */}
          <div className="glass rounded-2xl p-6 md:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getLang(targetLang).flag}</span>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Translation
                  </div>
                  <div className="text-sm font-medium">{getLang(targetLang).name}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
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

            <div className="min-h-[180px] rounded-xl bg-background/40 p-4">
              {isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Translating…
                </div>
              ) : translation ? (
                <p className="text-2xl font-medium leading-relaxed text-foreground">
                  {translation}
                </p>
              ) : (
                <p className="text-muted-foreground/60">
                  Translation will appear here after you stop speaking.
                </p>
              )}
              {error && (
                <p className="mt-3 text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>

          {/* Stats / info card */}
          <div className="glass rounded-2xl p-6 md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Languages
            </div>
            <div className="mt-2 text-4xl font-semibold">{LANGUAGES.length}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Supported worldwide, with native voice playback.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {LANGUAGES.slice(0, 12).map((l) => (
                <span key={l.code} className="text-xl" title={l.name}>
                  {l.flag}
                </span>
              ))}
            </div>
          </div>

          {/* History card */}
          <div className="glass rounded-2xl p-6 md:col-span-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Session</div>
            <div className="mt-2 text-4xl font-semibold">{history.length}</div>
            <p className="mt-1 text-sm text-muted-foreground">Translations this session.</p>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <section className="mt-10">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Recent translations
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="group glass rounded-xl p-4 transition hover:border-primary/40"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{getLang(h.sourceLang).flag}</span>
                    <ArrowLeftRight className="h-3 w-3" />
                    <span>{getLang(h.targetLang).flag}</span>
                    <span className="ml-auto">
                      {new Date(h.ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{h.source}</p>
                  <p className="mt-1 line-clamp-2 font-medium">{h.target}</p>
                  <button
                    onClick={() => speak(h.target, getLang(h.targetLang).speechCode)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100"
                  >
                    <Volume2 className="h-3 w-3" /> Replay
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Built with Lovable · Voice recognition runs on your device
        </footer>
      </div>
    </div>
  );
}
