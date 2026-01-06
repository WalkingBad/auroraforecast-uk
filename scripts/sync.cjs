#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Syncing Flutter content to web...');

try {
  const appRoot = process.env.APP_ROOT
    ? path.resolve(process.env.APP_ROOT)
    : path.resolve(__dirname, '../../app');

  if (!fs.existsSync(appRoot)) {
    console.log('ℹ️  Flutter app source not found. Skipping sync.');
    console.log('   Set APP_ROOT to the app repo root if you want to sync shared content.');
    process.exit(0);
  }

  // 1. Read Flutter ARB file
  const arbPath = path.join(appRoot, 'lib', 'l10n', 'app_en.arb');
  if (!fs.existsSync(arbPath)) {
    throw new Error(`Flutter ARB file not found: ${arbPath}`);
  }

  const arb = JSON.parse(fs.readFileSync(arbPath, 'utf8'));

  // Track missing ARB keys
  const missingKeys = [];

  // 2. Helper function to generate factor data from ARB
  function generateFactorData(arb, keys) {
    return {
      magneticLatitude: {
        icon: '🧭',
        title: arb['magnetic_latitude'] || (keys.push('magnetic_latitude'), 'Magnetic Latitude'),
        description: arb['info_mag_lat_desc'] || (keys.push('info_mag_lat_desc'), "Higher magnetic latitude = better aurora visibility."),
        statuses: {
          perfect: {
            label: arb['mag_lat_perfect'] || (keys.push('mag_lat_perfect'), 'Perfect'),
            description: arb['mag_lat_perfect_desc'] || (keys.push('mag_lat_perfect_desc'), 'Above 62.0°'),
            colorType: 'success'
          },
          good: {
            label: arb['mag_lat_good'] || (keys.push('mag_lat_good'), 'Good'),
            description: arb['mag_lat_good_desc'] || (keys.push('mag_lat_good_desc'), '56.0° - 62.0°'),
            colorType: 'orange'
          },
          acceptable: {
            label: arb['mag_lat_acceptable'] || (keys.push('mag_lat_acceptable'), 'Acceptable'),
            description: arb['mag_lat_acceptable_desc'] || (keys.push('mag_lat_acceptable_desc'), '50.0° - 56.0°'),
            colorType: 'yellow'
          },
          low: {
            label: arb['mag_lat_low'] || (keys.push('mag_lat_low'), 'Low'),
            description: arb['mag_lat_low_desc'] || (keys.push('mag_lat_low_desc'), 'Below 50.0°'),
            colorType: 'danger'
          }
        }
      },
      kp: {
        icon: '📊',
        title: arb['kp_index'] || (keys.push('kp_index'), 'Kp Index'),
        description: arb['info_kp_desc'] || (keys.push('info_kp_desc'), 'Global geomagnetic activity measurement from 0-9.'),
        statuses: {
          storm: {
            label: arb['kp_storm'] || (keys.push('kp_storm'), 'Storm'),
            description: arb['kp_storm_desc'] || (keys.push('kp_storm_desc'), 'Kp 5-9'),
            colorType: 'success'
          },
          good: {
            label: arb['kp_good'] || (keys.push('kp_good'), 'Good'),
            description: arb['kp_active_desc'] || (keys.push('kp_active_desc'), 'Kp 3-6 - Moderate activity, good conditions'),
            colorType: 'yellow'
          },
          low: {
            label: arb['kp_low'] || (keys.push('kp_low'), 'Low'),
            description: arb['kp_quiet_desc'] || (keys.push('kp_quiet_desc'), 'Kp 1-3 - Low activity, weak auroras'),
            colorType: 'orange'
          },
          veryQuiet: {
            label: arb['kp_very_quiet'] || (keys.push('kp_very_quiet'), 'Very Quiet'),
            description: arb['kp_very_quiet_desc'] || (keys.push('kp_very_quiet_desc'), 'Kp 0-1'),
            colorType: 'danger'
          }
        }
      },
      weather: {
        icon: '☁️',
        title: arb['info_weather_title'] || (keys.push('info_weather_title'), 'Weather Conditions Impact'),
        description: arb['info_weather_desc'] || (keys.push('info_weather_desc'), 'Cloud coverage affects aurora visibility.'),
        statuses: {
          clear: {
            label: arb['weather_clear'] || (keys.push('weather_clear'), 'Clear'),
            description: arb['weather_clear_desc'] || (keys.push('weather_clear_desc'), 'Clear skies'),
            colorType: 'success',
            emoji: '☀️'
          },
          partlyCloudy: {
            label: arb['weather_partly_cloudy'] || (keys.push('weather_partly_cloudy'), 'Partly Cloudy'),
            description: arb['weather_partly_cloudy_desc'] || (keys.push('weather_partly_cloudy_desc'), '21-50% cloud coverage'),
            colorType: 'yellow',
            emoji: '⛅'
          },
          cloudy: {
            label: arb['weather_cloudy'] || (keys.push('weather_cloudy'), 'Cloudy'),
            description: arb['weather_cloudy_desc'] || (keys.push('weather_cloudy_desc'), '51-80% cloud coverage'),
            colorType: 'orange',
            emoji: '☁️'
          },
          overcast: {
            label: arb['weather_overcast'] || (keys.push('weather_overcast'), 'Overcast'),
            description: arb['weather_overcast_desc'] || (keys.push('weather_overcast_desc'), '81-100% cloud coverage'),
            colorType: 'danger',
            emoji: '☁️'
          }
        }
      },
      moon: {
        icon: '🌙',
        title: arb['moon_light_pollution'] || (keys.push('moon_light_pollution'), 'Moon Phase'),
        description: arb['info_moon_desc'] || (keys.push('info_moon_desc'), 'Moon brightness affects aurora visibility.'),
        statuses: {
          newMoon: {
            label: arb['moon_new'] || arb['new_moon'] || (keys.push('moon_new', 'new_moon'), 'New Moon'),
            description: arb['moon_new_desc'] || (keys.push('moon_new_desc'), '0-4% illumination'),
            colorType: 'success',
            emoji: '🌑'
          },
          crescent: {
            label: arb['moon_crescent'] || arb['crescent_moon'] || (keys.push('moon_crescent', 'crescent_moon'), 'Crescent'),
            description: arb['moon_crescent_desc'] || (keys.push('moon_crescent_desc'), '5-34% illumination'),
            colorType: 'success',
            emoji: '🌒'
          },
          quarter: {
            label: arb['moon_quarter'] || arb['quarter_moon'] || (keys.push('moon_quarter', 'quarter_moon'), 'Quarter'),
            description: arb['moon_quarter_desc'] || (keys.push('moon_quarter_desc'), '35-64% illumination'),
            colorType: 'yellow',
            emoji: '🌓'
          },
          gibbous: {
            label: arb['moon_gibbous'] || arb['gibbous_moon'] || (keys.push('moon_gibbous', 'gibbous_moon'), 'Gibbous'),
            description: arb['moon_gibbous_desc'] || (keys.push('moon_gibbous_desc'), '65-94% illumination'),
            colorType: 'orange',
            emoji: '🌔'
          },
          full: {
            label: arb['moon_full'] || arb['full_moon'] || (keys.push('moon_full', 'full_moon'), 'Full Moon'),
            description: arb['moon_full_desc'] || (keys.push('moon_full_desc'), '95-100% illumination'),
            colorType: 'danger',
            emoji: '🌕'
          }
        }
      },
      darkness: {
        icon: '🌌',
        title: arb['darkness_title'] || (keys.push('darkness_title'), 'Sky Darkness'),
        description: arb['info_darkness_desc'] || (keys.push('info_darkness_desc'), 'Darkness level affects aurora visibility.'),
        statuses: {
          night: {
            label: arb['darkness_night'] || (keys.push('darkness_night'), 'Night'),
            description: arb['darkness_night_desc'] || (keys.push('darkness_night_desc'), 'Dark skies - perfect for viewing'),
            colorType: 'success'
          },
          astronomical: {
            label: arb['darkness_astronomical'] || (keys.push('darkness_astronomical'), 'Astronomical Twilight'),
            description: arb['darkness_astronomical_desc'] || (keys.push('darkness_astronomical_desc'), 'Good for viewing'),
            colorType: 'yellow'
          },
          nautical: {
            label: arb['darkness_nautical'] || (keys.push('darkness_nautical'), 'Nautical Twilight'),
            description: arb['darkness_nautical_desc'] || (keys.push('darkness_nautical_desc'), 'Getting darker - weak auroras may appear'),
            colorType: 'orange'
          },
          daylight: {
            label: arb['darkness_daylight'] || (keys.push('darkness_daylight'), 'Daylight'),
            description: arb['darkness_daylight_desc'] || (keys.push('darkness_daylight_desc'), 'Too bright for aurora viewing'),
            colorType: 'danger'
          }
        }
      }
    };
  }

  // 3. Generate factor definitions for all languages
  const languages = ['en', 'ru', 'no', 'de', 'es', 'fr'];
  const factorDefinitionsDir = path.resolve(__dirname, '../src/data/factor-definitions');

  // Create directory if it doesn't exist
  if (!fs.existsSync(factorDefinitionsDir)) {
    fs.mkdirSync(factorDefinitionsDir, { recursive: true });
  }

  for (const lang of languages) {
    const langArbPath = path.join(appRoot, 'lib', 'l10n', `app_${lang}.arb`);
    if (!fs.existsSync(langArbPath)) {
      console.warn(`⚠️  ARB file not found for ${lang}: ${langArbPath}`);
      continue;
    }

    const langArb = JSON.parse(fs.readFileSync(langArbPath, 'utf8'));
    const langMissingKeys = [];
    const factorData = generateFactorData(langArb, langMissingKeys);

    const factorOutput = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/l10n/app_${lang}.arb
 * Generated at: ${new Date().toISOString()}
 * Language: ${lang}
 * Run 'npm run sync' to regenerate
 */

import { AuroraColors } from '../design-tokens.ts';

export type FactorColorType = 'success' | 'yellow' | 'orange' | 'danger';

export interface FactorStatusLevel {
  label: string;
  description?: string;
  colorType: FactorColorType;
  emoji?: string;
}

export interface FactorDefinition {
  icon: string;
  title: string;
  description: string;
  statuses: Record<string, FactorStatusLevel>;
}

export const factorDefinitions: Record<string, FactorDefinition> = ${JSON.stringify(factorData, null, 2)};

export function getStatusColor(colorType: FactorColorType): string {
  const colorMap = {
    success: AuroraColors.success || '#34C97B',
    yellow: AuroraColors.yellow || '#FFEB3B',
    orange: AuroraColors.orange || '#FF9800',
    danger: AuroraColors.danger || '#FF4747'
  };
  return colorMap[colorType] || colorMap.danger;
}`;

    const langFactorPath = path.resolve(factorDefinitionsDir, `${lang}.ts`);
    fs.writeFileSync(langFactorPath, factorOutput);
    console.log(`✅ Generated factor-definitions/${lang}.ts`);

    // Accumulate missing keys for English only (source of truth)
    if (lang === 'en' && langMissingKeys.length > 0) {
      missingKeys.push(...langMissingKeys);
    }
  }

  // 3b. Create barrel export with getFactorDefinitions() loader
  const barrelExport = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated at: ${new Date().toISOString()}
 * Run 'npm run sync' to regenerate
 */

import type { SupportedLanguage } from '../config/language-targeting.ts';

export type { FactorDefinition, FactorStatusLevel, FactorColorType } from './factor-definitions/en.ts';
export { getStatusColor } from './factor-definitions/en.ts';

// Import all language-specific factor definitions
import * as en from './factor-definitions/en.ts';
import * as ru from './factor-definitions/ru.ts';
import * as no from './factor-definitions/no.ts';
import * as de from './factor-definitions/de.ts';
import * as es from './factor-definitions/es.ts';
import * as fr from './factor-definitions/fr.ts';

const factorDefinitionsMap = {
  en: en.factorDefinitions,
  ru: ru.factorDefinitions,
  no: no.factorDefinitions,
  de: de.factorDefinitions,
  es: es.factorDefinitions,
  fr: fr.factorDefinitions
};

/**
 * Get factor definitions for a specific language
 * @param lang - Language code (en, ru, no, de, es, fr)
 * @returns Localized factor definitions
 */
export function getFactorDefinitions(lang: SupportedLanguage) {
  return factorDefinitionsMap[lang] || factorDefinitionsMap.en;
}

// Backward compatibility: export English as default
export const factorDefinitions = en.factorDefinitions;
`;

  const barrelPath = path.resolve(__dirname, '../src/data/factor-definitions.ts');
  fs.writeFileSync(barrelPath, barrelExport);
  console.log('✅ Generated factor-definitions.ts (barrel export)');

  // 4. Read Flutter design system
  const dartPath = path.join(appRoot, 'lib', 'constants', 'design_system.dart');
  if (!fs.existsSync(dartPath)) {
    console.warn('⚠️  Flutter design system not found, skipping design tokens sync');
  } else {
    const dart = fs.readFileSync(dartPath, 'utf8');

    // 5. Extract colors with improved regex
    const colors = {};
    const colorMatches = dart.matchAll(/static\s+const\s+Color\s+(\w+)\s*=\s*Color\(0x([A-F0-9]+)\)/gi);
    for (const match of colorMatches) {
      const colorName = match[1];
      const colorHex = match[2];
      // Remove alpha channel (first 2 chars) for CSS
      colors[colorName] = '#' + colorHex.slice(2).toUpperCase();
    }

    // 6. Extract typography (font sizes and weights)
    const typography = {};
    const typographyMatches = dart.matchAll(/static\s+const\s+TextStyle\s+(\w+)\s*=\s*TextStyle\([^)]*?fontSize:\s*([\d.]+)[^)]*?fontWeight:\s*FontWeight\.(\w+)/gi);
    for (const match of typographyMatches) {
      const styleName = match[1];
      const fontSize = match[2];
      const fontWeight = match[3];
      typography[styleName] = {
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight === 'w300' ? 300 : fontWeight === 'w400' ? 400 : fontWeight === 'w500' ? 500 : fontWeight === 'w600' ? 600 : 700
      };
    }

    // 7. Extract spacing values
    const spacing = {};
    const spacingMatches = dart.matchAll(/static\s+const\s+double\s+(\w+)\s*=\s*([\d.]+)/gi);
    for (const match of spacingMatches) {
      const spacingName = match[1];
      const spacingValue = match[2];
      spacing[spacingName] = `${spacingValue}px`;
    }

    // 8. Write design-tokens.ts
    const tokensOutput = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/constants/design_system.dart
 * Generated at: ${new Date().toISOString()}
 * Run 'npm run sync' to regenerate
 */

export const AuroraColors = ${JSON.stringify(colors, null, 2)};

export const AuroraTypography = ${JSON.stringify(typography, null, 2)};

export const AuroraSpacing = ${JSON.stringify(spacing, null, 2)};`;

    const tokensPath = path.resolve(__dirname, '../src/data/design-tokens.ts');
    fs.writeFileSync(tokensPath, tokensOutput);
    console.log('✅ Generated design-tokens.ts');
  }

  // 9. Extract thresholds from Flutter visibility mapper (single source of truth)
  try {
    const mapperPath = path.join(appRoot, 'lib', 'services', 'visibility_status_mapper.dart');
    if (!fs.existsSync(mapperPath)) {
      console.warn('⚠️  visibility_status_mapper.dart not found, skipping thresholds sync');
    } else {
      const mapper = fs.readFileSync(mapperPath, 'utf8');

      // Extract Kp thresholds in descending order from getKpStatus
      // Example: if (kp >= 6.0) ... else if (kp >= 3.0) ... else if (kp >= 1.0) ... else ...
      const kpBlockMatch = mapper.match(/getKpStatus\([\s\S]*?\)\s*\{([\s\S]*?)\n\s*\}/);
      let kpThresholds = { storm: 6.0, good: 3.0, low: 1.0, veryQuiet: 0 };
      if (kpBlockMatch) {
        const block = kpBlockMatch[1];
        const nums = Array.from(block.matchAll(/kp\s*>?=\s*([\d.]+)/g)).map(m => parseFloat(m[1])).sort((a, b) => b - a);
        if (nums.length >= 3 && nums.every(n => !Number.isNaN(n))) {
          kpThresholds = { storm: nums[0], good: nums[1], low: nums[2], veryQuiet: 0 };
        }
      }

      // Extract Moon thresholds from getMoonImpactStatus
      // Example: if (moonIlluminationPercent < 5) ... else if (< 35) ... <65 ... <95 ... else ...
      const moonBlockMatch = mapper.match(/getMoonImpactStatus\([\s\S]*?\)\s*\{([\s\S]*?)\n\s*\}/);
      let moonThresholds = { newMoon: 5, crescent: 35, quarter: 65, gibbous: 95 };
      if (moonBlockMatch) {
        const block = moonBlockMatch[1];
        const nums = Array.from(block.matchAll(/moonIlluminationPercent\s*<\s*([\d.]+)/g)).map(m => parseFloat(m[1])).sort((a, b) => a - b);
        if (nums.length >= 4 && nums.every(n => !Number.isNaN(n))) {
          moonThresholds = { newMoon: nums[0], crescent: nums[1], quarter: nums[2], gibbous: nums[3] };
        }
      }

      const thresholdsTs = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/services/visibility_status_mapper.dart
 * Generated at: ${new Date().toISOString()}
 * Run 'npm run sync' to regenerate
 */

export const StatusThresholds = {
  kp: ${JSON.stringify(kpThresholds, null, 2)},
  moon: ${JSON.stringify(moonThresholds, null, 2)}
} as const;
`;

      const thresholdsPath = path.resolve(__dirname, '../src/data/status-thresholds.ts');
      fs.writeFileSync(thresholdsPath, thresholdsTs);
      console.log('✅ Generated status-thresholds.ts');
    }
  } catch (e) {
    console.warn('⚠️  Failed to sync thresholds from app:', e.message);
  }

  // 10. Extract weather thresholds (cloud cover) from app factors grid
  try {
    const factorsGridPath = path.join(appRoot, 'lib', 'screens', 'components', 'aurora_factors_grid.dart');
    if (!fs.existsSync(factorsGridPath)) {
      console.warn('⚠️  aurora_factors_grid.dart not found, skipping weather thresholds sync');
    } else {
      const grid = fs.readFileSync(factorsGridPath, 'utf8');
      // pattern: if (cloudPercent <= 20) ... else if (<= 50) ... else if (<= 80) ... else
      const cmpMatches = Array.from(grid.matchAll(/cloudPercent\s*<=\s*(\d+)/g)).map(m => parseFloat(m[1]));
      let weatherThresholds = { clear: 20, partlyCloudy: 50, cloudy: 80 };
      if (cmpMatches.length >= 3 && cmpMatches.every(n => !Number.isNaN(n))) {
        // Ensure ascending order
        const sorted = [...new Set(cmpMatches)].sort((a, b) => a - b);
        if (sorted.length >= 3) {
          weatherThresholds = { clear: sorted[0], partlyCloudy: sorted[1], cloudy: sorted[2] };
        }
      }

      // Append/update status-thresholds.ts with weather
      const thresholdsPath = path.resolve(__dirname, '../src/data/status-thresholds.ts');
      let content = '';
      try { content = fs.readFileSync(thresholdsPath, 'utf8'); } catch { }
      if (content.includes('StatusThresholds')) {
        // naive replace: inject weather object
        const updated = content.replace(/export const StatusThresholds = \{([\s\S]*?)\}\s+as const;/, (m, inner) => {
          const hasWeather = /\bweather\s*:/.test(inner);
          const injection = `  weather: ${JSON.stringify(weatherThresholds, null, 2)}`;
          const withComma = inner.trim().endsWith(',') ? inner.trim() : inner.trim() + ',\n';
          const newInner = hasWeather ? inner.replace(/weather\s*:\s*\{[\s\S]*?\}/, injection) : withComma + injection + '\n';
          return `export const StatusThresholds = {\n${newInner}} as const;`;
        });
        fs.writeFileSync(thresholdsPath, updated);
      } else {
        const thresholdsTs = `/** AUTO-GENERATED FILE - DO NOT EDIT */\nexport const StatusThresholds = {\n  kp: { storm: 6, good: 3, low: 1, veryQuiet: 0 },\n  moon: { newMoon: 5, crescent: 35, quarter: 65, gibbous: 95 },\n  weather: ${JSON.stringify(weatherThresholds, null, 2)}\n} as const;\n`;
        fs.writeFileSync(thresholdsPath, thresholdsTs);
      }
      console.log('✅ Synced weather thresholds');
    }
  } catch (e) {
    console.warn('⚠️  Failed to sync weather thresholds:', e.message);
  }

  // Note: Web translations are now managed independently in src/data/web-strings/
  // This sync script only handles shared resources (factors, design tokens, thresholds)

  if (missingKeys.length > 0) {
    console.error('\n❌ CRITICAL ERROR: Missing required ARB keys from Flutter app:\n');
    console.error(missingKeys.map(k => `  - ${k}`).join('\n'));
    console.error('\n💡 Fix APP_ROOT/lib/l10n/app_en.arb before building web.\n');
    process.exit(1);
  }

  console.log('\n🎉 Sync completed successfully!');

} catch (error) {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
}
