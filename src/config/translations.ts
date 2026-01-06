/**
 * Translations interface and loader for multilingual support
 *
 * Web-specific translations are managed independently from Flutter app
 * Source: web-seo/src/data/web-strings/{lang}.json
 */

import type { SupportedLanguage } from './language-targeting';

/**
 * Translation dictionary type
 * Keys are translation keys, values are translated strings
 */
export type TranslationDictionary = Record<string, string>;

/**
 * Cached translations per language
 */
const translationCache: Map<SupportedLanguage, TranslationDictionary> = new Map();

/**
 * Load translations for a specific language
 *
 * @param lang - Language code
 * @returns Translation dictionary
 */
export async function loadTranslations(lang: SupportedLanguage): Promise<TranslationDictionary> {
  // Check cache first
  if (translationCache.has(lang)) {
    return translationCache.get(lang)!;
  }

  try {
    // Dynamic import of web-specific translation file
    const module = await import(`../data/web-strings/${lang}.json`);
    const translations = module.default || module;

    // Cache the translations
    translationCache.set(lang, translations);

    return translations;
  } catch (error) {
    console.warn(`Failed to load web strings for ${lang}, falling back to English`, error);

    // Fallback to English
    if (lang !== 'en') {
      return loadTranslations('en');
    }

    // If English also fails, return empty object
    return {};
  }
}

/**
 * Get a translated string by key
 *
 * @param key - Translation key
 * @param lang - Language code
 * @param fallback - Fallback string if key not found
 * @returns Translated string
 */
export async function t(
  key: string,
  lang: SupportedLanguage,
  fallback?: string
): Promise<string> {
  const translations = await loadTranslations(lang);

  if (translations[key]) {
    return translations[key];
  }

  // Try English fallback
  if (lang !== 'en') {
    const enTranslations = await loadTranslations('en');
    if (enTranslations[key]) {
      return enTranslations[key];
    }
  }

  // Return fallback or key itself
  return fallback || key;
}

/**
 * Create a translation function bound to a specific language
 *
 * @param lang - Language code
 * @returns Translation function for that language
 */
export function createTranslator(lang: SupportedLanguage) {
  return async (key: string, fallback?: string): Promise<string> => {
    return t(key, lang, fallback);
  };
}

/**
 * Synchronous translation lookup (use only with pre-loaded translations)
 *
 * @param translations - Pre-loaded translation dictionary
 * @param key - Translation key
 * @param fallback - Fallback string
 * @returns Translated string
 */
export function tSync(
  translations: TranslationDictionary,
  key: string,
  fallback?: string
): string {
  return translations[key] || fallback || key;
}

/**
 * Template function for translations with variables
 *
 * Usage: tpl(translation, { city: 'Tromsø', kp: 5 })
 * Translation: "Aurora in {city} with Kp {kp}"
 * Result: "Aurora in Tromsø with Kp 5"
 *
 * @param template - Template string with {variable} placeholders
 * @param vars - Variables to replace
 * @returns Formatted string
 */
export function tpl(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

/**
 * Clear translation cache (useful for testing)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get all loaded languages
 *
 * @returns Array of language codes that are currently cached
 */
export function getLoadedLanguages(): SupportedLanguage[] {
  return Array.from(translationCache.keys());
}

/**
 * Preload translations for multiple languages
 *
 * @param languages - Array of language codes to preload
 */
export async function preloadTranslations(languages: SupportedLanguage[]): Promise<void> {
  await Promise.all(languages.map(lang => loadTranslations(lang)));
}
