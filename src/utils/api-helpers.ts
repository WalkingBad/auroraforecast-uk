/**
 * API Helpers
 * Utilities for fetching city data from seoSnapshot API
 */

import { DEFAULT_STATUS_COLORS, DEFAULT_STATUS_TEXTS } from '../data/status-defaults';
import { API_BASE } from '../config/api';

/**
 * Builds SEO snapshot endpoints using centralized API config
 */
export function buildSeoSnapshotEndpoints(lat: number, lon: number): string[] {
  const timestamp = Date.now();
  return [`${API_BASE}/seoSnapshot?lat=${lat}&lon=${lon}&_t=${timestamp}`];
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