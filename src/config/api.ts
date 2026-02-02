/**
 * Centralized API Configuration for auroraforecast-uk
 *
 * This file serves as the single source of truth for all API URLs.
 * Environment variables can override defaults for different deployments.
 *
 * Usage:
 *   import { API_BASE, AURORA_SUMMARY_API, apiUrl } from '../config/api';
 */

// Primary API base URL - Firebase Cloud Functions
// Can be overridden via PUBLIC_API_BASE_URL env variable
// Trailing slash removed to prevent // in URLs like ${API_BASE}/endpoint
const rawApiBase = import.meta.env.PUBLIC_API_BASE_URL
  || 'https://europe-west1-aurorame-621f6.cloudfunctions.net';
export const API_BASE = rawApiBase.replace(/\/+$/, '');

// Aurora Summary API - Cloud Run service for historical data
// Can be overridden via PUBLIC_AURORA_SUMMARY_URL env variable
const rawSummaryApi = import.meta.env.PUBLIC_AURORA_SUMMARY_URL
  || 'https://httpaurorasummary-o4f4vlg27q-ew.a.run.app';
export const AURORA_SUMMARY_API = rawSummaryApi.replace(/\/+$/, '');

/**
 * Helper to construct full API URLs
 * @param endpoint - The endpoint path (e.g., '/seoSnapshot' or 'seoSnapshot')
 * @returns Full URL including the API base
 */
export function apiUrl(endpoint: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}
