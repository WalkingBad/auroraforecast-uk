/**
 * Utility functions for geo-specific naming and SEO optimization
 */

export interface CityData {
  name: string;
  country: string;
  state?: string;
  countryCode: string;
  slug: string;
}

/**
 * Generate geo-specific name prioritizing state/province for US/Canada
 */
export function getGeoSpecificName(city: CityData): string {
  if ((city.countryCode === 'US' || city.countryCode === 'CA') && city.state) {
    return `${city.name}, ${city.state}`;
  }
  return `${city.name}, ${city.country}`;
}

/**
 * Generate optimized H1 title with geo-priority and length limits
 */
export function generateOptimizedH1(city: CityData): string {
  const geoName = getGeoSpecificName(city);
  return `Aurora forecast & visibility in ${geoName}`;
}

/**
 * Generate optimized SEO title with 60-character limit
 */
export function generateOptimizedTitle(city: CityData): string {
  const maxLength = 60;

  // Try different title formats in order of preference
  const geoName = getGeoSpecificName(city);

  const primary = `Aurora forecast in ${geoName} tonight`;
  if (primary.length <= maxLength) {
    return primary;
  }

  const shorterGeo = `Aurora forecast in ${city.name} tonight`;
  if (shorterGeo.length <= maxLength) {
    return shorterGeo;
  }

  const minimal = `Aurora forecast ${city.name}`;
  if (minimal.length <= maxLength) {
    return minimal;
  }

  return minimal.slice(0, maxLength);
}

/**
 * Generate optimized meta description with geo-specific details
 */
export function generateOptimizedDescription(city: CityData): string {
  const geoName = getGeoSpecificName(city);
  return `Live aurora visibility forecast for ${geoName}. Check tonight's conditions, cloud cover, moon phase and optimal viewing times.`;
}

/**
 * Append brand to a title while respecting max length
 */
export function appendBrand(title: string, options: { brand?: string; maxLength?: number } = {}): string {
  const { brand = 'AuroraMe', maxLength = 60 } = options;
  if (!title) {
    return brand;
  }
  if (title.includes(brand)) {
    return title;
  }

  const suffix = ` | ${brand}`;
  if (title.length + suffix.length <= maxLength) {
    return `${title}${suffix}`;
  }

  const limit = Math.max(0, maxLength - suffix.length);
  let trimmed = title.slice(0, limit);
  if (title.length > limit) {
    trimmed = trimmed.replace(/\s+\S*$/, '').trim();
  }
  if (!trimmed) {
    trimmed = title.slice(0, limit).trim();
  }

  return `${trimmed}${suffix}`;
}
