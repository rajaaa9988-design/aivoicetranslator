import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { LanguagePicker } from "@/components/LanguagePicker";
import { getSettings, setSettings, type Settings } from "@/lib/storage";
import { speak } from "@/hooks/useSpeech";
import { getLang } from "@/lib/languages";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — LinguaVoice AI" },
      { name: "description", content: "Customize voice, speech speed, default languages, and playback behavior." },
    ],
  }),
});

function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    setS(getSettings());
  }, []);

  if (!s) return null;

  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next);
    setSettings(next);
  };

  const sample = `Hello, this is a sample at speed ${s.rate.toFixed(1)}x.`;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <AppHeader title="Settings" subtitle="Voice, speed & defaults" />

      {/* Voice */}
      <section className="glass mb-4 rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-semibold">Voice</h2>
        <div className="flex gap-2">
          {(["female", "male", "auto"] as const).map((g) => (
            <button
              key={g}
              onClick={() => update({ voiceGender: g })}
              className={[
                "flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition",
                s.voiceGender === g
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground",
              ].join(" ")}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Voice availability depends on your device. We pick the best match per language.
        </p>
      </section>

      {/* Rate */}
      <section className="glass mb-4 rounded-2xl p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Speech speed</h2>
          <span className="text-xs text-muted-foreground">{s.rate.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={s.rate}
          onChange={(e) => update({ rate: parseFloat(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>Slow</span>
          <span>Normal</span>
          <span>Fast</span>
        </div>
        <button
          onClick={() => speak(sample, "en-US", { rate: s.rate, gender: s.voiceGender })}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs transition hover:bg-primary hover:text-primary-foreground"
        >
          <Volume2 className="h-3 w-3" /> Preview
        </button>
      </section>

      {/* Auto-speak */}
      <section className="glass mb-4 rounded-2xl p-5">
        <label className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Auto-speak translations</h2>
            <p className="text-xs text-muted-foreground">
              Play the translation aloud automatically.
            </p>
          </div>
          <button
            onClick={() => update({ autoSpeak: !s.autoSpeak })}
            className={[
              "relative h-6 w-11 rounded-full transition",
              s.autoSpeak ? "bg-primary" : "bg-secondary",
            ].join(" ")}
            aria-pressed={s.autoSpeak}
          >
            <span
              className={[
                "absolute top-0.5 h-5 w-5 rounded-full bg-background transition",
                s.autoSpeak ? "left-5" : "left-0.5",
              ].join(" ")}
            />
          </button>
        </label>
      </section>

      {/* Defaults */}
      <section className="glass mb-4 rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-semibold">Default languages</h2>
        <div className="grid grid-cols-2 gap-3">
          <LanguagePicker
            label="From"
            value={s.defaultSource}
            onChange={(c) => update({ defaultSource: c })}
          />
          <LanguagePicker
            label="To"
            value={s.defaultTarget}
            onChange={(c) => update({ defaultTarget: c })}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          New sessions start with {getLang(s.defaultSource).name} → {getLang(s.defaultTarget).name}.
        </p>
      </section>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        LinguaVoice AI · v1.0 · Settings saved on this device
      </p>
    </div>
  );
}
