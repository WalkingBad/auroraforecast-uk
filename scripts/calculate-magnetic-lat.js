#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CITIES_FILE = path.join(__dirname, '../src/data/cities.json');

console.log('🧮 Calculating magnetic latitudes using dipole approximation...');

/**
 * Calculate magnetic latitude using dipole approximation (IGRF-13)
 * Same formula as in functions/src/services/magnetic-latitude.utils.ts
 */
function calculateMagneticLatitudeDipole(geoLat, geoLon) {
  // Geomagnetic pole coordinates (IGRF-13 epoch 2020.0)
  const magPoleLatRad = (80.65 * Math.PI) / 180;
  const magPoleLonRad = (-72.68 * Math.PI) / 180;
  const geoLatRad = (geoLat * Math.PI) / 180;
  const geoLonRad = (geoLon * Math.PI) / 180;

  // Standard spherical trigonometry formula for magnetic colatitude
  const cosMagneticColatitude = Math.sin(geoLatRad) * Math.sin(magPoleLatRad)
    + Math.cos(geoLatRad) * Math.cos(magPoleLonRad) * Math.cos(geoLonRad - magPoleLonRad);

  // Clamp to valid range to avoid NaN from acos
  const clampedCos = Math.max(-1, Math.min(1, cosMagneticColatitude));

  // Calculate magnetic colatitude (angle from magnetic pole)
  const magneticColatitude = Math.acos(clampedCos);

  // Convert colatitude to latitude: lat = 90° - colatitude
  const magneticLatitude = (Math.PI / 2) - magneticColatitude;

  // Return absolute value in degrees
  return Math.abs(magneticLatitude * 180 / Math.PI);
}

/**
 * Apply regional corrections to dipole magnetic latitude
 * Same logic as in functions/src/services/magnetic-latitude.utils.ts
 */
function applyRegionalDipoleCorrection(geoLat, geoLon, mlatDipole) {
  // Narrow corridor for North Iberia (e.g., Asturias/Basque) to better match AACGM (~-10° vs dipole)
  if (geoLon >= -12 && geoLon <= -4 && geoLat >= 40 && geoLat <= 46) {
    const strongBias = -10;
    return Math.max(0, mlatDipole + strongBias);
  }

  // Iberia/NE Atlantic band: lon [-20..10], lat [25..60]
  if (geoLon >= -20 && geoLon <= 10 && geoLat >= 25 && geoLat <= 60) {
    const biasAt = (lon) => {
      if (lon <= -10) {
        const t = (lon - (-20)) / 10;
        return -8 - t * 1;
      } else {
        const t = (lon - (-10)) / 20;
        return -9 + t * 5;
      }
    };
    const rawBias = biasAt(geoLon);
    const scale = Math.max(0.5, Math.min(1.0, mlatDipole / 60));
    const bias = rawBias * scale;
    return Math.max(0, mlatDipole + bias);
  }

  return mlatDipole;
}

// Load cities
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf8'));
console.log(`✅ Loaded ${cities.length} cities`);

let calculatedCount = 0;

// Calculate magnetic latitudes for missing cities
cities.forEach((city, index) => {
  if (city.magneticLat !== undefined) {
    return; // Already has magneticLat
  }

  // Normalize longitude to [-180, 180]
  let lonNorm = city.lon;
  while (lonNorm < -180) lonNorm += 360;
  while (lonNorm > 180) lonNorm -= 360;

  // Calculate dipole magnetic latitude
  const dip = calculateMagneticLatitudeDipole(city.lat, lonNorm);
  const corrected = applyRegionalDipoleCorrection(city.lat, lonNorm, dip);

  // Round to 1 decimal place for consistency
  cities[index].magneticLat = Math.round(corrected * 10) / 10;

  console.log(`✅ Calculated magneticLat ${cities[index].magneticLat} for ${city.name} (${city.country})`);
  calculatedCount++;
});

// Save updated cities
fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf8');

console.log(`\n📊 Summary:`);
console.log(`✅ Cities with calculated magneticLat: ${calculatedCount}`);
console.log(`📝 All ${cities.length} cities now have magneticLat values!`);
console.log(`💾 Updated cities.json saved!`);

// Verify no cities are missing magneticLat
const missingCount = cities.filter(city => city.magneticLat === undefined).length;
if (missingCount === 0) {
  console.log(`\n🎉 SUCCESS: All cities now have magneticLat values!`);
} else {
  console.log(`\n⚠️  Still missing ${missingCount} cities`);
}