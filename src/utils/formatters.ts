/**
 * Formatting Utilities
 * Common text and data formatting functions used across pages
 */

/**
 * Converts text to title case
 * @param text - The text to convert
 * @returns Text in title case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts factor status strings to display format
 * @param statuses - Array of status strings
 * @returns Formatted status object
 */
export function convertFactorStatuses(statuses: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  statuses.forEach(status => {
    const normalized = status.toLowerCase().replace(/[_-]/g, ' ');
    result[status] = toTitleCase(normalized);
  });

  return result;
}

/**
 * Formats a number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Formats a duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "2h 30m", "45m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}