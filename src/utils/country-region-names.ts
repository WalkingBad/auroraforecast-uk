import type { I18nPageHelper } from './i18n-page';

/**
 * Maps country name to i18n key
 */
export function getCountryI18nKey(countryName: string): string {
  const normalized = countryName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  return `country_name_${normalized}`;
}

/**
 * Maps region slug to i18n key
 */
export function getRegionI18nKey(regionSlug: string): string {
  return `region_name_${regionSlug.replace(/-/g, '_')}`;
}

/**
 * Get translated country name with fallback
 */
export function getTranslatedCountry(countryName: string, i18n?: I18nPageHelper): string {
  if (!i18n) return countryName;

  const key = getCountryI18nKey(countryName);
  return i18n.t(key, countryName); // fallback to original name
}

/**
 * Get translated region name with fallback
 */
export function getTranslatedRegion(regionName: string, regionSlug: string, i18n?: I18nPageHelper): string {
  if (!i18n) return regionName;

  const key = getRegionI18nKey(regionSlug);
  return i18n.t(key, regionName); // fallback to original name
}
