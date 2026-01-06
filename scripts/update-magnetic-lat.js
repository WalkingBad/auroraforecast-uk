#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CITIES_FILE = path.join(__dirname, '../src/data/cities.json');
const VERIFIED_DB_FILE = path.join(__dirname, '../../app/assets/places/places_index_verified.json');

console.log('🔍 Loading cities and verified database...');

// Load current cities
const cities = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf8'));
console.log(`✅ Loaded ${cities.length} cities from web-seo`);

// Load verified database
const verifiedPlaces = JSON.parse(fs.readFileSync(VERIFIED_DB_FILE, 'utf8'));
console.log(`✅ Loaded ${verifiedPlaces.length} places from verified database`);

// Create a lookup map by name and coordinates (with tolerance)
const verifiedMap = new Map();

verifiedPlaces.forEach(place => {
  const name = place.name?.en || place.name;
  if (name && place.magneticLat !== undefined) {
    // Create multiple lookup keys
    const cleanName = name.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const key1 = `${cleanName}`;
    const key2 = `${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;

    verifiedMap.set(key1, place);
    verifiedMap.set(key2, place);
  }
});

console.log(`✅ Created lookup map with ${verifiedMap.size} entries`);

let updatedCount = 0;
let alreadyHadCount = 0;
let notFoundCount = 0;

// Function to find closest match by coordinates
function findByCoordinates(lat, lon, tolerance = 0.1) {
  for (const place of verifiedPlaces) {
    if (place.magneticLat !== undefined &&
        Math.abs(place.lat - lat) <= tolerance &&
        Math.abs(place.lon - lon) <= tolerance) {
      return place;
    }
  }
  return null;
}

// Update cities with missing magneticLat
cities.forEach((city, index) => {
  if (city.magneticLat !== undefined) {
    alreadyHadCount++;
    return;
  }

  // Try multiple matching strategies
  const cleanCityName = city.name.toLowerCase().replace(/[^\w\s]/g, '').trim();

  // Strategy 1: Exact name match
  let match = verifiedMap.get(cleanCityName);

  // Strategy 2: Coordinate match
  if (!match) {
    const coordKey = `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`;
    match = verifiedMap.get(coordKey);
  }

  // Strategy 3: Close coordinate match
  if (!match) {
    match = findByCoordinates(city.lat, city.lon, 0.1);
  }

  // Strategy 4: Wider coordinate search
  if (!match) {
    match = findByCoordinates(city.lat, city.lon, 0.5);
  }

  if (match && match.magneticLat !== undefined) {
    cities[index].magneticLat = match.magneticLat;
    console.log(`✅ Added magneticLat ${match.magneticLat} to ${city.name} (${city.country})`);
    updatedCount++;
  } else {
    console.log(`❌ No match found for ${city.name} (${city.country}) at ${city.lat},${city.lon}`);
    notFoundCount++;
  }
});

// Save updated cities
fs.writeFileSync(CITIES_FILE, JSON.stringify(cities, null, 2), 'utf8');

console.log('\n📊 Summary:');
console.log(`✅ Cities that already had magneticLat: ${alreadyHadCount}`);
console.log(`✅ Cities updated with magneticLat: ${updatedCount}`);
console.log(`❌ Cities still missing magneticLat: ${notFoundCount}`);
console.log(`📝 Total cities: ${cities.length}`);
console.log(`\n💾 Updated cities.json saved!`);

if (notFoundCount > 0) {
  console.log('\n🔍 Cities still missing magneticLat:');
  cities.forEach(city => {
    if (city.magneticLat === undefined) {
      console.log(`  - ${city.name} (${city.country}) at ${city.lat},${city.lon}`);
    }
  });
}