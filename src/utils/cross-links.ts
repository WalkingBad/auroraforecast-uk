import citiesData from '../data/cities.json';
import { getCountryISO, normalizeStateSlug } from './slug-normalizer.ts';
import type { SupportedLanguage } from '@config/language-targeting';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getCitiesForLanguage } from '@config/language-targeting';

export type CrossLinkType = 'live' | 'guide' | 'compare' | 'premium';

export type CrossLinkSlot =
  | 'intro'
  | 'quick_stat'
  | 'best_month'
  | 'planning'
  | 'cta'
  | 'related_block'
  | 'country_status'
  | 'country_best_time';

export interface CrossLinkIndicator {
  icon: string;
  labelKey: string;
  labelFallback: string;
  srKey: string;
  srFallback: string;
}

export const linkIndicators: Record<CrossLinkType, CrossLinkIndicator> = {
  live: {
    icon: '📊',
    labelKey: 'cross_link_indicator_live',
    labelFallback: 'Live',
    srKey: 'cross_link_indicator_live_sr',
    srFallback: 'Live data'
  },
  guide: {
    icon: '📖',
    labelKey: 'cross_link_indicator_guide',
    labelFallback: 'Guide',
    srKey: 'cross_link_indicator_guide_sr',
    srFallback: 'Guide content'
  },
  compare: {
    icon: '⚖️',
    labelKey: 'cross_link_indicator_compare',
    labelFallback: 'Compare',
    srKey: 'cross_link_indicator_compare_sr',
    srFallback: 'Comparison content'
  },
  premium: {
    icon: '⭐',
    labelKey: 'cross_link_indicator_premium',
    labelFallback: 'Premium',
    srKey: 'cross_link_indicator_premium_sr',
    srFallback: 'Premium destination'
  }
};

export interface CrossLinkItem {
  href: string;
  text: string;
  textKey?: string;
  textVars?: Record<string, string>;
  targetSlug: string;
  type: CrossLinkType;
}

export interface CrossLinkEvent {
  slot: CrossLinkSlot;
  originSlug: string;
  targetSlug: string;
  linkType: CrossLinkType;
  position: number;
}

export interface CityRecord {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  magneticLat?: number;
  state?: string;
  description?: string;
}

export interface StateBestTimeRecord {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  cities: CityRecord[];
}

export interface CountryPageRecord {
  slug: string;
  name: string;
  countryCode: string;
  cities: CityRecord[];
}

const PREMIUM_DESTINATIONS = ['fairbanks', 'yellowknife', 'tromso', 'kiruna'];

const allCities: CityRecord[] = citiesData as CityRecord[];
const localizedCitySets: Record<SupportedLanguage, Set<string>> = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
  acc[lang] = lang === DEFAULT_LANGUAGE
    ? new Set(allCities.map(c => c.slug))
    : new Set(getCitiesForLanguage(allCities, lang).map(c => c.slug));
  return acc;
}, {} as Record<SupportedLanguage, Set<string>>);

function getLinkText(
  key: string,
  fallback: string,
  vars?: Record<string, string>
): Pick<CrossLinkItem, 'text' | 'textKey' | 'textVars'> {
  return {
    text: fallback,
    textKey: key,
    textVars: vars
  };
}

