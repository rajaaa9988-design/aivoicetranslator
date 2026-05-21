import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Search, Star, Trash2, Volume2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { getLang } from "@/lib/languages";
import { speak } from "@/hooks/useSpeech";
import {
  clearHistory,
  deleteHistory,
  getHistory,
  toggleFavorite,
  type HistoryItem,
} from "@/lib/storage";

export const Route = createFileRoute("/history")({
  component: History,
  head: () => ({
    meta: [
      { title: "History — LinguaVoice AI" },
      { name: "description", content: "Search and replay your past translations. Mark favorites for quick access." },
    ],
  }),
});

function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    const refresh = () => setItems(getHistory());
    refresh();
    window.addEventListener("linguavoice:history", refresh);
    return () => window.removeEventListener("linguavoice:history", refresh);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((h) => {
      if (filter === "favorites" && !h.favorite) return false;
      if (!q) return true;
      return (
        h.source.toLowerCase().includes(q) ||
        h.target.toLowerCase().includes(q) ||
        getLang(h.sourceLang).name.toLowerCase().includes(q) ||
        getLang(h.targetLang).name.toLowerCase().includes(q)
      );
    });
  }, [items, query, filter]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <AppHeader title="History" subtitle={`${items.length} saved translations`} />

      <div className="glass mb-3 flex items-center gap-2 rounded-2xl px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search translations…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-full border border-border bg-secondary/30 p-1">
          {(["all", "favorites"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              ].join(" ")}
            >
              {f === "all" ? "All" : "★ Favorites"}
            </button>
          ))}
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all history?")) clearHistory();
            }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "No translations yet. Start speaking on the Translate tab."
            : "No matches for your search."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((h) => (
            <div key={h.id} className="glass rounded-xl p-3">
              <div className="mb-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{getLang(h.sourceLang).flag}</span>
                <ArrowLeftRight className="h-3 w-3" />
                <span>{getLang(h.targetLang).flag}</span>
                <span className="ml-auto">
                  {new Date(h.ts).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{h.source}</p>
              <p className="mt-1 font-medium">{h.target}</p>
              <div className="mt-2 flex items-center gap-1">
                <button
                  onClick={() => speak(h.target, getLang(h.targetLang).speechCode)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary hover:text-primary-foreground"
                  aria-label="Play"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toggleFavorite(h.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-primary/20"
                  aria-label="Favorite"
                >
                  <Star className={["h-3.5 w-3.5", h.favorite ? "fill-primary text-primary" : ""].join(" ")} />
                </button>
                <button
                  onClick={() => deleteHistory(h.id)}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/40 transition hover:bg-destructive/20 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
