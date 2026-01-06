import type { FactorDefinition } from '../data/factor-definitions.ts';
import { StatusThresholds } from '../data/status-thresholds.ts';

/**
 * ICAO/WMO aligned overcast threshold (85%+ = official overcast)
 * Used to determine when clouds completely block aurora visibility
 */
export const OVERCAST_THRESHOLD = 85;

export interface FactorDisplay {
  label: string;
  value: string;
  cls: string;
  emoji?: string;
}

export function colorTypeToCssClass(colorType: string): string {
  return `card-${colorType}`;
}

export function getMagLat(mlat: any, factorDefs: Record<string, FactorDefinition>): FactorDisplay {
  if (typeof mlat !== 'number') return { label: '—', value: '—', cls: 'card-danger' };
  const factor = factorDefs.magneticLatitude;

  // Thresholds aligned with realistic aurora visibility physics
  let statusKey = 'low';
  if (mlat >= 62.0) statusKey = 'perfect';      // Above 62.0° - Excellent aurora visibility (daily activity)
  else if (mlat >= 56.0) statusKey = 'good';    // 56.0° - 62.0° - Good aurora visibility (regular storms)
  else if (mlat >= 50.0) statusKey = 'acceptable'; // 50.0° - 56.0° - Fair aurora visibility (strong storms only)
  // Below 50.0° = low (poor aurora visibility - extreme storms)

  const status = factor.statuses[statusKey];
  return {
    label: status.label,
    value: `${mlat.toFixed(1)}°`,
    cls: colorTypeToCssClass(status.colorType)
  };
}

export function getKp(kp: any, factorDefs: Record<string, FactorDefinition>): FactorDisplay {
  if (typeof kp !== 'number') return { label: '—', value: '—', cls: 'card-danger' };
  const factor = factorDefs.kp;

  // Thresholds pulled from app (generated via sync)
  const T = StatusThresholds.kp;
  let statusKey: keyof typeof factor.statuses = 'veryQuiet';
  if (kp >= T.storm) statusKey = 'storm';
  else if (kp >= T.good) statusKey = 'good';
  else if (kp >= T.low) statusKey = 'low';
  // Kp 0-1 = veryQuiet (default)

  const status = factor.statuses[statusKey] || factor.statuses['veryQuiet'];
  return {
    label: status.label,
    value: kp.toFixed(1).replace(/\.0$/, ''),
    cls: colorTypeToCssClass(status.colorType)
  };
}

export function getWeather(cloud: any, factorDefs: Record<string, FactorDefinition>): FactorDisplay {
  if (typeof cloud !== 'number') return { label: '—', value: '', emoji: '☁️', cls: 'card-orange' };
  const factor = factorDefs.weather;

  // Thresholds for cloud coverage (synced from app)
  const W = (StatusThresholds as any).weather || { clear: 20, partlyCloudy: 50, cloudy: 80 };
  let statusKey = 'overcast';
  if (cloud <= W.clear) statusKey = 'clear';
  else if (cloud <= W.partlyCloudy) statusKey = 'partlyCloudy';
  else if (cloud <= W.cloudy) statusKey = 'cloudy';
  // 81-100% = overcast (default)

  const status = factor.statuses[statusKey];
  return {
    label: status.label,
    value: '', // Убрали проценты - они неверные
    emoji: status.emoji,
    cls: colorTypeToCssClass(status.colorType)
  };
}

export function getMoon(illum: any, factorDefs: Record<string, FactorDefinition>): FactorDisplay {
  if (typeof illum !== 'number') return { label: '—', value: '—', emoji: '🌙', cls: 'card-orange' };
  const factor = factorDefs.moon;

  // Moon phase thresholds from app (generated via sync)
  const M = StatusThresholds.moon;
  let statusKey = 'full';
  if (illum < M.newMoon) statusKey = 'newMoon';
  else if (illum < M.crescent) statusKey = 'crescent';
  else if (illum < M.quarter) statusKey = 'quarter';
  else if (illum < M.gibbous) statusKey = 'gibbous';

  const status = factor.statuses[statusKey];
  return {
    label: status.label,
    value: `${illum}%`,
    emoji: status.emoji,
    cls: colorTypeToCssClass(status.colorType)
  };
}

export function getDarkness(stage: any, factorDefs: Record<string, FactorDefinition>): FactorDisplay {
  const factor = factorDefs.darkness;

  // Map API values to factor definitions
  let statusKey = 'daylight';
  if (stage === 'dark' || stage === 'night') statusKey = 'night';
  else if (stage === 'astronomical') statusKey = 'astronomical';
  else if (stage === 'nautical') statusKey = 'nautical';
  else if (stage === 'twilight') statusKey = 'nautical'; // Generic twilight maps to nautical
  // daylight/civil = daylight (default)

  const status = factor.statuses[statusKey];
  return {
    label: status.label,
    value: '',
    cls: colorTypeToCssClass(status.colorType)
  };
}
