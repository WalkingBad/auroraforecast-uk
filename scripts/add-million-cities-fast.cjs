#!/usr/bin/env node

// Добавляем города-миллионники напрямую в cities.json
const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '../src/data/cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

// Функция расчета магнитной широты (упрощенная для быстроты)
function calculateMagneticLat(lat, lon) {
  // Magnetic North Pole приблизительно на 86.5°N 164.04°W
  // Упрощенная формула: смещаем географическую широту
  const magneticPoleOffset = 11.5; // градусов
  return lat + magneticPoleOffset * Math.cos((lon + 164) * Math.PI / 180);
}

// Города-миллионники для добавления
const newCities = [
  // Russia
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'Russia', countryCode: 'RU', pop: 12500000 },
  { name: 'Saint Petersburg', lat: 59.9343, lon: 30.3351, country: 'Russia', countryCode: 'RU', pop: 5400000 },
  { name: 'Novosibirsk', lat: 55.0084, lon: 82.9357, country: 'Russia', countryCode: 'RU', pop: 1620000 },
  { name: 'Yekaterinburg', lat: 56.8389, lon: 60.6057, country: 'Russia', countryCode: 'RU', pop: 1490000 },
  { name: 'Kazan', lat: 55.8304, lon: 49.0661, country: 'Russia', countryCode: 'RU', pop: 1250000 },
  { name: 'Nizhny Novgorod', lat: 56.2965, lon: 43.9361, country: 'Russia', countryCode: 'RU', pop: 1250000 },
  { name: 'Chelyabinsk', lat: 55.1644, lon: 61.4368, country: 'Russia', countryCode: 'RU', pop: 1200000 },
  { name: 'Samara', lat: 53.2001, lon: 50.1500, country: 'Russia', countryCode: 'RU', pop: 1160000 },
  { name: 'Omsk', lat: 54.9885, lon: 73.3242, country: 'Russia', countryCode: 'RU', pop: 1150000 },
  { name: 'Rostov-on-Don', lat: 47.2357, lon: 39.7015, country: 'Russia', countryCode: 'RU', pop: 1130000 },
  { name: 'Ufa', lat: 54.7388, lon: 55.9721, country: 'Russia', countryCode: 'RU', pop: 1120000 },
  { name: 'Krasnoyarsk', lat: 56.0153, lon: 92.8932, country: 'Russia', countryCode: 'RU', pop: 1090000 },
  { name: 'Perm', lat: 58.0105, lon: 56.2502, country: 'Russia', countryCode: 'RU', pop: 1050000 },
  { name: 'Voronezh', lat: 51.6720, lon: 39.1843, country: 'Russia', countryCode: 'RU', pop: 1050000 },
  { name: 'Volgograd', lat: 48.7080, lon: 44.5133, country: 'Russia', countryCode: 'RU', pop: 1010000 },

  // USA
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'United States', countryCode: 'US', state: 'New York', pop: 8800000 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'United States', countryCode: 'US', state: 'California', pop: 3970000 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'United States', countryCode: 'US', state: 'Illinois', pop: 2700000 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'United States', countryCode: 'US', state: 'Texas', pop: 2300000 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740, country: 'United States', countryCode: 'US', state: 'Arizona', pop: 1700000 },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, country: 'United States', countryCode: 'US', state: 'Pennsylvania', pop: 1580000 },
  { name: 'San Antonio', lat: 29.4241, lon: -98.4936, country: 'United States', countryCode: 'US', state: 'Texas', pop: 1530000 },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611, country: 'United States', countryCode: 'US', state: 'California', pop: 1420000 },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970, country: 'United States', countryCode: 'US', state: 'Texas', pop: 1330000 },
  { name: 'San Jose', lat: 37.3382, lon: -121.8863, country: 'United States', countryCode: 'US', state: 'California', pop: 1020000 },

  // Canada
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada', countryCode: 'CA', state: 'Ontario', pop: 2930000 },
  { name: 'Montreal', lat: 45.5017, lon: -73.5673, country: 'Canada', countryCode: 'CA', state: 'Quebec', pop: 1780000 },
  { name: 'Calgary', lat: 51.0447, lon: -114.0719, country: 'Canada', countryCode: 'CA', state: 'Alberta', pop: 1340000 },
  { name: 'Ottawa', lat: 45.4215, lon: -75.6972, country: 'Canada', countryCode: 'CA', state: 'Ontario', pop: 1010000 },
  { name: 'Edmonton', lat: 53.5461, lon: -113.4938, country: 'Canada', countryCode: 'CA', state: 'Alberta', pop: 1010000 },
];

