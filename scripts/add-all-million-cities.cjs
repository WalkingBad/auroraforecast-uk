#!/usr/bin/env node

// Добавляем ВСЕ города-миллионники из стран, которые есть в базе
const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '../src/data/cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

// Функция расчета магнитной широты
function calculateMagneticLat(lat, lon) {
  const magneticPoleOffset = 11.5;
  return lat + magneticPoleOffset * Math.cos((lon + 164) * Math.PI / 180);
}

// ВСЕ города 1M+ из стран в базе
const allMillionCities = [
  // USA (already added some, adding rest)
  { name: 'Austin', lat: 30.2672, lon: -97.7431, country: 'United States', countryCode: 'US', state: 'Texas', pop: 961000 },
  { name: 'Jacksonville', lat: 30.3322, lon: -81.6557, country: 'United States', countryCode: 'US', state: 'Florida', pop: 950000 },
  { name: 'Fort Worth', lat: 32.7555, lon: -97.3308, country: 'United States', countryCode: 'US', state: 'Texas', pop: 935000 },
  { name: 'Columbus', lat: 39.9612, lon: -82.9988, country: 'United States', countryCode: 'US', state: 'Ohio', pop: 905000 },
  { name: 'Indianapolis', lat: 39.7684, lon: -86.1581, country: 'United States', countryCode: 'US', state: 'Indiana', pop: 880000 },
  { name: 'Charlotte', lat: 35.2271, lon: -80.8431, country: 'United States', countryCode: 'US', state: 'North Carolina', pop: 875000 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'United States', countryCode: 'US', state: 'California', pop: 874000 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321, country: 'United States', countryCode: 'US', state: 'Washington', pop: 750000 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903, country: 'United States', countryCode: 'US', state: 'Colorado', pop: 715000 },
  { name: 'Boston', lat: 42.3601, lon: -71.0589, country: 'United States', countryCode: 'US', state: 'Massachusetts', pop: 675000 },
  { name: 'El Paso', lat: 31.7619, lon: -106.4850, country: 'United States', countryCode: 'US', state: 'Texas', pop: 680000 },
  { name: 'Detroit', lat: 42.3314, lon: -83.0458, country: 'United States', countryCode: 'US', state: 'Michigan', pop: 670000 },
  { name: 'Nashville', lat: 36.1627, lon: -86.7816, country: 'United States', countryCode: 'US', state: 'Tennessee', pop: 680000 },
  { name: 'Memphis', lat: 35.1495, lon: -90.0490, country: 'United States', countryCode: 'US', state: 'Tennessee', pop: 650000 },
  { name: 'Portland', lat: 45.5152, lon: -122.6784, country: 'United States', countryCode: 'US', state: 'Oregon', pop: 650000 },
  { name: 'Oklahoma City', lat: 35.4676, lon: -97.5164, country: 'United States', countryCode: 'US', state: 'Oklahoma', pop: 650000 },
  { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, country: 'United States', countryCode: 'US', state: 'Nevada', pop: 645000 },
  { name: 'Milwaukee', lat: 43.0389, lon: -87.9065, country: 'United States', countryCode: 'US', state: 'Wisconsin', pop: 590000 },
  { name: 'Albuquerque', lat: 35.0844, lon: -106.6504, country: 'United States', countryCode: 'US', state: 'New Mexico', pop: 560000 },
  { name: 'Tucson', lat: 32.2226, lon: -110.9747, country: 'United States', countryCode: 'US', state: 'Arizona', pop: 545000 },
  { name: 'Fresno', lat: 36.7378, lon: -119.7871, country: 'United States', countryCode: 'US', state: 'California', pop: 540000 },
  { name: 'Sacramento', lat: 38.5816, lon: -121.4944, country: 'United States', countryCode: 'US', state: 'California', pop: 525000 },
  { name: 'Mesa', lat: 33.4152, lon: -111.8315, country: 'United States', countryCode: 'US', state: 'Arizona', pop: 505000 },
  { name: 'Kansas City', lat: 39.0997, lon: -94.5786, country: 'United States', countryCode: 'US', state: 'Missouri', pop: 495000 },
  { name: 'Atlanta', lat: 33.7490, lon: -84.3880, country: 'United States', countryCode: 'US', state: 'Georgia', pop: 500000 },
  { name: 'Long Beach', lat: 33.7701, lon: -118.1937, country: 'United States', countryCode: 'US', state: 'California', pop: 465000 },
  { name: 'Colorado Springs', lat: 38.8339, lon: -104.8214, country: 'United States', countryCode: 'US', state: 'Colorado', pop: 480000 },
  { name: 'Raleigh', lat: 35.7796, lon: -78.6382, country: 'United States', countryCode: 'US', state: 'North Carolina', pop: 475000 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918, country: 'United States', countryCode: 'US', state: 'Florida', pop: 470000 },
  { name: 'Virginia Beach', lat: 36.8529, lon: -75.9780, country: 'United States', countryCode: 'US', state: 'Virginia', pop: 450000 },
  { name: 'Omaha', lat: 41.2565, lon: -95.9345, country: 'United States', countryCode: 'US', state: 'Nebraska', pop: 480000 },
  { name: 'Oakland', lat: 37.8044, lon: -122.2712, country: 'United States', countryCode: 'US', state: 'California', pop: 435000 },
  { name: 'Minneapolis', lat: 44.9778, lon: -93.2650, country: 'United States', countryCode: 'US', state: 'Minnesota', pop: 430000 },
  { name: 'Tulsa', lat: 36.1540, lon: -95.9928, country: 'United States', countryCode: 'US', state: 'Oklahoma', pop: 410000 },
  { name: 'Cleveland', lat: 41.4993, lon: -81.6944, country: 'United States', countryCode: 'US', state: 'Ohio', pop: 380000 },
  { name: 'Wichita', lat: 37.6872, lon: -97.3301, country: 'United States', countryCode: 'US', state: 'Kansas', pop: 395000 },
  { name: 'Arlington', lat: 32.7357, lon: -97.1081, country: 'United States', countryCode: 'US', state: 'Texas', pop: 395000 },

  // Canada (adding remaining)
  { name: 'Mississauga', lat: 43.5890, lon: -79.6441, country: 'Canada', countryCode: 'CA', state: 'Ontario', pop: 720000 },
  { name: 'Winnipeg', lat: 49.8951, lon: -97.1384, country: 'Canada', countryCode: 'CA', state: 'Manitoba', pop: 750000 },
  { name: 'Quebec City', lat: 46.8139, lon: -71.2080, country: 'Canada', countryCode: 'CA', state: 'Quebec', pop: 545000 },
  { name: 'Hamilton', lat: 43.2557, lon: -79.8711, country: 'Canada', countryCode: 'CA', state: 'Ontario', pop: 570000 },
  { name: 'Brampton', lat: 43.7315, lon: -79.7624, country: 'Canada', countryCode: 'CA', state: 'Ontario', pop: 655000 },

  // Japan
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan', countryCode: 'JP', pop: 14000000 },
  { name: 'Yokohama', lat: 35.4437, lon: 139.6380, country: 'Japan', countryCode: 'JP', pop: 3750000 },
  { name: 'Osaka', lat: 34.6937, lon: 135.5023, country: 'Japan', countryCode: 'JP', pop: 2750000 },
  { name: 'Nagoya', lat: 35.1815, lon: 136.9066, country: 'Japan', countryCode: 'JP', pop: 2320000 },
  { name: 'Sapporo', lat: 43.0642, lon: 141.3469, country: 'Japan', countryCode: 'JP', pop: 1970000 },
  { name: 'Fukuoka', lat: 33.5904, lon: 130.4017, country: 'Japan', countryCode: 'JP', pop: 1600000 },
  { name: 'Kobe', lat: 34.6901, lon: 135.1955, country: 'Japan', countryCode: 'JP', pop: 1540000 },
  { name: 'Kyoto', lat: 35.0116, lon: 135.7681, country: 'Japan', countryCode: 'JP', pop: 1475000 },
  { name: 'Kawasaki', lat: 35.5309, lon: 139.7028, country: 'Japan', countryCode: 'JP', pop: 1540000 },
  { name: 'Saitama', lat: 35.8617, lon: 139.6455, country: 'Japan', countryCode: 'JP', pop: 1300000 },

  // UK
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom', countryCode: 'GB', pop: 9000000 },
  { name: 'Birmingham', lat: 52.4862, lon: -1.8904, country: 'United Kingdom', countryCode: 'GB', pop: 1140000 },

  // Germany
  { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany', countryCode: 'DE', pop: 3650000 },
  { name: 'Hamburg', lat: 53.5511, lon: 9.9937, country: 'Germany', countryCode: 'DE', pop: 1850000 },
  { name: 'Munich', lat: 48.1351, lon: 11.5820, country: 'Germany', countryCode: 'DE', pop: 1485000 },

  // France
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France', countryCode: 'FR', pop: 2175000 },
  { name: 'Marseille', lat: 43.2965, lon: 5.3698, country: 'France', countryCode: 'FR', pop: 870000 },
  { name: 'Lyon', lat: 45.7640, lon: 4.8357, country: 'France', countryCode: 'FR', pop: 515000 },

  // Italy
  { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy', countryCode: 'IT', pop: 2870000 },
  { name: 'Milan', lat: 45.4642, lon: 9.1900, country: 'Italy', countryCode: 'IT', pop: 1350000 },
  { name: 'Naples', lat: 40.8518, lon: 14.2681, country: 'Italy', countryCode: 'IT', pop: 960000 },

  // Spain
  { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain', countryCode: 'ES', pop: 3220000 },
  { name: 'Barcelona', lat: 41.3851, lon: 2.1734, country: 'Spain', countryCode: 'ES', pop: 1620000 },

  // Poland
  { name: 'Warsaw', lat: 52.2297, lon: 21.0122, country: 'Poland', countryCode: 'PL', pop: 1790000 },

  // Ukraine
  { name: 'Kyiv', lat: 50.4501, lon: 30.5234, country: 'Ukraine', countryCode: 'UA', pop: 2960000 },
  { name: 'Kharkiv', lat: 49.9935, lon: 36.2304, country: 'Ukraine', countryCode: 'UA', pop: 1440000 },
  { name: 'Odesa', lat: 46.4825, lon: 30.7233, country: 'Ukraine', countryCode: 'UA', pop: 1015000 },

  // Romania
  { name: 'Bucharest', lat: 44.4268, lon: 26.1025, country: 'Romania', countryCode: 'RO', pop: 1830000 },

  // Czech Republic
  { name: 'Prague', lat: 50.0755, lon: 14.4378, country: 'Czech Republic', countryCode: 'CZ', pop: 1320000 },

  // Hungary
  { name: 'Budapest', lat: 47.4979, lon: 19.0402, country: 'Hungary', countryCode: 'HU', pop: 1750000 },

  // Belarus
  { name: 'Minsk', lat: 53.9045, lon: 27.5615, country: 'Belarus', countryCode: 'BY', pop: 2020000 },

  // Austria
  { name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'Austria', countryCode: 'AT', pop: 1900000 },

  // Bulgaria
  { name: 'Sofia', lat: 42.6977, lon: 23.3219, country: 'Bulgaria', countryCode: 'BG', pop: 1240000 },

  // Serbia
  { name: 'Belgrade', lat: 44.7866, lon: 20.4489, country: 'Serbia', countryCode: 'RS', pop: 1380000 },

  // Greece
  { name: 'Athens', lat: 37.9838, lon: 23.7275, country: 'Greece', countryCode: 'GR', pop: 3150000 },

  // Portugal
  { name: 'Lisbon', lat: 38.7223, lon: -9.1393, country: 'Portugal', countryCode: 'PT', pop: 545000 },

  // Netherlands
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, country: 'Netherlands', countryCode: 'NL', pop: 870000 },
  { name: 'Rotterdam', lat: 51.9225, lon: 4.4792, country: 'Netherlands', countryCode: 'NL', pop: 650000 },

  // Belgium
  { name: 'Brussels', lat: 50.8503, lon: 4.3517, country: 'Belgium', countryCode: 'BE', pop: 1200000 },

  // Switzerland
  { name: 'Zurich', lat: 47.3769, lon: 8.5417, country: 'Switzerland', countryCode: 'CH', pop: 420000 },

  // Sweden
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686, country: 'Sweden', countryCode: 'SE', pop: 975000 },

  // Denmark
  { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, country: 'Denmark', countryCode: 'DK', pop: 640000 },

  // Ireland
  { name: 'Dublin', lat: 53.3498, lon: -6.2603, country: 'Ireland', countryCode: 'IE', pop: 1200000 },

  // Australia
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia', countryCode: 'AU', pop: 5310000 },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'Australia', countryCode: 'AU', pop: 4970000 },
  { name: 'Brisbane', lat: -27.4698, lon: 153.0251, country: 'Australia', countryCode: 'AU', pop: 2560000 },
  { name: 'Perth', lat: -31.9505, lon: 115.8605, country: 'Australia', countryCode: 'AU', pop: 2140000 },
  { name: 'Adelaide', lat: -34.9285, lon: 138.6007, country: 'Australia', countryCode: 'AU', pop: 1370000 },

  // New Zealand
  { name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'New Zealand', countryCode: 'NZ', pop: 1660000 },

  // Argentina
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'Argentina', countryCode: 'AR', pop: 3080000 },
  { name: 'Cordoba', lat: -31.4201, lon: -64.1888, country: 'Argentina', countryCode: 'AR', pop: 1450000 },

  // Chile
  { name: 'Santiago', lat: -33.4489, lon: -70.6693, country: 'Chile', countryCode: 'CL', pop: 6680000 },

  // Uruguay
  { name: 'Montevideo', lat: -34.9011, lon: -56.1645, country: 'Uruguay', countryCode: 'UY', pop: 1320000 },

  // Brazil
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil', countryCode: 'BR', pop: 12300000 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'Brazil', countryCode: 'BR', pop: 6750000 },

  // South Africa
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'South Africa', countryCode: 'ZA', pop: 5780000 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, country: 'South Africa', countryCode: 'ZA', pop: 4620000 },
  { name: 'Durban', lat: -29.8587, lon: 31.0218, country: 'South Africa', countryCode: 'ZA', pop: 3960000 },
];

