/**
 * Hreflang utilities for multilingual SEO
 *
 * Generates proper hreflang tags for all available language versions of a page
 */

import type { SupportedLanguage } from '@config/language-targeting';
import {
  getAvailableLanguagesForCity,
  buildCityAbsoluteUrl,
  DEFAULT_LANGUAGE
} from '@config/language-targeting';
import type { CityData } from '@config/language-targeting';

export interface HreflangTag {
  hreflang: string;
  href: string;
}

/**
 * Generate hreflang tags for a city page
 *
 * @param city - City data
 * @param baseUrl - Base URL (default: https://auroraforecast.me)
 * @returns Array of hreflang tag objects
 */
export function generateCityHreflangTags(
  city: CityData,
  baseUrl: string = 'https://auroraforecast.me'
): HreflangTag[] {
  const availableLanguages = getAvailableLanguagesForCity(city);
  const tags: HreflangTag[] = [];

  // Add hreflang for each available language
  for (const lang of availableLanguages) {
    tags.push({
      hreflang: lang,
      href: buildCityAbsoluteUrl(city.slug, lang, baseUrl)
    });
  }

  // Add x-default (always points to English version)
  tags.push({
    hreflang: 'x-default',
    href: buildCityAbsoluteUrl(city.slug, DEFAULT_LANGUAGE, baseUrl)
  });

  return tags;
}

/**
 * Generate hreflang tags for a generic page (non-city)
 *
 * @param pagePath - Page path without language prefix (e.g., 'aurora-tracker', 'guides/kp-index')
 * @param availableLanguages - Languages this page is available in
 * @param baseUrl - Base URL (default: https://auroraforecast.me)
 * @returns Array of hreflang tag objects
 */
export function generatePageHreflangTags(
  pagePath: string,
  availableLanguages: SupportedLanguage[],
  baseUrl: string = 'https://auroraforecast.me'
): HreflangTag[] {
  const tags: HreflangTag[] = [];

  // Remove leading slash if present
  const cleanPath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath;
  const isStatePath = /^state\//.test(cleanPath);

  for (const lang of availableLanguages) {
    const localizedPath = (() => {
      if (lang === DEFAULT_LANGUAGE) return cleanPath;
      // State pages live under /{lang}/state/{country}/{state}
      if (isStatePath) return `${lang}/${cleanPath}`;
      return `${lang}/${cleanPath}`;
    })();

    const url = `${baseUrl}/${localizedPath}`;

    tags.push({
      hreflang: lang,
      href: url
    });
  }

  // Add x-default (always points to English version)
  tags.push({
    hreflang: 'x-default',
    href: `${baseUrl}/${cleanPath}`
  });

  return tags;
}

/**
 * Generate hreflang tags for homepage
 *
 * @param availableLanguages - Languages homepage is available in
 * @param baseUrl - Base URL (default: https://auroraforecast.me)
 * @returns Array of hreflang tag objects
 */
export function generateHomepageHreflangTags(
  availableLanguages: SupportedLanguage[],
  baseUrl: string = 'https://auroraforecast.me'
): HreflangTag[] {
  const tags: HreflangTag[] = [];

  for (const lang of availableLanguages) {
    const url = lang === DEFAULT_LANGUAGE
      ? baseUrl
      : `${baseUrl}/${lang}`;

    tags.push({
      hreflang: lang,
      href: url
    });
  }

  // Add x-default (always points to English version)
  tags.push({
    hreflang: 'x-default',
    href: baseUrl
  });

  return tags;
}

/**
 * Convert hreflang tags to HTML string for embedding
 *
 * @param tags - Array of hreflang tag objects
 * @returns HTML string with link tags
 */
export function hreflangTagsToHtml(tags: HreflangTag[]): string {
  return tags
    .map(tag => `<link rel="alternate" hreflang="${tag.hreflang}" href="${tag.href}">`)
    .join('\n  ');
}

/**
 * Get canonical URL for a city page
 *
 * @param city - City data
 * @param lang - Current language
 * @param baseUrl - Base URL (default: https://auroraforecast.me)
 * @returns Canonical URL
 */
export function getCityCanonicalUrl(
  city: CityData,
  lang: SupportedLanguage,
  baseUrl: string = 'https://auroraforecast.me'
): string {
  return buildCityAbsoluteUrl(city.slug, lang, baseUrl);
}

/**
 * Get canonical URL for a generic page
 *
 * @param pagePath - Page path without language prefix
 * @param lang - Current language
 * @param baseUrl - Base URL (default: https://auroraforecast.me)
 * @returns Canonical URL
 */
export function getPageCanonicalUrl(
  pagePath: string,
  lang: SupportedLanguage,
  baseUrl: string = 'https://auroraforecast.me'
): string {
  const cleanPath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath;

  if (lang === DEFAULT_LANGUAGE) {
    return `${baseUrl}/${cleanPath}`;
  }

  return `${baseUrl}/${lang}/${cleanPath}`;
}

/**
 * Validate hreflang tags for completeness
 *
 * @param tags - Array of hreflang tag objects
 * @returns Validation result with any issues
 */
export function validateHreflangTags(tags: HreflangTag[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for x-default
  const hasXDefault = tags.some(tag => tag.hreflang === 'x-default');
  if (!hasXDefault) {
    issues.push('Missing x-default hreflang tag');
  }

  // Check for duplicate hreflang values
  const hreflangs = tags.map(tag => tag.hreflang);
  const duplicates = hreflangs.filter((item, index) => hreflangs.indexOf(item) !== index);
  if (duplicates.length > 0) {
    issues.push(`Duplicate hreflang values: ${duplicates.join(', ')}`);
  }

  // Check for empty URLs
  const emptyUrls = tags.filter(tag => !tag.href || tag.href.trim() === '');
  if (emptyUrls.length > 0) {
    issues.push(`${emptyUrls.length} tags with empty URLs`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
