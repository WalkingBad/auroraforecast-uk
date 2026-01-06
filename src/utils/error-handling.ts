/**
 * Error handling utilities for web-seo components
 * Provides graceful degradation and fallback mechanisms
 */

import { logger } from './logger';

export interface SafeApiData {
  h12?: Array<{
    time: string;
    kp: number;
    status: string;
    probAdj?: number;
    probBase?: number;
  }>;
  ui?: {
    statusColors?: Record<string, string>;
    statusTexts?: Record<string, string>;
  };
  tonight?: {
    status: string;
    probability: number;
  };
  currentStatus?: {
    level: string;
    probability: number;
    nextUpdate?: string;
  };
  conditions?: {
    kpIndex?: number;
    cloudCover?: number;
    moonIllumination?: number;
    skyDarkness?: string;
  };
  location?: {
    magneticLatitude?: number;
    localTime?: string;
  };
  h72Preview?: Array<{
    time: string;
    kp: number;
    vis: string;
  }>;
}

/**
 * Safely extract forecast data with fallbacks
 * Returns all entries (up to 24 = 72h), CSS hides extras for free users
 */
export function getSafeThreeHourForecast(apiData: SafeApiData): Array<{
  time: string;
  kp: number;
  status: string;
  probAdj?: number;
  probBase?: number;
}> {
  try {
    if (!apiData?.h12 || !Array.isArray(apiData.h12)) {
      return [];
    }

    return apiData.h12
      .slice(0, 24) // Up to 72h for premium, CSS hides for free
      .filter(hour =>
        hour &&
        typeof hour.time === 'string' &&
        typeof hour.kp === 'number' &&
        typeof hour.status === 'string'
      );
  } catch (error) {
    logger.error('Error processing forecast data:', error);
    return [];
  }
}

/**
 * Safely filter country cities with fallbacks
 */
export function getSafeCountryCities(
  citiesData: any[],
  currentCountry: string,
  currentSlug: string,
  maxCities: number = 6
): any[] {
  try {
    if (!Array.isArray(citiesData) || !currentCountry || !currentSlug) {
      return [];
    }

    return citiesData
      .filter(city =>
        city &&
        city.country === currentCountry &&
        city.slug !== currentSlug &&
        city.name &&
        city.slug
      )
      .slice(0, maxCities);
  } catch (error) {
    logger.error('Error filtering country cities:', error);
    return [];
  }
}

/**
 * Validate and sanitize city data
 */
export function validateCityData(cityData: any): boolean {
  return !!(
    cityData &&
    typeof cityData.name === 'string' &&
    typeof cityData.country === 'string' &&
    typeof cityData.slug === 'string' &&
    typeof cityData.lat === 'number' &&
    typeof cityData.lon === 'number'
  );
}

/**
 * Get safe status color with fallback
 */
export function getSafeStatusColor(
  statusColors: Record<string, string> | undefined,
  status: string,
  fallback: string = '#FF4747'
): string {
  try {
    return statusColors?.[status] || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Get safe status text with fallback
 */
export function getSafeStatusText(
  statusTexts: Record<string, string> | undefined,
  status: string,
  fallback?: string
): string {
  try {
    return statusTexts?.[status] || fallback || status.replace('_', ' ');
  } catch {
    return fallback || status.replace('_', ' ');
  }
}

/**
 * Format time safely with timezone fallback
 */
export function formatTimeSafely(
  timeString: string,
  timezone?: string,
  fallback: string = '--:--'
): string {
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return date.toLocaleTimeString('en-US', {
      timeZone: timezone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    logger.error('Error formatting time:', error);
    return fallback;
  }
}

/**
 * Check if device is mobile for responsive adjustments
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}