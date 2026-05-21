export type Language = {
  code: string;
  name: string;
  flag: string;
  speechCode: string; // BCP-47 for SpeechRecognition / SpeechSynthesis
};

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸", speechCode: "en-US" },
  { code: "es", name: "Spanish", flag: "🇪🇸", speechCode: "es-ES" },
  { code: "fr", name: "French", flag: "🇫🇷", speechCode: "fr-FR" },
  { code: "de", name: "German", flag: "🇩🇪", speechCode: "de-DE" },
  { code: "it", name: "Italian", flag: "🇮🇹", speechCode: "it-IT" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", speechCode: "pt-PT" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", speechCode: "ja-JP" },
  { code: "ko", name: "Korean", flag: "🇰🇷", speechCode: "ko-KR" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", speechCode: "zh-CN" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", speechCode: "ar-SA" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", speechCode: "hi-IN" },
  { code: "ru", name: "Russian", flag: "🇷🇺", speechCode: "ru-RU" },
  { code: "nl", name: "Dutch", flag: "🇳🇱", speechCode: "nl-NL" },
  { code: "sv", name: "Swedish", flag: "🇸🇪", speechCode: "sv-SE" },
  { code: "tr", name: "Turkish", flag: "🇹🇷", speechCode: "tr-TR" },
  { code: "pl", name: "Polish", flag: "🇵🇱", speechCode: "pl-PL" },
];

export const getLang = (code: string) =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
