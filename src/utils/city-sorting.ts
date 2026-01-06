/**
 * City sorting utilities for aurora forecast pages
 * Sorts cities by current aurora status (active to inactive) with magnetic latitude as secondary criterion
 */

// City interface matching cities.json structure
interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  magneticLat: number;
  timezone: string;
  description: string;
  state?: string;
}

// Aurora status priority order (higher number = higher priority)
const STATUS_PRIORITY: Record<string, number> = {
  'high': 5,       // Green - "Visible" - highest priority
  'medium': 4,     // Yellow - "Likely Visible"
  'low': 3,        // Orange - "Might be Visible"
  'very_low': 2,   // Red - "Unlikely"
  'unknown': 1     // Gray - "Check forecast" - lowest priority
} as const;

/**
 * Compare function for sorting cities by aurora status + magnetic latitude
 * Primary: Aurora status (high → medium → low → very_low → unknown)
 * Secondary: Magnetic latitude (higher = better for aurora)
 */
export function compareByStatusAndMagLat(
  a: City,
  b: City,
  statusMap: Record<string, { status: string }> = {}
): number {
  // Get current status for each city
  const aStatus = statusMap[a.slug]?.status || 'unknown';
  const bStatus = statusMap[b.slug]?.status || 'unknown';

  // Get priority values for statuses
  const aPriority = STATUS_PRIORITY[aStatus] || STATUS_PRIORITY['unknown'];
  const bPriority = STATUS_PRIORITY[bStatus] || STATUS_PRIORITY['unknown'];

  // Primary sort: by status priority (descending)
  if (aPriority !== bPriority) {
    return bPriority - aPriority;
  }

  // Secondary sort: by magnetic latitude (descending - higher is better)
  const aMagLat = a.magneticLat || 0;
  const bMagLat = b.magneticLat || 0;
  return bMagLat - aMagLat;
}

/**
 * Sort cities array by aurora status with magnetic latitude fallback
 * Returns a new sorted array (does not mutate original)
 */
export function sortCitiesByStatusAndMagLat(
  cities: City[],
  statusMap: Record<string, { status: string }> = {}
): City[] {
  return [...cities].sort((a, b) => compareByStatusAndMagLat(a, b, statusMap));
}

/**
 * Get display name for sorting explanation in UI
 */
export function getSortingExplanation(hasStatusData: boolean = true): string {
  return hasStatusData
    ? "cities by current aurora activity and magnetic latitude"
    : "cities by magnetic latitude (aurora data loading...)";
}