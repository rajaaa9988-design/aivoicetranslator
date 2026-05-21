import { Sparkles } from "lucide-react";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-3 pt-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/40 glow-primary">
          <span className="text-lg font-bold text-primary-foreground">L</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground sm:flex">
        <Sparkles className="h-3 w-3 text-primary" />
        AI-powered
      </div>
    </header>
  );
}
