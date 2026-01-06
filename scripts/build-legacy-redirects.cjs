#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'src', 'data');
const redirectsPath = path.join(projectRoot, 'public', '_redirects');
const firebaseConfigPath = path.resolve(__dirname, '../../firebase.json');

const START_MARKER = '# >>> Legacy Slugs (auto-generated) >>>';
const END_MARKER = '# <<< Legacy Slugs (auto-generated) <<<';
const FALLBACK_PATH = '/guides/best-time-northern-lights';

const loadJson = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required JSON file is missing: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeCountryKey = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const nameCountryKey = (name, country) =>
  `${normalize(name)}|${normalizeCountryKey(country)}`;

const formatLine = (from, to, comment) => {
  const commentSegment = comment ? `  # ${comment}` : '';
  return `${from} ${to} 301${commentSegment}`;
};

const now = new Date().toISOString();

const siteCountryCodes = new Set(
  (process.env.SITE_COUNTRY_CODES || 'GB')
    .split(',')
    .map(code => code.trim().toUpperCase())
    .filter(Boolean)
);

const currentCitiesPath = path.join(dataDir, 'cities.json');
const currentCities = loadJson(currentCitiesPath)
  .filter(city => siteCountryCodes.has(city.countryCode));

const legacyCitiesPath = path.join(dataDir, 'cities-backup-old.json');
const legacyCities = fs.existsSync(legacyCitiesPath)
  ? loadJson(legacyCitiesPath).filter(city => siteCountryCodes.has(city.countryCode))
  : [];
const existingRedirectsContent = fs.readFileSync(redirectsPath, 'utf8');

const firstStartIndex = existingRedirectsContent.indexOf(START_MARKER);
const lastEndIndex = existingRedirectsContent.lastIndexOf(END_MARKER);

let manualContent = existingRedirectsContent;
if (firstStartIndex !== -1 && lastEndIndex !== -1 && lastEndIndex > firstStartIndex) {
  manualContent =
    existingRedirectsContent.slice(0, firstStartIndex) +
    existingRedirectsContent.slice(lastEndIndex + END_MARKER.length);
}

const manualRules = new Set();
manualContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }
  const [from] = trimmed.split(/\s+/);
  if (from) {
    manualRules.add(from);
  }
});

const currentSlugSet = new Set(currentCities.map((city) => city.slug));
const currentByNameCountry = new Map();
const countrySlugMap = new Map();

currentCities.forEach((city) => {
  const key = nameCountryKey(city.name, city.country);
  if (!currentByNameCountry.has(key)) {
    currentByNameCountry.set(key, city);
  }
  const countryKey = normalizeCountryKey(city.country);
  if (!countrySlugMap.has(countryKey)) {
    countrySlugMap.set(countryKey, normalize(city.country));
  }
});

const legacyCountryTargets = new Map();
const redirectLines = [];
const firebaseRedirects = [];
const generatedPaths = new Set();

const addLine = (pathValue, target, comment) => {
  if (manualRules.has(pathValue) || generatedPaths.has(pathValue)) {
    return;
  }
  redirectLines.push(formatLine(pathValue, target, comment));
  firebaseRedirects.push({
    source: pathValue,
    destination: target,
    type: 301
  });
  generatedPaths.add(pathValue);
};

legacyCities.forEach((legacyCity) => {
  if (currentSlugSet.has(legacyCity.slug)) {
    return;
  }

  const countryKey = normalizeCountryKey(legacyCity.country);
  const canonicalMatch = currentByNameCountry.get(
    nameCountryKey(legacyCity.name, legacyCity.country)
  );

  let cityTarget;
  let bestTimeTarget;
  let reason;

  if (canonicalMatch) {
    cityTarget = `/${canonicalMatch.slug}`;
    bestTimeTarget = `/best-time/${canonicalMatch.slug}`;
    reason = 'canonical';
  } else {
    const countrySlug = countrySlugMap.get(countryKey);
    if (countrySlug) {
      cityTarget = `/country/${countrySlug}`;
      bestTimeTarget = `/country/${countrySlug}`;
      reason = 'country';
    } else {
      cityTarget = FALLBACK_PATH;
      bestTimeTarget = FALLBACK_PATH;
      reason = 'global';
    }
  }

  const cityPath = `/${legacyCity.slug}`;
  const bestTimePath = `/best-time/${legacyCity.slug}`;
  const cityComment = `legacy city (${reason})`;
  const bestTimeComment = `legacy best-time (${reason})`;

  addLine(cityPath, cityTarget, cityComment);
  addLine(bestTimePath, bestTimeTarget, bestTimeComment);

  if (!countrySlugMap.has(countryKey)) {
    const legacyCountrySlug = normalize(legacyCity.country);
    if (!legacyCountryTargets.has(legacyCountrySlug)) {
      legacyCountryTargets.set(legacyCountrySlug, FALLBACK_PATH);
    }
  }
});

legacyCountryTargets.forEach((target, slug) => {
  const route = `/country/${slug}`;
  addLine(route, target, 'legacy country (global)');
});

redirectLines.sort((a, b) => {
  const pathA = a.split(/\s+/)[0];
  const pathB = b.split(/\s+/)[0];
  return pathA.localeCompare(pathB);
});

const section = [
  START_MARKER,
  '# Source: scripts/build-legacy-redirects.cjs',
  `# Generated: ${now}`,
  '# Do not edit this block manually. Run `npm run sync` to regenerate.',
  '',
  ...redirectLines,
  END_MARKER
].join('\n');

let updatedRedirects;

if (firstStartIndex !== -1 && lastEndIndex !== -1 && lastEndIndex > firstStartIndex) {
  const before = existingRedirectsContent.slice(0, firstStartIndex).trimEnd();
  const after = existingRedirectsContent
    .slice(lastEndIndex + END_MARKER.length)
    .replace(/^\n+/, '');

  updatedRedirects = [before, section, after].filter(Boolean).join('\n\n');
} else {
  updatedRedirects = `${existingRedirectsContent.trimEnd()}\n\n${section}`;
}

fs.writeFileSync(redirectsPath, `${updatedRedirects.trimEnd()}\n`, 'utf8');

// Update firebase.json with legacy redirects
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

  if (firebaseConfig.hosting && firebaseConfig.hosting.redirects) {
    // Remove old auto-generated redirects (those with comment markers)
    const existingManualRedirects = firebaseConfig.hosting.redirects.filter(redirect => {
      // Keep only manually defined redirects (not auto-generated)
      return !redirect._autoGenerated;
    });

    // Mark new redirects as auto-generated
    const markedRedirects = firebaseRedirects.map(redirect => ({
      ...redirect,
      _autoGenerated: true
    }));

    // Combine manual and auto-generated redirects
    firebaseConfig.hosting.redirects = [
      ...existingManualRedirects,
      ...markedRedirects
    ];

    fs.writeFileSync(
      firebaseConfigPath,
      JSON.stringify(firebaseConfig, null, 2) + '\n',
      'utf8'
    );

    console.log(`✅ Firebase config updated with ${firebaseRedirects.length} legacy redirects.`);
  }
}

console.log(`✅ Legacy redirect section updated with ${redirectLines.length} entries.`);
