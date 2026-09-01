# SonaWave Internationalization (i18n) Guide

This directory contains modular language dictionaries and configuration for SonaWave Studio.

## Directory Structure

```
src/languages/
├── types.ts     # TypeScript interface (TranslationDictionary, LanguageMeta, LanguageCode)
├── vi.ts        # Vietnamese dictionary source
├── en.ts        # English dictionary source
├── index.ts     # Central registry (SUPPORTED_LANGUAGES, TRANSLATIONS, helpers)
└── README.md    # This guide
```

---

## How to Add a New Custom Language (e.g., Japanese, Spanish, French, etc.)

Adding your own custom language takes just 3 simple steps:

### Step 1: Create a new translation file
Create a file named `src/languages/[your-code].ts` (for example, `src/languages/ja.ts` for Japanese or `src/languages/es.ts` for Spanish).

Copy `en.ts` as a template and translate the strings:

```typescript
// src/languages/ja.ts
import { TranslationDictionary } from './types';

export const ja: TranslationDictionary = {
  appTitle: 'SonaWave',
  appSubtitle: 'オーディオ＆リリック ビデオスタジオ',
  autoSaved: '自動保存済み',
  projectsAndSave: 'プロジェクトと保存',
  presetTemplates: 'プリセット',
  demoMusic: 'デモ音源',
  // ... translate the remaining keys ...
};
```

### Step 2: Register the new language in `src/languages/index.ts`
Open `src/languages/index.ts`:

1. Import your new file:
```typescript
import { ja } from './ja';
```

2. Add your language to `SUPPORTED_LANGUAGES`:
```typescript
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
  {
    code: 'ja',
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    description: 'プロフェッショナル オーディオ・ビデオ ビジュアライザー',
  },
];
```

3. Add it to `TRANSLATIONS`:
```typescript
export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  vi,
  en,
  ja,
};
```

### Step 3: Done! 🎉
Your new language will automatically appear in:
- The top header quick language switcher.
- The **Global Studio Settings** modal with its flag and description.
- All tabs, visualizer options, and export dialogs!

---

## Dynamically Adding Languages via Code
You can also register custom languages dynamically at runtime using `registerCustomLanguage`:

```typescript
import { registerCustomLanguage } from './languages';

registerCustomLanguage(
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    description: 'Interface studio pro audio et vidéo',
  },
  frenchDictionary
);
```
