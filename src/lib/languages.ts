export type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // BCP-47 for SpeechRecognition / SpeechSynthesis
};

// Priority languages from product spec first, then a wider set
export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", speechCode: "en-US" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", speechCode: "hi-IN" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", speechCode: "mr-IN" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", speechCode: "es-ES" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", speechCode: "fr-FR" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", speechCode: "de-DE" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", speechCode: "it-IT" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", speechCode: "pt-PT" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", speechCode: "ja-JP" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", speechCode: "ko-KR" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", speechCode: "zh-CN" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", speechCode: "ar-SA" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", speechCode: "ru-RU" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", speechCode: "nl-NL" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", speechCode: "tr-TR" },
];

export const getLang = (code: string) =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

// Demo phrases for the home screen
export const DEMO_PHRASES: Array<{ text: string; lang: string }> = [
  { text: "तुमचं नाव काय आहे?", lang: "mr" },
  { text: "मला पाणी पाहिजे.", lang: "mr" },
  { text: "तू कसा आहेस?", lang: "mr" },
  { text: "आप कैसे हैं?", lang: "hi" },
  { text: "¿Cómo estás hoy?", lang: "es" },
];
