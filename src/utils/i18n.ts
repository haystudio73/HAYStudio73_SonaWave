/**
 * SonaWave Internationalization (i18n) Engine
 * Re-exports from modular source files in `/src/languages/`
 * 
 * To add a new language, see `/src/languages/README.md` or create a new file in `/src/languages/[code].ts`.
 */

export * from '../languages';
export type Language = 'en' | 'vi' | string;
