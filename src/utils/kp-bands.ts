/**
 * KpBands standardization for aurora visibility thresholds
 * Based on NOAA OVATION model and real-world observations
 */

export interface KpBands {
  horizon: number;    // Minimum Kp to see aurora on horizon
  noticeable: number; // Kp for clearly visible aurora
  bright: number;     // Kp for bright, overhead aurora
}

/**
 * Calculate KP bands based on magnetic latitude
 * Returns three threshold levels for different aurora intensities
 *
 * MUST match backend visibility-v2.service.ts getKpThreshold() exactly.
 * Based on NOAA auroral oval model: mlat ≈ 67° - 2° × Kp
 *
 * Sources:
 * - https://www.swpc.noaa.gov/content/tips-viewing-aurora
 * - https://www.swpc.noaa.gov/content/aurora-tutorial
 *
 * @param mlat - Magnetic latitude (absolute value used for both hemispheres)
 * @returns KpBands object with three threshold levels
 */
export function calculateKpBands(mlat: number | undefined): KpBands {
  // Default to 55° if no magnetic latitude provided (conservative)
  const absMlat = Math.abs(mlat ?? 55);

  // Based on NOAA formula: Kp_min ≈ (67 - mlat) / 2
  // Adjusted -1 for practical horizon visibility (can see ~5° north)
  // MUST match backend visibility-v2.service.ts getKpThreshold()
  let baseThreshold: number;
  if (absMlat >= 66) {
    baseThreshold = 1;      // High Arctic (Tromsø, Alta) - almost always visible
  } else if (absMlat >= 64) {
    baseThreshold = 2;      // Arctic zone (Fairbanks, Murmansk)
  } else if (absMlat >= 62) {
    baseThreshold = 3;      // Sub-Arctic (Reykjavik, Anchorage)
  } else if (absMlat >= 60) {
    baseThreshold = 4;      // Northern zone (Oslo, Helsinki)
  } else if (absMlat >= 57) {
    baseThreshold = 5;      // Northern Europe (Edinburgh, St. Petersburg)
  } else if (absMlat >= 54) {
    baseThreshold = 6;      // Mid-latitude (Copenhagen, Moscow)
  } else if (absMlat >= 51) {
    baseThreshold = 7;      // Low-mid latitude (London, Berlin)
  } else if (absMlat >= 48) {
    baseThreshold = 8;      // Low latitude (Paris, Prague)
  } else {
    baseThreshold = 9;      // Southern Europe - requires extreme G5 storms
  }

  // Calculate three levels based on aurora intensity
  // These offsets are calibrated from NOAA OVATION visibility boundaries
  return {
    horizon: baseThreshold,           // Minimum for horizon visibility
    noticeable: baseThreshold + 1.0,  // Clear aurora display
    bright: baseThreshold + 2.0       // Strong, overhead aurora
  };
}

/**
 * Format KpBands for display
 * @param bands - KpBands object
 * @param format - Display format ('range' or 'detailed')
 * @returns Formatted string
 */
export function formatKpBands(bands: KpBands, format: 'range' | 'detailed' = 'range'): string {
  if (format === 'range') {
    // Simple range format: "Kp 6.0–8.0"
    return `Kp ${bands.horizon.toFixed(1)}–${bands.bright.toFixed(1)}`;
  }

  // Detailed format with all three levels
  return `Horizon: Kp ${bands.horizon.toFixed(1)}+, ` +
         `Optimal: Kp ${bands.noticeable.toFixed(1)}–${bands.bright.toFixed(1)}`;
}

/**
 * Get descriptive text for KP band
 * @param kp - Current Kp value
 * @param bands - KpBands thresholds
 * @returns Descriptive text
 */
export function getKpBandDescription(kp: number, bands: KpBands): string {
  if (kp < bands.horizon) {
    return 'Too low for aurora visibility';
  } else if (kp < bands.noticeable) {
    return 'Aurora possible on northern horizon';
  } else if (kp < bands.bright) {
    return 'Aurora clearly visible';
  } else {
    return 'Bright aurora, potentially overhead';
  }
}

