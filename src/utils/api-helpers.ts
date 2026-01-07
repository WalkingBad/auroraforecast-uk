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
 * Builds SEO snapshot endpoints - Cloud Functions only (no local proxy)
 */
export function buildSeoSnapshotEndpoints(lat: number, lon: number): string[] {
  const timestamp = Date.now();

  // Primary: Cloud Functions endpoint
  const cloudFunctionsUrl = 'https://europe-west1-aurorame-621f6.cloudfunctions.net/seoSnapshot';

  // Optional: custom API base from env (for dev/staging)
  const configuredBase = import.meta.env.PUBLIC_API_BASE_URL;

  const endpoints: string[] = [];

  // Add configured base first if it's a serverless host
  if (configuredBase && configuredBase.trim().length > 0) {
    const base = stripTrailingSlashes(configuredBase.trim());
    if (isServerlessFunctionsHost(base)) {
      endpoints.push(`${base}/seoSnapshot?lat=${lat}&lon=${lon}&_t=${timestamp}`);
    }
  }

  // Always add Cloud Functions as primary/fallback
  if (!endpoints.some(e => e.includes('cloudfunctions.net'))) {
    endpoints.push(`${cloudFunctionsUrl}?lat=${lat}&lon=${lon}&_t=${timestamp}`);
  }

  return endpoints;
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