// Local persistence for history, favorites, and settings.
// Stays on-device; no backend required.

export type HistoryItem = {
  id: string;
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  ts: number;
  favorite?: boolean;
};

export type Settings = {
  rate: number;
  voiceGender: "female" | "male" | "auto";
  autoSpeak: boolean;
  defaultSource: string;
  defaultTarget: string;
};

const HISTORY_KEY = "linguavoice.history.v1";
const SETTINGS_KEY = "linguavoice.settings.v1";

const DEFAULTS: Settings = {
  rate: 1,
  voiceGender: "female",
  autoSpeak: true,
  defaultSource: "en",
  defaultTarget: "mr",
};

const isBrowser = () => typeof window !== "undefined";

export function getHistory(): HistoryItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function setHistory(items: HistoryItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 200)));
  window.dispatchEvent(new Event("linguavoice:history"));
}

export function addHistory(item: HistoryItem) {
  const current = getHistory();
  setHistory([item, ...current]);
}

export function toggleFavorite(id: string) {
  const items = getHistory().map((h) =>
    h.id === id ? { ...h, favorite: !h.favorite } : h,
  );
  setHistory(items);
}

export function deleteHistory(id: string) {
  setHistory(getHistory().filter((h) => h.id !== id));
}

export function clearHistory() {
  setHistory([]);
}

export function getSettings(): Settings {
  if (!isBrowser()) return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function setSettings(next: Settings) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("linguavoice:settings"));
}