console.log(`\n=== Adding Million+ Cities to cities.json ===\n`);
console.log(`Current cities count: ${cities.length}`);

let addedCount = 0;
let skippedCount = 0;

newCities.forEach(city => {
  // Check if city already exists
  const exists = cities.some(c =>
    c.name.toLowerCase() === city.name.toLowerCase() &&
    c.country === city.country
  );

  if (exists) {
    console.log(`⏭️  Skipped: ${city.name}, ${city.country} (already exists)`);
    skippedCount++;
    return;
  }

  // Calculate magnetic latitude
  const magneticLat = calculateMagneticLat(city.lat, city.lon);

  // Generate slug
  const slug = city.name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Create timezone (approximate)
  let timezone = 'UTC';
  if (city.country === 'Russia') {
    if (city.lon < 40) timezone = 'Europe/Moscow';
    else if (city.lon < 70) timezone = 'Asia/Yekaterinburg';
    else if (city.lon < 100) timezone = 'Asia/Omsk';
    else timezone = 'Asia/Krasnoyarsk';
  } else if (city.country === 'United States') {
    if (city.lon > -90) timezone = 'America/New_York';
    else if (city.lon > -105) timezone = 'America/Chicago';
    else if (city.lon > -120) timezone = 'America/Denver';
    else timezone = 'America/Los_Angeles';
  } else if (city.country === 'Canada') {
    if (city.lon > -90) timezone = 'America/Toronto';
    else if (city.lon > -105) timezone = 'America/Winnipeg';
    else if (city.lon > -120) timezone = 'America/Edmonton';
    else timezone = 'America/Vancouver';
  }

  // Create city object
  const newCity = {
    slug,
    name: city.name,
    ...(city.state && { state: city.state }),
    country: city.country,
    countryCode: city.countryCode,
    lat: city.lat,
    lon: city.lon,
    magneticLat: Math.round(magneticLat * 10) / 10,
    timezone,
    seoTitle: `Aurora Forecast ${city.name} — Northern Lights Tonight | Real-time Aurora`,
    seoDescription: `Live aurora forecast for ${city.name}${city.state ? ', ' + city.state : ''}. Check northern lights visibility, weather conditions and Kp index tonight. Real-time aurora alerts and 3-hour forecast.`,
    keywords: [
      `aurora ${city.name.toLowerCase()}`,
      `northern lights ${city.name.toLowerCase()}`,
      `${city.name.toLowerCase()} aurora forecast`,
      `${city.name.toLowerCase()} aurora tonight`,
      ...(city.state ? [`${city.state.toLowerCase()} northern lights`] : [])
    ],
    description: `Major city with ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : city.pop} population`,
    description_no: `Storby med ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : city.pop} innbyggere`,
    description_de: `Großstadt mit ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : city.pop} Einwohnern`,
    description_es: `Gran ciudad con ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : city.pop} habitantes`,
    description_fr: `Grande ville avec ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : city.pop} habitants`
  };

  cities.push(newCity);
  console.log(`✅ Added: ${city.name}, ${city.country} (MagLat: ${newCity.magneticLat}°, Pop: ${Math.round(city.pop / 1000000)}M)`);
  addedCount++;
});

// Sort cities by magnetic latitude (descending)
cities.sort((a, b) => b.magneticLat - a.magneticLat);

// Write back to file
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');

console.log(`\n=== Summary ===`);
console.log(`✅ Added: ${addedCount} cities`);
console.log(`⏭️  Skipped: ${skippedCount} cities (already exist)`);
console.log(`📊 Total cities: ${cities.length}`);
console.log(`\n✅ cities.json updated successfully!`);
