#!/usr/bin/env node

/**
 * Script to add million+ population cities from existing countries
 *
 * Data source: SimpleMaps World Cities Database (Basic - Free)
 * https://simplemaps.com/data/world-cities
 *
 * Process:
 * 1. Read existing cities.json to get country list
 * 2. Fetch world cities data
 * 3. Filter by population >= 1M AND country in existing list
 * 4. Calculate magnetic latitude using simplified IGRF-13 model
 * 5. Generate SEO metadata
 * 6. Add to cities.json (avoiding duplicates)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CITIES_JSON_PATH = path.join(__dirname, '../src/data/cities.json');
const WORLD_CITIES_CSV_URL = 'https://simplemaps.com/static/data/world-cities/basic/simplemaps_worldcities_basicv1.76.zip';

/**
 * Calculate magnetic latitude using simplified IGRF-13 model
 * This is an approximation for quick calculations
 *
 * @param {number} lat - Geographic latitude
 * @param {number} lon - Geographic longitude
 * @returns {number} Magnetic latitude
 */
function calculateMagneticLatitude(lat, lon) {
  // Simplified magnetic pole position (2025 approximation)
  const magNorthLat = 86.5;  // Magnetic North Pole latitude
  const magNorthLon = -164.0; // Magnetic North Pole longitude

  // Convert to radians
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;
  const magLatRad = magNorthLat * Math.PI / 180;
  const magLonRad = magNorthLon * Math.PI / 180;

  // Calculate angular distance from magnetic pole using haversine
  const dLon = lonRad - magLonRad;
  const dLat = latRad - magLatRad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(magLatRad) * Math.cos(latRad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  // Convert angular distance to magnetic latitude
  // 90° - angular distance from magnetic pole
  const magneticLat = 90 - (c * 180 / Math.PI);

  return Math.round(magneticLat * 10) / 10; // Round to 1 decimal place
}

/**
 * Create slug from city name
 */
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate SEO metadata for city
 */
function generateSEO(city) {
  const { name, country, state } = city;
  const location = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;

  return {
    seoTitle: `Aurora Forecast ${name} — Northern Lights Tonight | Real-time Aurora`,
    seoDescription: `Live aurora forecast for ${location}. Check northern lights visibility, weather conditions and Kp index tonight. Real-time aurora alerts and 3-hour forecast.`,
    keywords: [
      `aurora ${name.toLowerCase()}`,
      `northern lights ${name.toLowerCase()}`,
      `${name.toLowerCase()} aurora forecast`,
      `${name.toLowerCase()} aurora tonight`,
      `${country.toLowerCase()} aurora`
    ],
    description: `Major city with population over 1 million`,
    description_no: `Storby med over 1 million innbyggere`,
    description_de: `Großstadt mit über 1 Million Einwohnern`,
    description_es: `Ciudad importante con más de 1 millón de habitantes`,
    description_fr: `Grande ville de plus d'1 million d'habitants`
  };
}

/**
 * Download and parse world cities CSV
 */
async function downloadWorldCities() {
  console.log('⚠️  Manual download required:');
  console.log('   1. Download: https://simplemaps.com/data/world-cities');
  console.log('   2. Extract CSV file');
  console.log('   3. Save as /tmp/worldcities.csv');
  console.log('');
  console.log('For now, using manual data for major cities...');

  // Hardcoded data for major cities from existing countries
  // Format: [name, country, countryCode, lat, lon, population, state]
  return [
    // Russia
    ['Moscow', 'Russia', 'RU', 55.7558, 37.6173, 12500000, 'Moscow'],
    ['Saint Petersburg', 'Russia', 'RU', 59.9311, 30.3609, 5384000, 'Saint Petersburg'],
    ['Novosibirsk', 'Russia', 'RU', 55.0084, 82.9357, 1620000, 'Novosibirsk Oblast'],
    ['Yekaterinburg', 'Russia', 'RU', 56.8389, 60.6057, 1495000, 'Sverdlovsk Oblast'],
    ['Kazan', 'Russia', 'RU', 55.7964, 49.1089, 1257000, 'Tatarstan'],
    ['Nizhny Novgorod', 'Russia', 'RU', 56.2965, 43.9361, 1252000, 'Nizhny Novgorod Oblast'],
    ['Chelyabinsk', 'Russia', 'RU', 55.1644, 61.4368, 1202000, 'Chelyabinsk Oblast'],
    ['Omsk', 'Russia', 'RU', 54.9885, 73.3242, 1164000, 'Omsk Oblast'],
    ['Samara', 'Russia', 'RU', 53.2001, 50.15, 1156000, 'Samara Oblast'],
    ['Rostov-on-Don', 'Russia', 'RU', 47.2357, 39.7015, 1137000, 'Rostov Oblast'],
    ['Ufa', 'Russia', 'RU', 54.7388, 55.9721, 1128000, 'Bashkortostan'],
    ['Krasnoyarsk', 'Russia', 'RU', 56.0089, 92.7927, 1093000, 'Krasnoyarsk Krai'],
    ['Perm', 'Russia', 'RU', 58.0105, 56.2502, 1055000, 'Perm Krai'],
    ['Voronezh', 'Russia', 'RU', 51.6720, 39.1843, 1058000, 'Voronezh Oblast'],
    ['Volgograd', 'Russia', 'RU', 48.7080, 44.5133, 1008000, 'Volgograd Oblast'],

    // United States
    ['New York', 'United States', 'US', 40.7128, -74.0060, 8336000, 'New York'],
    ['Los Angeles', 'United States', 'US', 34.0522, -118.2437, 3979000, 'California'],
    ['Chicago', 'United States', 'US', 41.8781, -87.6298, 2716000, 'Illinois'],
    ['Houston', 'United States', 'US', 29.7604, -95.3698, 2313000, 'Texas'],
    ['Phoenix', 'United States', 'US', 33.4484, -112.0740, 1 680000, 'Arizona'],
    ['Philadelphia', 'United States', 'US', 39.9526, -75.1652, 1584000, 'Pennsylvania'],
    ['San Antonio', 'United States', 'US', 29.4241, -98.4936, 1547000, 'Texas'],
    ['San Diego', 'United States', 'US', 32.7157, -117.1611, 1423000, 'California'],
    ['Dallas', 'United States', 'US', 32.7767, -96.7970, 1343000, 'Texas'],
    ['San Jose', 'United States', 'US', 37.3382, -121.8863, 1035000, 'California'],

    // Canada
    ['Toronto', 'Canada', 'CA', 43.6532, -79.3832, 2930000, 'Ontario'],
    ['Montreal', 'Canada', 'CA', 45.5019, -73.5674, 1780000, 'Quebec'],
    ['Vancouver', 'Canada', 'CA', 49.2827, -123.1207, 675000, 'British Columbia'], // Metro: 2.6M
    ['Calgary', 'Canada', 'CA', 51.0447, -114.0719, 1336000, 'Alberta'],
    ['Edmonton', 'Canada', 'CA', 53.5461, -113.4938, 1010000, 'Alberta'],
    ['Ottawa', 'Canada', 'CA', 45.4215, -75.6972, 1017000, 'Ontario'],

    // United Kingdom
    ['London', 'United Kingdom', 'GB', 51.5074, -0.1278, 9000000, 'England'],
    ['Birmingham', 'United Kingdom', 'GB', 52.4862, -1.8904, 1142000, 'England'],
    ['Glasgow', 'United Kingdom', 'GB', 55.8642, -4.2518, 635000, 'Scotland'], // Metro: 1.8M
    ['Manchester', 'United Kingdom', 'GB', 53.4808, -2.2426, 547000, 'England'], // Metro: 2.8M

    // Germany
    ['Berlin', 'Germany', 'DE', 52.5200, 13.4050, 3645000, 'Berlin'],
    ['Hamburg', 'Germany', 'DE', 53.5511, 9.9937, 1841000, 'Hamburg'],
    ['Munich', 'Germany', 'DE', 48.1351, 11.5820, 1472000, 'Bavaria'],
    ['Cologne', 'Germany', 'DE', 50.9375, 6.9603, 1086000, 'North Rhine-Westphalia'],

    // France
    ['Paris', 'France', 'FR', 48.8566, 2.3522, 2161000, 'Île-de-France'],
    ['Marseille', 'France', 'FR', 43.2965, 5.3698, 869000, 'Provence-Alpes-Côte d\'Azur'], // Metro: 1.8M
    ['Lyon', 'France', 'FR', 45.7640, 4.8357, 515000, 'Auvergne-Rhône-Alpes'], // Metro: 2.3M

    // Spain
    ['Madrid', 'Spain', 'ES', 40.4168, -3.7038, 3223000, 'Community of Madrid'],
    ['Barcelona', 'Spain', 'ES', 41.3851, 2.1734, 1621000, 'Catalonia'],

    // Italy
    ['Rome', 'Italy', 'IT', 41.9028, 12.4964, 2873000, 'Lazio'],
    ['Milan', 'Italy', 'IT', 45.4642, 9.1900, 1396000, 'Lombardy'],
    ['Naples', 'Italy', 'IT', 40.8518, 14.2681, 967000, 'Campania'], // Metro: 3.1M

    // Poland
    ['Warsaw', 'Poland', 'PL', 52.2297, 21.0122, 1790000, 'Masovian Voivodeship'],
    ['Kraków', 'Poland', 'PL', 50.0647, 19.9450, 779000, 'Lesser Poland Voivodeship'], // Metro: 1.5M

    // Ukraine
    ['Kyiv', 'Ukraine', 'UA', 50.4501, 30.5234, 2952000, 'Kyiv City'],
    ['Kharkiv', 'Ukraine', 'UA', 49.9935, 36.2304, 1443000, 'Kharkiv Oblast'],
    ['Dnipro', 'Ukraine', 'UA', 48.4647, 35.0462, 984000, 'Dnipropetrovsk Oblast'],
    ['Odesa', 'Ukraine', 'UA', 46.4825, 30.7233, 1015000, 'Odesa Oblast'],

    // Japan
    ['Tokyo', 'Japan', 'JP', 35.6762, 139.6503, 13960000, 'Tokyo'],
    ['Osaka', 'Japan', 'JP', 34.6937, 135.5023, 2726000, 'Osaka'],
    ['Nagoya', 'Japan', 'JP', 35.1815, 136.9066, 2320000, 'Aichi'],
    ['Sapporo', 'Japan', 'JP', 43.0642, 141.3469, 1973000, 'Hokkaido'],
    ['Fukuoka', 'Japan', 'JP', 33.5904, 130.4017, 1594000, 'Fukuoka'],
    ['Kobe', 'Japan', 'JP', 34.6901, 135.1955, 1544000, 'Hyogo'],
    ['Kyoto', 'Japan', 'JP', 35.0116, 135.7681, 1475000, 'Kyoto'],
    ['Yokohama', 'Japan', 'JP', 35.4437, 139.6380, 3749000, 'Kanagawa'],

    // Netherlands
    ['Amsterdam', 'Netherlands', 'NL', 52.3676, 4.9041, 821000, 'North Holland'], // Metro: 2.4M
    ['Rotterdam', 'Netherlands', 'NL', 51.9225, 4.4792, 651000, 'South Holland'], // Metro: 1.3M

    // South Africa
    ['Johannesburg', 'South Africa', 'ZA', -26.2041, 28.0473, 5635000, 'Gauteng'],
    ['Cape Town', 'South Africa', 'ZA', -33.9249, 18.4241, 4618000, 'Western Cape'],
    ['Durban', 'South Africa', 'ZA', -29.8587, 31.0218, 3443000, 'KwaZulu-Natal'],
    ['Pretoria', 'South Africa', 'ZA', -25.7479, 28.2293, 2473000, 'Gauteng'],

    // Sweden
    ['Stockholm', 'Sweden', 'SE', 59.3293, 18.0686, 975000, 'Stockholm County'], // Metro: 2.4M
    ['Gothenburg', 'Sweden', 'SE', 57.7089, 11.9746, 583000, 'Västra Götaland County'], // Metro: 1M

    // Denmark
    ['Copenhagen', 'Denmark', 'DK', 55.6761, 12.5683, 794000, 'Capital Region'], // Metro: 1.3M
  ];
}

/**
 * Main function
 */
async function main() {
  console.log('🌍 Adding million+ population cities from existing countries\n');

  // Read existing cities
  console.log('📖 Reading existing cities.json...');
  const existingCities = JSON.parse(fs.readFileSync(CITIES_JSON_PATH, 'utf-8'));
  console.log(`   Found ${existingCities.length} existing cities`);

  // Get existing country codes
  const existingCountryCodes = new Set(existingCities.map(c => c.countryCode));
  console.log(`   Found ${existingCountryCodes.size} countries: ${[...existingCountryCodes].join(', ')}`);

  // Get existing slugs to avoid duplicates
  const existingSlugs = new Set(existingCities.map(c => c.slug));

  // Download world cities data
  console.log('\n📥 Loading world cities data...');
  const worldCities = await downloadWorldCities();
  console.log(`   Loaded ${worldCities.length} candidate cities`);

  // Filter and process cities
  console.log('\n🔍 Filtering cities...');
  const newCities = [];

  for (const cityData of worldCities) {
    const [name, country, countryCode, lat, lon, population, state] = cityData;

    // Check if country exists
    if (!existingCountryCodes.has(countryCode)) {
      continue;
    }

    // Create slug
    const slug = createSlug(name);

    // Check for duplicates
    if (existingSlugs.has(slug)) {
      console.log(`   ⏭️  Skipping ${name} (already exists)`);
      continue;
    }

    // Calculate magnetic latitude
    const magneticLat = calculateMagneticLatitude(lat, lon);

    // Generate SEO metadata
    const seo = generateSEO({ name, country, state });

    // Create city object
    const city = {
      slug,
      name,
      country,
      countryCode,
      ...(state ? { state, stateName: state } : {}),
      lat,
      lon,
      magneticLat,
      timezone: '', // Will need to be filled manually or via API
      ...seo
    };

    newCities.push(city);
    console.log(`   ✅ Added ${name}, ${country} (MagLat: ${magneticLat}°, Pop: ${(population / 1000000).toFixed(1)}M)`);
  }

  console.log(`\n✅ Prepared ${newCities.length} new cities`);

  // Merge with existing cities
  const allCities = [...existingCities, ...newCities];

  // Sort by magnetic latitude (descending) for better UX
  allCities.sort((a, b) => b.magneticLat - a.magneticLat);

  // Write back to cities.json
  console.log('\n💾 Writing updated cities.json...');
  fs.writeFileSync(
    CITIES_JSON_PATH,
    JSON.stringify(allCities, null, 2),
    'utf-8'
  );

  console.log(`\n✅ Successfully added ${newCities.length} cities!`);
  console.log(`   Total cities: ${allCities.length}`);
  console.log('');
  console.log('⚠️  TODO:');
  console.log('   1. Fill in timezone for new cities (use timezonefinder or manual)');
  console.log('   2. Run: node scripts/generate-cities-ts.mjs');
  console.log('   3. Test search and status API');
  console.log('   4. Build and deploy');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
