/**
 * KP Index Calculation Utility
 * Extracted from aurora-tracker.astro to avoid code duplication
 *
 * Estimates global Kp index based on percentage of cities with different aurora statuses
 * Algorithm calibrated from historical data analysis
 */

export interface StatusCounts {
  high?: number;
  medium?: number;
  low?: number;
  very_low?: number;
  unknown?: number;
}

export interface GlobalCityStatuses {
  [citySlug: string]: {
    status: string;
    statusText: string;
    color: string;
  };
}

/**
 * Calculate global Kp index from city statuses
 * @param statuses - Object containing all city statuses
 * @returns Estimated Kp value (0-9 scale)
 */
export function calculateGlobalKp(statuses: GlobalCityStatuses): number {
  // Count cities by status
  const statusCounts: StatusCounts = {};

  for (const city of Object.values(statuses)) {
    const status = city.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  // Filter out unknown status for percentage calculation
  const totalCities = Object.values(statuses).filter(
    c => c.status !== 'unknown'
  ).length;

  // Fallback if no valid cities
  if (totalCities === 0) {
    return 2.0;
  }

  const highPercentage = (statusCounts.high || 0) / totalCities;
  const mediumPercentage = (statusCounts.medium || 0) / totalCities;

  // Algorithm from aurora-tracker.astro:93-101
  if (highPercentage >= 0.3) return 6.0;
  if (highPercentage >= 0.15) return 5.0;
  if (highPercentage >= 0.05 || mediumPercentage >= 0.3) return 4.0;
  if (mediumPercentage >= 0.15) return 3.5;
  if (mediumPercentage >= 0.05) return 3.0;

  return 2.0;
}

/**
 * Get CSS color variable for Kp value
 * @param kp - Kp index value
 * @returns CSS variable string
 */
export function getKpColor(kp: number): string {
  if (kp >= 6) return 'var(--aurora-status-high)';
  if (kp >= 4) return 'var(--aurora-status-medium)';
  if (kp >= 2) return 'var(--aurora-status-low)';
  return 'var(--aurora-text-tertiary)';
}

/**
 * Get human-readable label for Kp value
 * @param kp - Kp index value
 * @returns Activity level label
 */
export function getKpLabel(kp: number): string {
  if (kp >= 6) return 'Strong Activity';
  if (kp >= 4) return 'Moderate Activity';
  if (kp >= 2) return 'Weak Activity';
  return 'Very Weak Activity';
}

/**
 * Count status occurrences
 * @param statuses - Object containing all city statuses
 * @returns Status counts object
 */
export function countStatuses(statuses: GlobalCityStatuses): StatusCounts {
  const counts: StatusCounts = {};

  for (const city of Object.values(statuses)) {
    const status = city.status;
    counts[status] = (counts[status] || 0) + 1;
  }

  return counts;
}
