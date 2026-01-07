import currentCities from '../data/site-cities';
import legacyCities from '../data/cities.json';

type CityRecord = (typeof currentCities)[number];

interface LegacyRedirectEntry {
  slug: string;
  cityTarget: string;
  bestTimeTarget: string;
  reason: 'canonical' | 'country' | 'global';
}

interface CountryRedirectEntry {
  slug: string;
  target: string;
}

const LEGACY_FALLBACK_PATH = '/';

const legacyCityRedirects: LegacyRedirectEntry[] = [];
const legacyCountryRedirects: CountryRedirectEntry[] = [];

const currentSlugSet = new Set(currentCities.map(city => city.slug));

const normalize = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const normalizeCountryKey = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const nameCountryKey = (name: string, country: string): string => {
  return `${normalize(name)}|${normalizeCountryKey(country)}`;
};

const currentByNameCountry = new Map<string, CityRecord>();
const countrySlugMap = new Map<string, string>(); // normalized country -> slug

currentCities.forEach(city => {
  currentByNameCountry.set(nameCountryKey(city.name, city.country), city);
  const countryKey = normalizeCountryKey(city.country);
  if (!countrySlugMap.has(countryKey)) {
    countrySlugMap.set(countryKey, normalize(city.country));
  }
});

const legacyCountrySlugTargets = new Map<string, string>();

legacyCities.forEach(city => {
  if (currentSlugSet.has(city.slug)) {
    return;
  }

  const countryKey = normalizeCountryKey(city.country);
  const canonicalMatch = currentByNameCountry.get(nameCountryKey(city.name, city.country));

  let cityTarget: string;
  let bestTimeTarget: string;
  let reason: LegacyRedirectEntry['reason'];

  if (canonicalMatch) {
    cityTarget = `/${canonicalMatch.slug}`;
    bestTimeTarget = `/best-time/${canonicalMatch.slug}`;
    reason = 'canonical';
  } else {
    const countrySlug = countrySlugMap.get(countryKey);
    if (countrySlug) {
      cityTarget = `/country/${countrySlug}`;
      bestTimeTarget = `/country/${countrySlug}`;
      reason = 'country';
    } else {
      cityTarget = LEGACY_FALLBACK_PATH;
      bestTimeTarget = LEGACY_FALLBACK_PATH;
      reason = 'global';
    }
  }

  legacyCityRedirects.push({
    slug: city.slug,
    cityTarget,
    bestTimeTarget,
    reason
  });

  if (!countrySlugMap.has(countryKey)) {
    const legacyCountrySlug = normalize(city.country);
    if (!legacyCountrySlugTargets.has(legacyCountrySlug)) {
      legacyCountrySlugTargets.set(legacyCountrySlug, LEGACY_FALLBACK_PATH);
    }
  }
});

legacyCountrySlugTargets.forEach((target, slug) => {
  legacyCountryRedirects.push({ slug, target });
});

const legacyCityRedirectMap = new Map<string, LegacyRedirectEntry>();
legacyCityRedirects.forEach(entry => {
  if (!legacyCityRedirectMap.has(entry.slug)) {
    legacyCityRedirectMap.set(entry.slug, entry);
  }
});

const legacyCountryRedirectMap = new Map<string, CountryRedirectEntry>();
legacyCountryRedirects.forEach(entry => {
  if (!legacyCountryRedirectMap.has(entry.slug)) {
    legacyCountryRedirectMap.set(entry.slug, entry);
  }
});

export const getLegacyCityRedirectEntries = (): LegacyRedirectEntry[] => legacyCityRedirects;

export const getLegacyCountryRedirectEntries = (): CountryRedirectEntry[] => legacyCountryRedirects;

export const findLegacyCityRedirect = (slug: string): LegacyRedirectEntry | undefined => {
  return legacyCityRedirectMap.get(slug);
};

export const findLegacyCountryRedirect = (slug: string): CountryRedirectEntry | undefined => {
  return legacyCountryRedirectMap.get(slug);
};