console.log(`\n=== Adding ALL Million+ Cities ===\n`);
console.log(`Current cities count: ${cities.length}`);

let addedCount = 0;
let skippedCount = 0;

allMillionCities.forEach(city => {
  const exists = cities.some(c =>
    c.name.toLowerCase() === city.name.toLowerCase() &&
    c.country === city.country
  );

  if (exists) {
    console.log(`⏭️  Skipped: ${city.name}, ${city.country}`);
    skippedCount++;
    return;
  }

  const magneticLat = calculateMagneticLat(city.lat, city.lon);
  const slug = city.name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  let timezone = 'UTC';
  if (city.country === 'United States') {
    if (city.lon > -90) timezone = 'America/New_York';
    else if (city.lon > -105) timezone = 'America/Chicago';
    else if (city.lon > -120) timezone = 'America/Denver';
    else timezone = 'America/Los_Angeles';
  } else if (city.country === 'Canada') {
    if (city.lon > -90) timezone = 'America/Toronto';
    else if (city.lon > -105) timezone = 'America/Winnipeg';
    else if (city.lon > -120) timezone = 'America/Edmonton';
    else timezone = 'America/Vancouver';
  } else if (city.country === 'Japan') {
    timezone = 'Asia/Tokyo';
  } else if (city.country === 'United Kingdom') {
    timezone = 'Europe/London';
  } else if (city.country === 'Germany') {
    timezone = 'Europe/Berlin';
  } else if (city.country === 'France') {
    timezone = 'Europe/Paris';
  } else if (city.country === 'Italy') {
    timezone = 'Europe/Rome';
  } else if (city.country === 'Spain') {
    timezone = 'Europe/Madrid';
  } else if (city.country === 'Russia') {
    if (city.lon < 40) timezone = 'Europe/Moscow';
    else if (city.lon < 70) timezone = 'Asia/Yekaterinburg';
    else if (city.lon < 100) timezone = 'Asia/Omsk';
    else timezone = 'Asia/Krasnoyarsk';
  } else if (city.country === 'Poland') {
    timezone = 'Europe/Warsaw';
  } else if (city.country === 'Ukraine') {
    timezone = 'Europe/Kyiv';
  } else if (city.country === 'Australia') {
    if (city.lon < 138) timezone = 'Australia/Adelaide';
    else if (city.lon < 145) timezone = 'Australia/Melbourne';
    else if (city.lon < 154) timezone = 'Australia/Sydney';
    else timezone = 'Australia/Brisbane';
  } else if (city.country === 'Brazil') {
    timezone = 'America/Sao_Paulo';
  } else if (city.country === 'Argentina' || city.country === 'Chile' || city.country === 'Uruguay') {
    timezone = 'America/Argentina/Buenos_Aires';
  } else if (city.country === 'South Africa') {
    timezone = 'Africa/Johannesburg';
  }

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
    description: `Major city with ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : Math.round(city.pop / 1000) + 'K'} population`,
    description_no: `Storby med ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : Math.round(city.pop / 1000) + 'K'} innbyggere`,
    description_de: `Großstadt mit ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : Math.round(city.pop / 1000) + 'K'} Einwohnern`,
    description_es: `Gran ciudad con ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : Math.round(city.pop / 1000) + 'K'} habitantes`,
    description_fr: `Grande ville avec ${city.pop >= 1000000 ? Math.round(city.pop / 1000000) + 'M+' : Math.round(city.pop / 1000) + 'K'} habitants`
  };

  cities.push(newCity);
  console.log(`✅ ${city.name}, ${city.country} (MagLat: ${newCity.magneticLat}°, Pop: ${Math.round(city.pop / 1000000)}M)`);
  addedCount++;
});

cities.sort((a, b) => b.magneticLat - a.magneticLat);
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');

console.log(`\n=== Summary ===`);
console.log(`✅ Added: ${addedCount} cities`);
console.log(`⏭️  Skipped: ${skippedCount} cities`);
console.log(`📊 Total cities: ${cities.length}`);
console.log(`\n✅ cities.json updated!`);
