import { LANGUAGES, type Language } from "@/lib/languages";
import { Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguagePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-left text-sm font-medium transition hover:bg-secondary/70"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{current.flag}</span>
          <span>{current.name}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-2xl backdrop-blur">
          {LANGUAGES.map((l: Language) => (
            <button
              key={l.code}
              onClick={() => {
                onChange(l.code);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent/30"
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </span>
              {l.code === value && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