/**
 * Calculate probability based on Kp and bands
 * Maps Kp value to probability percentage
 * @param kp - Current Kp value
 * @param bands - KpBands thresholds
 * @returns Probability percentage (0-100)
 */
export function kpToProbability(kp: number, bands: KpBands): number {
  if (kp < bands.horizon - 1.0) return 2;  // Well below threshold
  if (kp < bands.horizon - 0.5) return 5;  // Close to threshold
  if (kp < bands.horizon) return 8;        // Just below threshold

  // Above threshold - calculate based on distance
  const distance = kp - bands.horizon;
  if (distance >= 3.0) return 80;  // Strong activity
  if (distance >= 2.0) return 60;  // Good activity
  if (distance >= 1.0) return 35;  // Moderate activity
  if (distance >= 0.5) return 20;  // Weak activity

  return 12; // Just at threshold
}

/**
 * Get KpBands for multiple cities and calculate range
 * Useful for state/region pages
 * @param magneticLatitudes - Array of magnetic latitudes
 * @returns Range of KpBands and statistics
 */
export function getKpBandsRange(magneticLatitudes: number[]): {
  min: KpBands;
  max: KpBands;
  average: KpBands;
  range: string;
} {
  if (magneticLatitudes.length === 0) {
    const defaultBands = calculateKpBands(60);
    return {
      min: defaultBands,
      max: defaultBands,
      average: defaultBands,
      range: formatKpBands(defaultBands)
    };
  }

  const allBands = magneticLatitudes.map(mlat => calculateKpBands(mlat));

  // Find min and max thresholds
  const minHorizon = Math.min(...allBands.map(b => b.horizon));
  const maxHorizon = Math.max(...allBands.map(b => b.horizon));

  const avgHorizon = allBands.reduce((sum, b) => sum + b.horizon, 0) / allBands.length;
  const avgNoticeable = allBands.reduce((sum, b) => sum + b.noticeable, 0) / allBands.length;
  const avgBright = allBands.reduce((sum, b) => sum + b.bright, 0) / allBands.length;

  return {
    min: allBands.find(b => b.horizon === minHorizon)!,
    max: allBands.find(b => b.horizon === maxHorizon)!,
    average: {
      horizon: avgHorizon,
      noticeable: avgNoticeable,
      bright: avgBright
    },
    range: `Kp ${minHorizon.toFixed(1)}–${maxHorizon.toFixed(1)}`
  };
}

/**
 * Create visual KP scale for display
 * @param bands - KpBands object
 * @param currentKp - Optional current Kp value to highlight
 * @returns Array of scale points for visualization
 */
export function createKpScale(bands: KpBands, currentKp?: number): Array<{
  value: number;
  label: string;
  status: 'inactive' | 'horizon' | 'noticeable' | 'bright' | 'current';
}> {
  const scale = [];

  for (let kp = 0; kp <= 9; kp++) {
    let status: 'inactive' | 'horizon' | 'noticeable' | 'bright' | 'current' = 'inactive';

    if (currentKp && Math.abs(kp - currentKp) < 0.25) {
      status = 'current';
    } else if (kp >= bands.bright) {
      status = 'bright';
    } else if (kp >= bands.noticeable) {
      status = 'noticeable';
    } else if (kp >= bands.horizon) {
      status = 'horizon';
    }

    scale.push({
      value: kp,
      label: `Kp${kp}`,
      status
    });
  }

  return scale;
}

/**
 * Calculate minimum KP threshold for aurora visibility
 * (Legacy wrapper for backwards compatibility - same as horizon band)
 * @param mlat - Magnetic latitude
 * @returns Minimum Kp threshold (same as horizon band)
 */
export function calculateKpThreshold(mlat: number | undefined): number {
  return calculateKpBands(mlat).horizon;
}

/**
 * Format KP threshold for display (e.g., "Kp 4.5+" or "Kp 7+")
 * @param threshold - Kp threshold value
 * @returns Formatted string
 */
export function formatKpThreshold(threshold: number): string {
  const rounded = Math.round(threshold * 2) / 2;
  return `Kp ${rounded}+`;
}