export const DRIVER_LANGUAGE_CATALOG = [
  { code: "en", name: "English" },
  { code: "nl", name: "Dutch" },
  { code: "tr", name: "Turkish" },
  { code: "ar", name: "Arabic" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "pl", name: "Polish" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" },
  { code: "ru", name: "Russian" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "fa", name: "Persian" },
  { code: "ku", name: "Kurdish" },
  { code: "so", name: "Somali" },
  { code: "ti", name: "Tigrinya" },
  { code: "am", name: "Amharic" },
  { code: "sw", name: "Swahili" },
  { code: "sq", name: "Albanian" },
  { code: "sr", name: "Serbian" },
  { code: "hr", name: "Croatian" },
  { code: "bs", name: "Bosnian" },
  { code: "el", name: "Greek" },
  { code: "hu", name: "Hungarian" },
  { code: "cs", name: "Czech" },
  { code: "sk", name: "Slovak" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "he", name: "Hebrew" },
  { code: "id", name: "Indonesian" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "tl", name: "Tagalog" },
  { code: "pa", name: "Punjabi" },
  { code: "ps", name: "Pashto" },
  { code: "ne", name: "Nepali" },
  { code: "si", name: "Sinhala" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "gu", name: "Gujarati" },
  { code: "mr", name: "Marathi" },
  { code: "kn", name: "Kannada" },
] as const;

export type DriverLanguageCode = (typeof DRIVER_LANGUAGE_CATALOG)[number]["code"];

export const DRIVER_LANGUAGE_CODES: DriverLanguageCode[] = DRIVER_LANGUAGE_CATALOG.map(
  (item) => item.code,
);

export const DRIVER_LANGUAGE_CODE_SET = new Set<string>(DRIVER_LANGUAGE_CODES);

export const DRIVER_LANGUAGES_MIN = 1;
export const DRIVER_LANGUAGES_MAX = 20;

export function isDriverLanguageCode(value: string): value is DriverLanguageCode {
  return DRIVER_LANGUAGE_CODE_SET.has(value);
}
