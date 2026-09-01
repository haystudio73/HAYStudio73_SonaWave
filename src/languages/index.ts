import { LanguageCode, LanguageMeta, TranslationDictionary } from './types';
import { en } from './en';
import { vi } from './vi';

export * from './types';
export { en } from './en';
export { vi } from './vi';

/**
 * List of officially supported studio languages.
 * To add a new language:
 * 1. Create a new file `src/languages/[code].ts` (e.g., `ja.ts`, `es.ts`, `fr.ts`) implementing `TranslationDictionary`.
 * 2. Import it here and add it to `SUPPORTED_LANGUAGES` and `TRANSLATIONS`.
 */
export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'vi',
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    description: 'Giao diện tiếng Việt chuẩn phòng thu',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    description: 'Pro studio audio & video visualizer interface',
  },
];

/**
 * Dictionary registry mapping language code to translation dictionary.
 */
export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  vi,
  en,
};

/**
 * Helper to dynamically register custom languages at runtime or development.
 */
export function registerCustomLanguage(meta: LanguageMeta, dictionary: TranslationDictionary) {
  const existingIdx = SUPPORTED_LANGUAGES.findIndex(l => l.code === meta.code);
  if (existingIdx >= 0) {
    SUPPORTED_LANGUAGES[existingIdx] = meta;
  } else {
    SUPPORTED_LANGUAGES.push(meta);
  }
  TRANSLATIONS[meta.code] = dictionary;
}

const STORAGE_LANG_KEY = 'sonawave_interface_lang';

/**
 * Detect the initial language from localStorage or browser preferences.
 */
export function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'vi';
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved && TRANSLATIONS[saved]) {
      return saved;
    }
    // Check browser navigator language
    const navLang = navigator.language?.toLowerCase() || '';
    if (navLang.startsWith('vi')) return 'vi';
    if (navLang.startsWith('en')) return 'en';
  } catch {}
  return 'vi';
}

/**
 * Save user selected language to local storage for persistence across reloads.
 */
export function setSavedLanguage(lang: LanguageCode) {
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  } catch {}
}

export const getSavedLanguage = getInitialLanguage;
export const saveLanguage = setSavedLanguage;

/**
 * Safe translation dictionary getter with fallback to Vietnamese or English.
 */
export function getTranslation(lang: LanguageCode): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS['vi'] || TRANSLATIONS['en'];
}
