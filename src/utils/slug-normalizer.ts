/**
 * ISO-based URL slug normalization for states and provinces
 * Prevents collisions and handles diacritics
 */

// ISO 3166-2 codes for US states
const US_STATE_ISO_MAP: Record<string, string> = {
  // Full state names to ISO codes
  'alaska': 'ak',
  'alabama': 'al',
  'arkansas': 'ar',
  'arizona': 'az',
  'california': 'ca',
  'colorado': 'co',
  'connecticut': 'ct',
  'delaware': 'de',
  'florida': 'fl',
  'georgia': 'ga',
  'hawaii': 'hi',
  'iowa': 'ia',
  'idaho': 'id',
  'illinois': 'il',
  'indiana': 'in',
  'kansas': 'ks',
  'kentucky': 'ky',
  'louisiana': 'la',
  'massachusetts': 'ma',
  'maryland': 'md',
  'maine': 'me',
  'michigan': 'mi',
  'minnesota': 'mn',
  'missouri': 'mo',
  'mississippi': 'ms',
  'montana': 'mt',
  'north-carolina': 'nc',
  'north-dakota': 'nd',
  'nebraska': 'ne',
  'new-hampshire': 'nh',
  'new-jersey': 'nj',
  'new-mexico': 'nm',
  'nevada': 'nv',
  'new-york': 'ny',
  'ohio': 'oh',
  'oklahoma': 'ok',
  'oregon': 'or',
  'pennsylvania': 'pa',
  'rhode-island': 'ri',
  'south-carolina': 'sc',
  'south-dakota': 'sd',
  'tennessee': 'tn',
  'texas': 'tx',
  'utah': 'ut',
  'virginia': 'va',
  'vermont': 'vt',
  'washington': 'wa',
  'wisconsin': 'wi',
  'west-virginia': 'wv',
  'wyoming': 'wy'
};

// ISO 3166-2 codes for Canadian provinces/territories
const CA_PROVINCE_ISO_MAP: Record<string, string> = {
  // Full province names to ISO codes
  'alberta': 'ab',
  'british-columbia': 'bc',
  'manitoba': 'mb',
  'new-brunswick': 'nb',
  'newfoundland-and-labrador': 'nl',
  'northwest-territories': 'nt',
  'nova-scotia': 'ns',
  'nunavut': 'nu',
  'ontario': 'on',
  'prince-edward-island': 'pe',
  'quebec': 'qc',       // Handles Québec
  'québec': 'qc',       // Direct French spelling
  'saskatchewan': 'sk',
  'yukon': 'yt',
  'yukon-territory': 'yt'
};

// Region definitions for multi-state areas
export const REGIONS = {
  'new-england': {
    name: 'New England',
    states: ['maine', 'vermont', 'new-hampshire', 'massachusetts', 'rhode-island', 'connecticut'],
    country: 'us'
  },
  'midwest': {
    name: 'Midwest',
    states: ['minnesota', 'wisconsin', 'michigan', 'north-dakota', 'south-dakota', 'iowa'],
    country: 'us'
  },
  'pacific-northwest': {
    name: 'Pacific Northwest',
    states: ['washington', 'oregon', 'idaho', 'montana'],
    country: 'us'
  },
  'great-lakes': {
    name: 'Great Lakes',
    states: ['minnesota', 'wisconsin', 'michigan', 'illinois', 'indiana', 'ohio'],
    country: 'us'
  },
  'prairie-provinces': {
    name: 'Prairie Provinces',
    states: ['alberta', 'saskatchewan', 'manitoba'],
    country: 'ca'
  },
  'atlantic-canada': {
    name: 'Atlantic Canada',
    states: ['new-brunswick', 'nova-scotia', 'prince-edward-island', 'newfoundland-and-labrador'],
    country: 'ca'
  }
};

/**
 * Normalize state/province name to ISO code
 * @param state - State or province name
 * @param countryCode - Country code (US or CA)
 * @returns ISO code or normalized slug
 */
export function normalizeStateSlug(state: string, countryCode: string): string {
  // Normalize input: lowercase, remove accents, replace spaces
  const normalized = state
    .toLowerCase()
    .normalize('NFD')                    // Decompose accents
    .replace(/[\u0300-\u036f]/g, '')    // Remove diacritics
    .replace(/\s+/g, '-')                // Spaces to hyphens
    .replace(/['']/g, '')                // Remove apostrophes
    .trim();

  // Select appropriate mapping based on country
  const isoMap = countryCode === 'US' ? US_STATE_ISO_MAP :
                 countryCode === 'CA' ? CA_PROVINCE_ISO_MAP :
                 {};

  // Return ISO code if found, otherwise return normalized string
  return isoMap[normalized] || normalized;
}

/**
 * Get country ISO code
 * @param country - Country name
 * @returns ISO country code
 */
export function getCountryISO(country: string): string {
  const countryMap: Record<string, string> = {
    'united states': 'us',
    'united-states': 'us',
    'usa': 'us',
    'canada': 'ca',
    'iceland': 'is',
    'norway': 'no',
    'sweden': 'se',
    'finland': 'fi',
    'russia': 'ru',
    'denmark': 'dk',
    'united kingdom': 'gb',
    'united-kingdom': 'gb',
    'uk': 'gb',
    'ireland': 'ie',
    'germany': 'de',
    'netherlands': 'nl',
    'poland': 'pl',
    'france': 'fr',
    'japan': 'jp',
    'greenland': 'gl'
  };

  const normalized = country.toLowerCase().replace(/\s+/g, '-');
  return countryMap[normalized] || normalized.slice(0, 2);
}

/**
 * Build state page URL
 * @param state - State name
 * @param country - Country name
 * @returns URL path like /us/ak or /ca/qc
 */
export function buildStateUrl(state: string, country: string): string {
  const countryISO = getCountryISO(country);
  const stateISO = normalizeStateSlug(state, countryISO.toUpperCase());
  return `/${countryISO}/${stateISO}`;
}

/**
 * Build region page URL
 * @param regionSlug - Region identifier
 * @returns URL path like /us/new-england
 */
export function buildRegionUrl(regionSlug: string): string {
  const region = REGIONS[regionSlug as keyof typeof REGIONS];
  if (!region) return `/region/${regionSlug}`;
  return `/${region.country}/${regionSlug}`;
}

/**
 * Check if a slug is a region
 * @param slug - URL slug to check
 * @returns true if slug is a region
 */
export function isRegion(slug: string): boolean {
  return slug in REGIONS;
}

/**
 * Get all states in a region
 * @param regionSlug - Region identifier
 * @returns Array of state ISO codes
 */
export function getRegionStates(regionSlug: string): string[] {
  const region = REGIONS[regionSlug as keyof typeof REGIONS];
  if (!region) return [];

  const countryCode = region.country.toUpperCase();
  return region.states.map(state => normalizeStateSlug(state, countryCode));
}

/**
 * Parse state/region URL
 * @param path - URL path like /us/ak or /ca/prairie-provinces
 * @returns Parsed components
 */
export function parseStateUrl(path: string): {
  country: string;
  state?: string;
  region?: string;
  isRegion: boolean;
} {
  const parts = path.split('/').filter(Boolean);
  if (parts.length !== 2) {
    throw new Error(`Invalid state/region URL: ${path}`);
  }

  const [country, slug] = parts;
  const isRegionUrl = isRegion(slug);

  return {
    country,
    ...(isRegionUrl ? { region: slug } : { state: slug }),
    isRegion: isRegionUrl
  };
}