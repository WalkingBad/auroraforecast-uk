/**
 * City Data Helper Utilities
 * Reusable functions for city data preparation and sorting
 * Extracted from aurora-tracker.astro to avoid code duplication
 */

export interface PreparedCity {
  name: string;
  slug: string;
  country: string;
  countryCode?: string;
  state?: string;
  magneticLat: number;
  status: string;
  statusText: string;
  color: string;
  url: string;
}

export interface CityMetadata {
  name: string;
  slug: string;
  country: string;
  countryCode?: string;
  state?: string;
  stateName?: string;
  magneticLat: number;
}

export interface MinimalCityStatus {
  status: string;
  statusText: string;
  color: string;
}

/**
 * Build city URL from metadata
 * Follows the routing pattern: /{city-slug}
 */
export function buildCityUrl(city: CityMetadata): string {
  return `/${city.slug}`;
}

/**
 * Prepare city data for display
 * Combines city metadata with status information
 */
export function prepareCityData(
  citySlug: string,
  cityStatus: MinimalCityStatus,
  cityMeta: CityMetadata
): PreparedCity {
  return {
    name: cityMeta.name,
    slug: citySlug,
    country: cityMeta.country,
    countryCode: cityMeta.countryCode,
    state: cityMeta.stateName || cityMeta.state,
    magneticLat: cityMeta.magneticLat,
    status: cityStatus.status,
    statusText: cityStatus.statusText,
    color: cityStatus.color,
    url: buildCityUrl(cityMeta)
  };
}

/**
 * Sort cities by status priority and magnetic latitude
 * Status priority: high > medium > low > very_low > unknown
 * Within same status: higher magnetic latitude first
 */
export function sortCitiesByStatus(cities: PreparedCity[]): PreparedCity[] {
  const statusPriority: Record<string, number> = {
    'high': 3,
    'medium': 2,
    'low': 1,
    'very_low': 0,
    'unknown': 0
  };

  return [...cities].sort((a, b) => {
    // First sort by status priority
    const priorityDiff = (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
    if (priorityDiff !== 0) return priorityDiff;

    // Then by magnetic latitude (higher first)
    return b.magneticLat - a.magneticLat;
  });
}

/**
 * Get top N cities by status
 * Automatically sorts before returning
 */
export function getTopCitiesByStatus(
  cities: PreparedCity[],
  limit: number = 5
): PreparedCity[] {
  const sorted = sortCitiesByStatus(cities);
  return sorted.slice(0, limit);
}

/**
 * Filter cities by status
 */
export function filterCitiesByStatus(
  cities: PreparedCity[],
  statusFilter: string | string[]
): PreparedCity[] {
  const filters = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
  return cities.filter(city => filters.includes(city.status));
}

/**
 * Get cities with high visibility (high status only)
 */
export function getHighVisibilityCities(cities: PreparedCity[]): PreparedCity[] {
  return filterCitiesByStatus(cities, 'high');
}

/**
 * Create search index for client-side search
 * Returns data ready to be injected into page
 */
export function createSearchIndex(cities: PreparedCity[]) {
  return cities.map(city => ({
    name: city.name,
    slug: city.slug,
    country: city.country,
    state: city.state,
    url: city.url,
    status: city.status,
    color: city.color,
    // Create searchable string
    searchText: `${city.name.toLowerCase()} ${city.country.toLowerCase()} ${city.state?.toLowerCase() || ''}`
  }));
}
