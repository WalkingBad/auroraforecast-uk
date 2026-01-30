import citiesData from '../data/site-cities';
import { normalizeStateSlug, getCountryISO, REGIONS } from '../utils/slug-normalizer.ts';
import { getCitiesForLanguage, SUPPORTED_LANGUAGES } from '../config/language-targeting.ts';
import { getStateStaticEntries, stateSupportsLanguage } from '../utils/state-pages.ts';

// Use languages from config (only generates URLs for actually supported languages)
const LANGUAGES = SUPPORTED_LANGUAGES;

export async function GET() {
  const baseUrl = 'https://auroraforecast.uk';
  const currentDate = new Date().toISOString().split('T')[0];

  // All multilingual URLs (including geo-targeted city pages)
  const allMultilingualUrls = [];

  // Static pages that have multilingual versions
  // NOTE: 404 pages are excluded from sitemap - they should not be indexed
  const staticMultilingualPages = [
    { url: '', priority: '1.0', changefreq: 'daily' }, // Homepage
    { url: 'aurora-tracker', priority: '0.9', changefreq: 'daily' },
    { url: 'terms', priority: '0.3', changefreq: 'monthly' },
    { url: 'privacy', priority: '0.3', changefreq: 'monthly' },
    { url: 'cookie-policy', priority: '0.3', changefreq: 'monthly' }
  ];

  // Add English versions of static pages (no prefix)
  allMultilingualUrls.push(...staticMultilingualPages);

  // Add English city pages (all cities, no prefix)
  citiesData.forEach(city => {
    allMultilingualUrls.push({
      url: city.slug,
      priority: '0.9',
      changefreq: 'hourly'
    });
  });

  // Add localized versions for each non-English language
  for (const lang of LANGUAGES.filter(l => l !== 'en')) {
    // Add static pages with language prefix
    staticMultilingualPages.forEach(page => {
      allMultilingualUrls.push({
        ...page,
        url: `${lang}/${page.url}`
      });
    });

    // Add geo-targeted city pages for this language
    const citiesForLang = getCitiesForLanguage(citiesData, lang);
    citiesForLang.forEach(city => {
      allMultilingualUrls.push({
        url: `${lang}/${city.slug}`,
        priority: '0.9',
        changefreq: 'hourly'
      });
    });

    // Add localized best-time pages (only for cities available in this language)
    citiesForLang.forEach(city => {
      allMultilingualUrls.push({
        url: `${lang}/best-time/${city.slug}`,
        priority: '0.7',
        changefreq: 'weekly'
      });
    });

    // Add localized best-time pages for states/regions only if language is supported
    const stateEntries = getStateStaticEntries();
    stateEntries.forEach(entry => {
      if (stateSupportsLanguage(entry.stateData, lang)) {
        allMultilingualUrls.push({
          url: `${lang}/best-time/${entry.stateData.iso}`,
          priority: '0.6',
          changefreq: 'weekly'
        });
      }
    });
  }

  // English-only pages (no [lang]/ versions)
  const englishOnlyPages = [];

  // SEO landing pages (targeting high-volume keywords)
  // Note: aurora-visibility redirects to aurora-borealis-forecast (keyword cannibalization fix)
  englishOnlyPages.push(
    { url: 'aurora-borealis-forecast', priority: '0.9', changefreq: 'hourly' },
    { url: 'northern-lights-near-me', priority: '0.8', changefreq: 'daily' },
    { url: 'contact', priority: '0.4', changefreq: 'monthly' }
  );

  // Regional hub pages (for better internal linking and crawlability)
  englishOnlyPages.push(
    { url: 'region/scotland', priority: '0.8', changefreq: 'daily' },
    { url: 'region/england', priority: '0.8', changefreq: 'daily' },
    { url: 'region/wales', priority: '0.8', changefreq: 'daily' },
    { url: 'region/northern-ireland', priority: '0.8', changefreq: 'daily' }
  );

  // Country pages
  const countriesMap = new Map();
  citiesData.forEach(city => {
    const countryKey = city.country.toLowerCase().replace(/\s+/g, '-');
    if (!countriesMap.has(countryKey)) {
      countriesMap.set(countryKey, true);
    }
  });

  countriesMap.forEach((_, countrySlug) => {
    englishOnlyPages.push({
      url: `country/${countrySlug}`,
      priority: '0.7',
      changefreq: 'daily'
    });
  });

  // State/Region pages
  const statesMap = new Map();

  // Add US and Canadian states
  citiesData
    .filter(city => city.state && ['US', 'CA'].includes(city.countryCode))
    .forEach(city => {
      const countryISO = getCountryISO(city.country);
      const stateISO = normalizeStateSlug(city.state, city.countryCode);
      const key = `${countryISO}/${stateISO}`;

      if (!statesMap.has(key)) {
        statesMap.set(key, true);
        englishOnlyPages.push({
          url: key,
          priority: '0.8',
          changefreq: 'daily'
        });
      }
    });

  // Add region pages
  Object.entries(REGIONS).forEach(([slug, region]) => {
    const regionCities = citiesData.filter(city => {
      if (city.countryCode !== region.country.toUpperCase()) return false;
      const stateSlug = city.state?.toLowerCase().replace(/\s+/g, '-');
      return region.states.includes(stateSlug);
    });

    if (regionCities.length > 0) {
      englishOnlyPages.push({
        url: `${region.country}/${slug}`,
        priority: '0.8',
        changefreq: 'daily'
      });
    }
  });

  // Best-time pages for cities
  citiesData.forEach(city => {
    englishOnlyPages.push({
      url: `best-time/${city.slug}`,
      priority: '0.7',
      changefreq: 'weekly'
    });
  });

  // Best-time pages for states
  const processedStates = new Set();
  citiesData
    .filter(city => city.state && ['US', 'CA'].includes(city.countryCode))
    .forEach(city => {
      const stateISO = normalizeStateSlug(city.state, city.countryCode);

      if (!processedStates.has(stateISO)) {
        processedStates.add(stateISO);
        englishOnlyPages.push({
          url: `best-time/${stateISO}`,
          priority: '0.6',
          changefreq: 'weekly'
        });
      }
    });

  // Combine all pages
  const allPages = [
    ...allMultilingualUrls,
    ...englishOnlyPages
  ];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
