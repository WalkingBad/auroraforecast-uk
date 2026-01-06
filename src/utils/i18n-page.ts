/**
 * i18n utilities for Astro pages
 *
 * Helpers for loading and using translations in Astro page components
 */

import { loadTranslations, tSync, tpl } from '@config/translations';
import type { SupportedLanguage } from '@config/language-targeting';
import type { TranslationDictionary } from '@config/translations';

/**
 * Page i18n context with pre-loaded translations
 */
export interface PageI18nContext {
  lang: SupportedLanguage;
  translations: TranslationDictionary;
  t: (key: string, fallback?: string) => string;
  tpl: (template: string, vars: Record<string, string | number>) => string;
}

/**
 * Create i18n context for a page
 *
 * Usage in Astro page:
 * ```astro
 * const i18n = await createPageI18n('ru');
 * const title = i18n.t('aurora_now');
 * ```
 *
 * @param lang - Language code
 * @returns Page i18n context
 */
export async function createPageI18n(lang: SupportedLanguage): Promise<PageI18nContext> {
  const translations = await loadTranslations(lang);

  return {
    lang,
    translations,
    t: (key: string, fallback?: string) => tSync(translations, key, fallback),
    tpl: (template: string, vars: Record<string, string | number>) => tpl(template, vars)
  };
}

/**
 * Localized SEO metadata
 */
export interface LocalizedSEOMetadata {
  title: string;
  description: string;
  h1?: string;
  keywords?: string[];
}

/**
 * Generate localized SEO title for city page
 *
 * @param cityName - City name
 * @param i18n - Page i18n context
 * @returns Localized title
 */
export function generateLocalizedCityTitle(
  cityName: string,
  i18n: PageI18nContext
): string {
  // Try to get localized template
  const template = i18n.t('seo_city_title', 'Aurora Forecast {city} — Northern Lights Tonight');
  return i18n.tpl(template, { city: cityName });
}

/**
 * Generate localized SEO description for city page
 *
 * @param cityName - City name
 * @param country - Country name
 * @param i18n - Page i18n context
 * @returns Localized description
 */
export function generateLocalizedCityDescription(
  cityName: string,
  country: string,
  i18n: PageI18nContext
): string {
  // Try to get localized template
  const template = i18n.t(
    'seo_city_description',
    'Live aurora forecast for {city}, {country}. Check northern lights visibility, weather conditions and Kp index tonight. Real-time aurora alerts and 3-hour forecast.'
  );
  return i18n.tpl(template, { city: cityName, country });
}

/**
 * Status text localization mapping
 */
const STATUS_KEYS: Record<string, string> = {
  'Very Low': 'status_very_low',
  'Low': 'status_low',
  'Medium': 'status_medium',
  'High': 'status_high',
  'Very High': 'status_very_high',
  'Unlikely': 'status_unlikely',
  'Possible': 'status_possible',
  'Likely': 'status_likely',
  'Visible': 'status_visible'
};

/**
 * Get localized status text
 *
 * @param statusText - English status text
 * @param i18n - Page i18n context
 * @returns Localized status text
 */
export function getLocalizedStatus(
  statusText: string,
  i18n: PageI18nContext
): string {
  const key = STATUS_KEYS[statusText];
  if (key) {
    return i18n.t(key, statusText);
  }
  return statusText;
}

/**
 * Common UI strings for city pages
 */
export function getCityPageStrings(i18n: PageI18nContext) {
  return {
    now: i18n.t('now_title', 'Now'),
    probability: i18n.t('now_prob', 'Probability'),
    kpIndex: i18n.t('now_kp', 'Kp index'),
    darkWindow: i18n.t('now_dark_window', 'Dark window'),
    nextWindow: i18n.t('now_next_window', 'Next window'),
    forecast: i18n.t('forecast_title', 'Forecast'),
    weather: i18n.t('weather_title', 'Weather'),
    visibility: i18n.t('visibility_title', 'Visibility'),
    magneticLatitude: i18n.t('magnetic_latitude', 'Magnetic Latitude'),
    cloudCover: i18n.t('cloud_cover', 'Cloud Cover'),
    moonPhase: i18n.t('moon_phase', 'Moon Phase'),
    darkness: i18n.t('darkness', 'Darkness'),
    bestTime: i18n.t('best_time_title', 'Best Time'),
    downloadApp: i18n.t('download_app', 'Download App'),
    viewOnMap: i18n.t('view_on_map', 'View on Map'),
    share: i18n.t('share', 'Share'),
    retry: i18n.t('retry', 'Retry'),
    loading: i18n.t('loading', 'Loading...'),
    error: i18n.t('error', 'Error')
  };
}

/**
 * Get localized factor title
 *
 * @param factorKey - Factor key (magneticLatitude, kp, weather, moon, darkness)
 * @param i18n - Page i18n context
 * @returns Localized factor title
 */
export function getLocalizedFactorTitle(
  factorKey: string,
  i18n: PageI18nContext
): string {
  const keyMap: Record<string, string> = {
    magneticLatitude: 'magnetic_latitude',
    kp: 'kp_index',
    weather: 'info_weather_title',
    moon: 'moon_phase',
    darkness: 'darkness'
  };

  const translationKey = keyMap[factorKey] || factorKey;
  return i18n.t(translationKey, factorKey);
}

/**
 * Format localized date/time
 *
 * @param date - Date object or ISO string
 * @param lang - Language code
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatLocalizedDate(
  date: Date | string,
  lang: SupportedLanguage,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(lang, options).format(dateObj);
}

/**
 * Format localized number
 *
 * @param num - Number to format
 * @param lang - Language code
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatLocalizedNumber(
  num: number,
  lang: SupportedLanguage,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(lang, options).format(num);
}

/**
 * Get language-specific date format
 *
 * @param lang - Language code
 * @returns Date format string
 */
export function getDateFormat(lang: SupportedLanguage): string {
  const formats: Record<SupportedLanguage, string> = {
    en: 'MMM DD, YYYY',
    ru: 'DD.MM.YYYY',
    no: 'DD.MM.YYYY',
    de: 'DD.MM.YYYY',
    es: 'DD/MM/YYYY',
    fr: 'DD/MM/YYYY'
  };

  return formats[lang] || formats.en;
}

/**
 * Get language-specific time format
 *
 * @param lang - Language code
 * @returns Time format (12h or 24h)
 */
export function getTimeFormat(lang: SupportedLanguage): '12h' | '24h' {
  const formats: Record<SupportedLanguage, '12h' | '24h'> = {
    en: '12h',
    ru: '24h',
    no: '24h',
    de: '24h',
    es: '24h',
    fr: '24h'
  };

  return formats[lang] || '24h';
}
