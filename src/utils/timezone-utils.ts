/**
 * Timezone utilities for accurate timezone detection from coordinates
 * Uses tz-lookup library (same as backend functions) for IANA timezone strings
 */

// @ts-ignore - tz-lookup doesn't have proper TypeScript definitions
import tzlookup from 'tz-lookup';

/**
 * Get IANA timezone string from coordinates
 * Uses the same tz-lookup library as backend functions for consistency
 *
 * @param lat Latitude (-90 to 90)
 * @param lon Longitude (-180 to 180)
 * @returns IANA timezone string (e.g., "Europe/Stockholm") or "UTC" fallback
 */
export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  try {
    // Validate coordinates
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.warn(`Invalid coordinates: lat=${lat}, lon=${lon}. Using UTC fallback.`);
      return 'UTC';
    }

    const timezone = tzlookup(lat, lon);

    if (!timezone || typeof timezone !== 'string') {
      console.warn(`No timezone found for coordinates: lat=${lat}, lon=${lon}. Using UTC fallback.`);
      return 'UTC';
    }

    return timezone;
  } catch (error) {
    console.error(`Error getting timezone for coordinates lat=${lat}, lon=${lon}:`, error);
    return 'UTC';
  }
}

/**
 * Validate IANA timezone string
 * @param timezone IANA timezone string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat('en', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current time in specified timezone
 * @param timezone IANA timezone string
 * @returns Date object representing current time in timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  try {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);

    // Use Intl.DateTimeFormat to get timezone offset
    const timeInTz = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    const timeMap = timeInTz.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

    return new Date(
      parseInt(timeMap.year!),
      parseInt(timeMap.month!) - 1,
      parseInt(timeMap.day!),
      parseInt(timeMap.hour!),
      parseInt(timeMap.minute!),
      parseInt(timeMap.second!)
    );
  } catch (error) {
    console.error(`Error getting current time for timezone ${timezone}:`, error);
    return new Date();
  }
}

/**
 * Format time safely with timezone fallback (enhanced version from error-handling.ts)
 * @param timeString ISO time string
 * @param timezone IANA timezone string
 * @param fallback Fallback string if formatting fails
 * @returns Formatted time string
 */
export function formatTimeWithTimezone(
  timeString: string,
  timezone: string,
  fallback: string = '--:--'
): string {
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    // Validate timezone first
    if (!isValidTimezone(timezone)) {
      console.warn(`Invalid timezone: ${timezone}. Using UTC.`);
      timezone = 'UTC';
    }

    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return fallback;
  }
}