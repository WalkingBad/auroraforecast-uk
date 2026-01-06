/**
 * API Helpers
 * Utilities for fetching city data from seoSnapshot API
 */

import { DEFAULT_STATUS_COLORS, DEFAULT_STATUS_TEXTS } from '../data/status-defaults';

/**
 * Strips trailing slashes from URL
 */
export function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Checks if the base URL is a serverless functions host
 */
export function isServerlessFunctionsHost(base: string): boolean {
  return /(cloudfunctions\.net|run\.app|localhost:5001|127\.0\.0\.1:5001)/i.test(base);
}

/**
 * Builds SEO snapshot endpoints with fallbacks
 */
export function buildSeoSnapshotEndpoints(lat: number, lon: number): string[] {
  const configuredBase = import.meta.env.PUBLIC_API_BASE_URL;
  const bases: Array<string> = [];

  if (configuredBase && configuredBase.trim().length > 0) {
    bases.push(stripTrailingSlashes(configuredBase.trim()));
  }

  const defaultWebsite = stripTrailingSlashes('https://auroraforecast.uk');
  const defaultFunctions = stripTrailingSlashes('https://europe-west1-aurorame-621f6.cloudfunctions.net');

  if (!bases.includes(defaultWebsite)) {
    bases.push(defaultWebsite);
  }
  if (!bases.includes(defaultFunctions)) {
    bases.push(defaultFunctions);
  }

  const endpoints = new Set<string>();
  const timestamp = Date.now();

  for (const base of bases) {
    if (!base) continue;

    if (base.endsWith('/seoSnapshot')) {
      endpoints.add(`${base}?lat=${lat}&lon=${lon}&_t=${timestamp}`);
      continue;
    }

    endpoints.add(`${base}/seoSnapshot?lat=${lat}&lon=${lon}&_t=${timestamp}`);

    const shouldAddApiPrefix = !base.endsWith('/api') && !isServerlessFunctionsHost(base);
    if (shouldAddApiPrefix) {
      endpoints.add(`${base}/api/seoSnapshot?lat=${lat}&lon=${lon}&_t=${timestamp}`);
    }
  }

  return Array.from(endpoints);
}

/**
 * Loads city data from seoSnapshot API with fallback
 * @param lat - Latitude
 * @param lon - Longitude
 * @param cityName - City name for logging
 * @param cityData - City data for fallback (magneticLat)
 * @returns API data or fallback minimal structure
 */
export async function loadCityData(lat: number, lon: number, cityName: string, cityData?: any) {
  try {
    const endpoints = buildSeoSnapshotEndpoints(lat, lon);
    const attemptErrors: string[] = [];

    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'AuroraMe-Web/1.0'
          }
        });

        if (!resp.ok) {
          attemptErrors.push(`${url} -> ${resp.status} ${resp.statusText}`);
          continue;
        }

        const data = await resp.json();
        return data;
      } catch (innerError) {
        const reason = innerError instanceof Error ? innerError.message : String(innerError);
        attemptErrors.push(`${url} -> ${reason}`);
      }
    }

    throw new Error(`All seoSnapshot attempts failed: ${attemptErrors.join(' | ')}`);
  } catch (error) {
    console.error('API fetch failed for', cityName, ':', error);

    // Fallback to minimal data structure
    return {
      ui: {
        statusTexts: DEFAULT_STATUS_TEXTS,
        statusColors: DEFAULT_STATUS_COLORS
      },
      tonight: { status: 'very_low', probability: 0 },
      currentStatus: { level: 'very_low', probability: 0 },
      conditions: {},
      location: { magneticLatitude: cityData?.magneticLat || 60 },
      h12: []
    };
  }
}