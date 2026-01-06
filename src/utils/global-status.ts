/**
 * Global Status Loader
 * Loads all city statuses once at build time and caches for all pages
 * Optimizes performance by reducing API calls from 71 to 1
 */

import { logger } from './logger';

interface MinimalCityStatus {
  status: string;
  statusText: string;
  color: string;
}

type GlobalCityStatuses = Record<string, MinimalCityStatus>;

// Global cache for city statuses
let globalStatuses: GlobalCityStatuses | null = null;
let loadingPromise: Promise<GlobalCityStatuses> | null = null;

/**
 * Load all city statuses from the optimized API endpoint
 * Uses singleton pattern to ensure only one API call per build
 */
export async function loadGlobalCityStatuses(): Promise<GlobalCityStatuses> {
  // Return cached data if available
  if (globalStatuses) {
    return globalStatuses;
  }

  // Return existing loading promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = loadStatusesFromAPI();

  try {
    globalStatuses = await loadingPromise;
    return globalStatuses;
  } catch (error) {
    // Reset loading promise on error so retry is possible
    loadingPromise = null;
    throw error;
  } finally {
    // Clear loading promise once completed (success or failure)
    loadingPromise = null;
  }
}

/**
 * Get cached statuses without triggering a load
 * Returns empty object if not loaded yet
 */
export function getCachedCityStatuses(): GlobalCityStatuses {
  return globalStatuses || {};
}

/**
 * Get status for a specific city from cache
 * Returns fallback status if city not found
 */
export function getCityStatus(citySlug: string): MinimalCityStatus {
  const cached = getCachedCityStatuses();
  return cached[citySlug] || {
    status: 'unknown',
    statusText: 'Check forecast',
    color: '#666666'
  };
}

/**
 * Load statuses from the optimized batch API
 */
const DEFAULT_FUNCTIONS_BASE = 'https://europe-west1-aurorame-621f6.cloudfunctions.net';
const STATUS_ENDPOINT = 'allCitiesStatus';

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

function isServerlessFunctionsHost(base: string): boolean {
  return /(cloudfunctions\.net|run\.app|localhost:5001|127\.0\.0\.1:5001)/i.test(base);
}

function buildStatusEndpointCandidates(): string[] {
  const configuredBase = import.meta.env.PUBLIC_API_BASE_URL;
  const bases: Array<string> = [];

  if (configuredBase && configuredBase.trim().length > 0) {
    bases.push(stripTrailingSlashes(configuredBase.trim()));
  }

  const normalizedDefault = stripTrailingSlashes(DEFAULT_FUNCTIONS_BASE);
  if (!bases.includes(normalizedDefault)) {
    bases.push(normalizedDefault);
  }

  const candidates = new Set<string>();

  for (const base of bases) {
    if (!base) continue;

    if (base.endsWith(`/${STATUS_ENDPOINT}`)) {
      candidates.add(base);
      continue;
    }

    candidates.add(`${base}/${STATUS_ENDPOINT}`);

    const shouldAddApiPrefix = !base.endsWith('/api') && !isServerlessFunctionsHost(base);
    if (shouldAddApiPrefix) {
      candidates.add(`${base}/api/${STATUS_ENDPOINT}`);
    }
  }

  return Array.from(candidates);
}

async function loadStatusesFromAPI(): Promise<GlobalCityStatuses> {
  const candidateUrls = buildStatusEndpointCandidates();
  const startTime = Date.now();

  try {
    logger.log('🌍 Loading all city statuses...');
    logger.log('   Candidates:', candidateUrls);

    const attemptErrors: string[] = [];
    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AuroraMe-Web/1.0'
          }
        });

        if (!response.ok) {
          attemptErrors.push(`${url} -> ${response.status} ${response.statusText}`);
          continue;
        }

        const statuses = await response.json();
        const loadTime = Date.now() - startTime;
        const cityCount = Object.keys(statuses).length;

        logger.log(`✅ Loaded ${cityCount} city statuses in ${loadTime}ms`);

        if (typeof statuses !== 'object' || statuses === null) {
          throw new Error('Invalid response format: expected object');
        }

        return statuses;
      } catch (innerError) {
        const reason = innerError instanceof Error ? innerError.message : String(innerError);
        attemptErrors.push(`${url} -> ${reason}`);
      }
    }

    throw new Error(`All API attempts failed: ${attemptErrors.join(' | ')}`);

  } catch (error) {
    const loadTime = Date.now() - startTime;
    logger.error(`❌ Failed to load city statuses after ${loadTime}ms:`, error);

    // Return empty object as fallback
    // This allows the build to continue even if the API is unavailable
    return {};
  }
}

/**
 * Reset cache - useful for testing or forced refresh
 */
export function resetGlobalCache(): void {
  globalStatuses = null;
  loadingPromise = null;
}
