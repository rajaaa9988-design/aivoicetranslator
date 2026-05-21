import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Mic, MicOff, Volume2 } from "lucide-react";
import { translateText } from "@/lib/translate.functions";
import { getLang } from "@/lib/languages";
import { LanguagePicker } from "@/components/LanguagePicker";
import { AppHeader } from "@/components/AppHeader";
import { speak, useSpeechRecognition } from "@/hooks/useSpeech";
import { addHistory, getSettings, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/conversation")({
  component: Conversation,
  head: () => ({
    meta: [
      { title: "Conversation Mode — LinguaVoice AI" },
      {
        name: "description",
        content:
          "Two-person live translation. Each speaker taps their side and the app translates between two languages in real time.",
      },
    ],
  }),
});

type Bubble = {
  id: string;
  side: "a" | "b";
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  ts: number;
};

function Conversation() {
  const translateFn = useServerFn(translateText);
  const [langA, setLangA] = useState("mr");
  const [langB, setLangB] = useState("en");
  const [active, setActive] = useState<"a" | "b" | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const lastTranscript = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fromLang = active === "a" ? langA : langB;
  const toLang = active === "a" ? langB : langA;
  const speechLang = useMemo(() => getLang(fromLang).speechCode, [fromLang]);

  const { transcript, interim, isListening, supported, start, stop, reset } =
    useSpeechRecognition(speechLang);

  // When the listener stops, translate and store
  useEffect(() => {
    if (isListening || !active) return;
    const text = transcript.trim();
    if (!text || text === lastTranscript.current) return;
    lastTranscript.current = text;

    const side = active;
    const src = side === "a" ? langA : langB;
    const tgt = side === "a" ? langB : langA;

    (async () => {
      try {
        const res = await translateFn({
          data: {
            text,
            sourceLang: getLang(src).name,
            targetLang: getLang(tgt).name,
          },
        });
        const bubble: Bubble = {
          id: crypto.randomUUID(),
          side,
          source: text,
          target: res.translation,
          sourceLang: src,
          targetLang: tgt,
          ts: Date.now(),
        };
        setBubbles((b) => [...b, bubble]);
        addHistory({ ...bubble, id: bubble.id } as HistoryItem);
        const s = getSettings();
        if (s.autoSpeak) {
          setTimeout(() => speak(res.translation, getLang(tgt).speechCode), 120);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setActive(null);
        reset();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles.length]);

  const toggle = (side: "a" | "b") => {
    if (active === side && isListening) {
      stop();
      return;
    }
    if (isListening) stop();
    lastTranscript.current = "";
    setActive(side);
    setTimeout(() => start(), 50);
  };

  const swapAll = () => {
    setLangA(langB);
    setLangB(langA);
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col px-4 pb-32">
      <AppHeader title="Conversation" subtitle="Two-way live translation" />

      {/* Language bar */}
      <div className="glass mb-4 flex items-end gap-2 rounded-2xl p-3">
        <div className="flex-1">
          <LanguagePicker label="Person A" value={langA} onChange={setLangA} />
        </div>
        <button
          onClick={swapAll}
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary hover:text-primary-foreground"
          aria-label="Swap"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <LanguagePicker label="Person B" value={langB} onChange={setLangB} />
        </div>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="glass mb-4 flex-1 overflow-y-auto rounded-2xl p-4"
        style={{ minHeight: "320px", maxHeight: "55vh" }}
      >
        {bubbles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <p>Tap a side below to start.</p>
            <p className="mt-1 text-xs">
              Person A speaks {getLang(langA).nativeName}, the app replies in {getLang(langB).nativeName} — and vice versa.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bubbles.map((b) => (
              <div
                key={b.id}
                className={["flex", b.side === "a" ? "justify-start" : "justify-end"].join(" ")}
              >
                <div
                  className={[
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                    b.side === "a"
                      ? "rounded-bl-sm bg-secondary/60 text-foreground"
                      : "rounded-br-sm bg-primary/90 text-primary-foreground",
                  ].join(" ")}
                >
                  <div className="text-[10px] opacity-70">
                    {getLang(b.sourceLang).flag} {b.source}
                  </div>
                  <div className="mt-0.5 font-medium">
                    {getLang(b.targetLang).flag} {b.target}
                  </div>
                  <button
                    onClick={() => speak(b.target, getLang(b.targetLang).speechCode)}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100"
                  >
                    <Volume2 className="h-3 w-3" /> replay
                  </button>
                </div>
              </div>
            ))}
            {active && isListening && (
              <div
                className={["flex", active === "a" ? "justify-start" : "justify-end"].join(" ")}
              >
                <div className="rounded-2xl bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                  {interim || "Listening…"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dual mic */}
      <div className="grid grid-cols-2 gap-3">
        {(["a", "b"] as const).map((side) => {
          const lang = side === "a" ? langA : langB;
          const isActive = active === side && isListening;
          return (
            <button
              key={side}
              onClick={() => toggle(side)}
              disabled={!supported}
              className={[
                "glass relative flex flex-col items-center gap-2 rounded-2xl p-4 transition",
                isActive ? "ring-2 ring-primary glow-primary" : "",
                !supported && "opacity-50",
              ].join(" ")}
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Person {side.toUpperCase()}
              </span>
              <div
                className={[
                  "flex h-14 w-14 items-center justify-center rounded-full transition",
                  isActive ? "bg-gradient-to-br from-primary to-primary/60" : "bg-secondary",
                ].join(" ")}
              >
                {isActive ? (
                  <MicOff className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </div>
              <span className="text-xs font-medium">
                {getLang(lang).flag} {getLang(lang).nativeName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