function localizeHref(href: string, lang: SupportedLanguage): string {
  if (!href.startsWith('/') || href.startsWith('//') || lang === 'en') {
    return href;
  }

  if (href.startsWith(`/${lang}/`)) {
    return href;
  }

  if (href === `/${lang}`) {
    return href;
  }

  // best-time pages: localize only if city exists in this language
  const bestTimeMatch = href.match(/^\/best-time\/([^/?#]+)/);
  if (bestTimeMatch) {
    const slug = bestTimeMatch[1];
    if (localizedCitySets[lang].has(slug)) {
      return `/${lang}${href}`;
    }
    return href; // fallback to English page
  }

  // city pages
  const cityMatch = href.match(/^\/([^/?#]+)$/);
  if (cityMatch) {
    const slug = cityMatch[1];
    if (localizedCitySets[lang].has(slug)) {
      return `/${lang}${href}`;
    }
    return href; // fallback to English page
  }

  // country pages exist for all languages
  if (href.startsWith('/country/')) {
    return `/${lang}${href}`;
  }

  // keep original for everything else (states/regions/etc.)
  return href;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isStateRecord(entry: CityRecord | StateBestTimeRecord): entry is StateBestTimeRecord {
  return Array.isArray((entry as StateBestTimeRecord).cities);
}

export function getCountrySlug(country: string): string {
  return slugify(country);
}

export function getCityBySlug(slug: string): CityRecord | undefined {
  return allCities.find(city => city.slug === slug);
}

export function getSimilarCities(baseCity: CityRecord, limit = 3): CityRecord[] {
  const baseLat = baseCity.magneticLat ?? 0;

  const ranked = allCities
    .filter(city => city.slug !== baseCity.slug)
    .map(city => ({
      city,
      delta: Math.abs((city.magneticLat ?? baseLat) - baseLat)
    }))
    .sort((a, b) => a.delta - b.delta);

  const closeMatches = ranked.filter(entry => entry.delta <= 3).slice(0, limit).map(entry => entry.city);

  if (closeMatches.length >= limit) {
    return closeMatches;
  }

  const additional = ranked
    .filter(entry => !closeMatches.includes(entry.city))
    .map(entry => entry.city)
    .slice(0, limit - closeMatches.length);

  return [...closeMatches, ...additional];
}

export function getPremiumDestinations(currentCity?: CityRecord, limit = 3): CityRecord[] {
  return PREMIUM_DESTINATIONS
    .map(slug => getCityBySlug(slug))
    .filter((city): city is CityRecord => Boolean(city) && city.slug !== currentCity?.slug)
    .slice(0, limit);
}

export function getCountryLink(city: CityRecord, lang: SupportedLanguage = 'en'): CrossLinkItem {
  const slug = getCountrySlug(city.country);
  return {
    href: localizeHref(`/country/${slug}`, lang),
    ...getLinkText('cross_link_country_overview', '{country} aurora overview', { country: city.country }),
    targetSlug: `country/${slug}`,
    type: 'guide'
  };
}

export function getStateLink(city: CityRecord, lang: SupportedLanguage = 'en'): CrossLinkItem | null {
  if (!city.state) {
    return null;
  }

  const iso = getCountryISO(city.country) || city.countryCode.toLowerCase();
  const stateSlug = normalizeStateSlug(city.state, city.countryCode);

  return {
    href: localizeHref(`/${iso}/${stateSlug}`, lang),
    ...getLinkText('cross_link_state_locations', '{state} viewing locations', { state: city.state }),
    targetSlug: `${iso}/${stateSlug}`,
    type: 'guide'
  };
}

export function buildBestTimeRelatedLinks(
  entry: CityRecord | StateBestTimeRecord,
  lang: SupportedLanguage = 'en'
): CrossLinkItem[] {
  const city = isStateRecord(entry)
    ? [...entry.cities].sort((a, b) => (b.magneticLat ?? 0) - (a.magneticLat ?? 0))[0]
    : entry;

  if (!city) {
    return [];
  }

  const links: CrossLinkItem[] = [
    {
      href: localizeHref(`/${city.slug}`, lang),
      ...getLinkText('cross_link_current_forecast', 'Current aurora forecast for {name}', { name: city.name }),
      targetSlug: city.slug,
      type: 'live'
    },
    getCountryLink(city, lang)
  ];

  const similarCities = getSimilarCities(city, 2);
  similarCities.forEach(similar => {
    links.push({
      href: localizeHref(`/best-time/${similar.slug}`, lang),
      ...getLinkText('cross_link_best_time_short', 'Best time in {name}', { name: similar.name }),
      targetSlug: `best-time/${similar.slug}`,
      type: 'guide'
    });
  });

  getPremiumDestinations(city, 1).forEach(destination => {
    links.push({
      href: localizeHref(`/best-time/${destination.slug}`, lang),
      ...getLinkText('cross_link_compare_destination', 'Compare with {name}', { name: destination.name }),
      targetSlug: `best-time/${destination.slug}`,
      type: 'premium'
    });
  });

  const stateLink = getStateLink(city, lang);
  if (!isStateRecord(entry) && stateLink) {
    links.push(stateLink);
  }

  return links;
}

export function buildCityRelatedLinks(city: CityRecord, lang: SupportedLanguage = 'en'): CrossLinkItem[] {
  const links: CrossLinkItem[] = [
    {
      href: localizeHref(`/best-time/${city.slug}`, lang),
      ...getLinkText('cross_link_best_time_full', 'Best time to see aurora in {name}', { name: city.name }),
      targetSlug: `best-time/${city.slug}`,
      type: 'guide'
    },
    getCountryLink(city, lang)
  ];

  getSimilarCities(city, 2).forEach(similar => {
    links.push({
      href: localizeHref(`/${similar.slug}`, lang),
      ...getLinkText('cross_link_live_status', 'Live status in {name}', { name: similar.name }),
      targetSlug: similar.slug,
      type: 'compare'
    });
  });

  getPremiumDestinations(city, 1).forEach(destination => {
    links.push({
      href: localizeHref(`/best-time/${destination.slug}`, lang),
      ...getLinkText('cross_link_upgrade_destination', 'Upgrade to {name}', { name: destination.name }),
      targetSlug: `best-time/${destination.slug}`,
      type: 'premium'
    });
  });

  const stateLink = getStateLink(city, lang);
  if (stateLink) {
    links.push(stateLink);
  }

  return links;
}

export function getCountryLiveLinks(country: CountryPageRecord, limit = 3, lang: SupportedLanguage = 'en'): CrossLinkItem[] {
  return [...country.cities]
    .sort((a, b) => (b.magneticLat ?? 0) - (a.magneticLat ?? 0))
    .slice(0, limit)
    .map(city => ({
      href: localizeHref(`/${city.slug}`, lang),
      ...getLinkText('cross_link_country_live_forecast', '{name} live forecast', { name: city.name }),
      targetSlug: city.slug,
      type: 'live'
    }));
}

export function getCountryBestTimeLinks(country: CountryPageRecord, limit = 3, lang: SupportedLanguage = 'en'): CrossLinkItem[] {
  return [...country.cities]
    .sort((a, b) => (b.magneticLat ?? 0) - (a.magneticLat ?? 0))
    .slice(0, limit)
    .map(city => ({
      href: localizeHref(`/best-time/${city.slug}`, lang),
      ...getLinkText('cross_link_country_best_time', '{name} best time guide', { name: city.name }),
      targetSlug: `best-time/${city.slug}`,
      type: 'guide'
    }));
}

export function trackCrossLink(event: CrossLinkEvent): void {
  if (typeof window === 'undefined' || typeof (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag !== 'function') {
    return;
  }

  const gtag = (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag;

  gtag('event', 'web_crosslink_click', {
    slot: event.slot,
    origin_city: event.originSlug,
    target_slug: event.targetSlug,
    link_type: event.linkType,
    position: event.position
  });
}
