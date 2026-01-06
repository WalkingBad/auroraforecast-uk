import citiesData from '../data/cities.json';
import {
  normalizeStateSlug,
  getCountryISO,
  REGIONS
} from './slug-normalizer';
import {
  SUPPORTED_LANGUAGES,
  getCitiesForLanguage
} from '@config/language-targeting';
import type {
  CityData,
  SupportedLanguage
} from '@config/language-targeting';

export interface StatePageCity extends CityData {
  lat?: number;
  lon?: number;
  description?: string;
  population?: number;
  magneticLat?: number;
}

export interface StatePageData {
  name: string;
  iso: string;
  country: string;
  countryCode: string;
  countryISO: string;
  cities: StatePageCity[];
}

export interface StateStaticEntry {
  stateData: StatePageData;
  isRegion: boolean;
}

const localizedCitySlugCache = new Map<SupportedLanguage, Set<string>>();

export function getLocalizedCitySlugs(lang: SupportedLanguage): Set<string> {
  if (!localizedCitySlugCache.has(lang)) {
    const localizedCities = getCitiesForLanguage(citiesData as CityData[], lang);
    localizedCitySlugCache.set(
      lang,
      new Set(localizedCities.map(city => city.slug))
    );
  }

  return localizedCitySlugCache.get(lang)!;
}

export function getStateStaticEntries(): StateStaticEntry[] {
  const entries: StateStaticEntry[] = [];
  const statesMap = new Map<string, StatePageData>();

  (citiesData as StatePageCity[])
    .filter(city => city.state && ['US', 'CA'].includes(city.countryCode))
    .forEach(city => {
      const countryISO = getCountryISO(city.country);
      const stateISO = normalizeStateSlug(city.state, city.countryCode);
      const key = `${countryISO}/${stateISO}`;

      if (!statesMap.has(key)) {
        statesMap.set(key, {
          name: city.state!,
          iso: stateISO,
          country: city.country,
          countryCode: city.countryCode,
          countryISO,
          cities: []
        });
      }

      statesMap.get(key)!.cities.push(city);
    });

  statesMap.forEach(stateData => {
    entries.push({
      stateData,
      isRegion: false
    });
  });

  Object.entries(REGIONS).forEach(([slug, region]) => {
    const regionCities = (citiesData as StatePageCity[]).filter(city => {
      if (city.countryCode !== region.country.toUpperCase()) return false;
      const stateSlug = city.state?.toLowerCase().replace(/\s+/g, '-');
      return region.states.includes(stateSlug || '');
    });

    if (regionCities.length === 0) {
      return;
    }

    const regionCountry = regionCities[0].country;
    const countryISO = region.country;

    entries.push({
      stateData: {
        name: region.name,
        iso: slug,
        country: regionCountry,
        countryCode: region.country.toUpperCase(),
        countryISO,
        cities: regionCities
      },
      isRegion: true
    });
  });

  return entries;
}

export function buildStatePath(
  countryISO: string,
  stateISO: string,
  lang: SupportedLanguage
): string {
  return lang === 'en'
    ? `/${countryISO}/${stateISO}`
    : `/${lang}/state/${countryISO}/${stateISO}`;
}

export function buildStateAbsoluteUrl(
  countryISO: string,
  stateISO: string,
  lang: SupportedLanguage,
  baseUrl: string = 'https://auroraforecast.me'
): string {
  return `${baseUrl}${buildStatePath(countryISO, stateISO, lang)}`;
}

export function stateSupportsLanguage(
  stateData: StatePageData,
  lang: SupportedLanguage
): boolean {
  if (lang === 'en') return true;
  const localizedSlugs = getLocalizedCitySlugs(lang);
  return stateData.cities.some(city => localizedSlugs.has(city.slug));
}

export function getAvailableLanguagesForState(
  stateData: StatePageData
): SupportedLanguage[] {
  return SUPPORTED_LANGUAGES.filter(lang => stateSupportsLanguage(stateData, lang));
}

export function getLocalizedCitySlugSet(
  lang: SupportedLanguage
): Set<string> {
  if (lang === 'en') {
    return new Set((citiesData as CityData[]).map(city => city.slug));
  }
  return getLocalizedCitySlugs(lang);
}
