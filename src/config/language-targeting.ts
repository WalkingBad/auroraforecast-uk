/**
 * Language targeting configuration for geo-targeted localization
 *
 * Strategy: Only translate cities relevant to each language's audience
 * Result: 544 pages instead of 2,910 (82% reduction)
 */

import config from './language-targeting.json';

export type SupportedLanguage = 'en' | 'ru' | 'no' | 'de' | 'es' | 'fr';

export interface LanguageConfig {
  name: string;
  nativeName: string;
  countries: string[];
  countryCodes: string[];
  topCities: string[];
  includeGlobalTop: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface CityData {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  magneticLat?: number;
  state?: string;
}

/**
 * All supported languages
 */
export const SUPPORTED_LANGUAGES = config.supportedLanguages as SupportedLanguage[];

/**
 * Default language (English)
 */
export const DEFAULT_LANGUAGE = config.defaultLanguage as SupportedLanguage;

/**
 * Language configuration map
 */
export const LANGUAGE_CONFIG: Record<SupportedLanguage, LanguageConfig> = config.languageConfig as any;

/**
 * Check if a city should be translated to a given language
 *
 * @param city - City data object
 * @param lang - Target language code
 * @returns true if city should be translated
 */
export function shouldTranslateCity(city: CityData, lang: SupportedLanguage): boolean {
  // English is always available (root pages)
  if (lang === 'en') {
    return false; // English pages don't need /en/ prefix
  }

  const langConfig = LANGUAGE_CONFIG[lang];
  if (!langConfig) {
    return false;
  }

  // Geo-targeting logic:
  // 1. City is in the top aurora destinations list for this language
  if (langConfig.topCities.includes(city.slug)) {
    return true;
  }

  // 2. City is in one of the countries relevant to this language
  if (langConfig.countryCodes.includes(city.countryCode)) {
    return true;
  }

  // Otherwise, don't translate
  return false;
}

/**
 * Get all cities that should be translated to a given language
 *
 * @param cities - Array of all cities
 * @param lang - Target language code
 * @returns Filtered array of cities to translate
 */
export function getCitiesForLanguage(cities: CityData[], lang: SupportedLanguage): CityData[] {
  if (lang === 'en') {
    return cities; // English has all cities
  }

  return cities.filter(city => shouldTranslateCity(city, lang));
}

/**
 * Get all available languages for a specific city
 *
 * @param city - City data object
 * @returns Array of language codes available for this city
 */
export function getAvailableLanguagesForCity(city: CityData): SupportedLanguage[] {
  const languages: SupportedLanguage[] = ['en']; // English always available

  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang === 'en') continue;

    if (shouldTranslateCity(city, lang)) {
      languages.push(lang);
    }
  }

  return languages;
}

/**
 * Build URL for a city in a specific language
 *
 * @param citySlug - City slug
 * @param lang - Language code
 * @returns Relative URL path
 */
export function buildCityUrl(citySlug: string, lang: SupportedLanguage): string {
  if (lang === 'en') {
    return `/${citySlug}`;
  }
  return `/${lang}/${citySlug}`;
}

/**
 * Build absolute URL for a city in a specific language
 *
 * @param citySlug - City slug
 * @param lang - Language code
 * @param baseUrl - Base URL (default: https://auroraforecast.uk)
 * @returns Absolute URL
 */
export function buildCityAbsoluteUrl(
  citySlug: string,
  lang: SupportedLanguage,
  baseUrl: string = 'https://auroraforecast.uk'
): string {
  return `${baseUrl}${buildCityUrl(citySlug, lang)}`;
}

/**
 * Get language name in native language
 *
 * @param lang - Language code
 * @returns Native language name
 */
export function getLanguageNativeName(lang: SupportedLanguage): string {
  return LANGUAGE_CONFIG[lang]?.nativeName || lang;
}

/**
 * Get language name in English
 *
 * @param lang - Language code
 * @returns English language name
 */
export function getLanguageName(lang: SupportedLanguage): string {
  return LANGUAGE_CONFIG[lang]?.name || lang;
}

/**
 * Parse language from URL path
 *
 * @param path - URL path (e.g., '/ru/murmansk' or '/fairbanks')
 * @returns Language code and remaining path
 */
export function parseLanguageFromPath(path: string): { lang: SupportedLanguage; remainingPath: string } {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { lang: 'en', remainingPath: '/' };
  }

  const firstSegment = segments[0];

  // Check if first segment is a language code
  if (SUPPORTED_LANGUAGES.includes(firstSegment as SupportedLanguage)) {
    return {
      lang: firstSegment as SupportedLanguage,
      remainingPath: '/' + segments.slice(1).join('/')
    };
  }

  // No language prefix, default to English
  return { lang: 'en', remainingPath: path };
}

/**
 * Count total cities to translate for a language
 *
 * @param cities - Array of all cities
 * @param lang - Target language code
 * @returns Number of cities to translate
 */
export function countCitiesForLanguage(cities: CityData[], lang: SupportedLanguage): number {
  return getCitiesForLanguage(cities, lang).length;
}

/**
 * Get statistics for all languages
 *
 * @param cities - Array of all cities
 * @returns Object with language statistics
 */
export function getLanguageStatistics(cities: CityData[]): Record<SupportedLanguage, number> {
  const stats: Record<string, number> = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    stats[lang] = countCitiesForLanguage(cities, lang);
  }

  return stats as Record<SupportedLanguage, number>;
}
