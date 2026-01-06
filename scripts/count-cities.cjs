#!/usr/bin/env node
/**
 * City Localization Counter
 *
 * Verifies the number of cities that will be localized for each language
 * based on language-targeting.json configuration.
 *
 * Usage: node scripts/count-cities.cjs
 */

const targeting = require('../src/config/language-targeting.json');
const cities = require('../src/data/cities.json');

/**
 * Determines if a city should be translated to a given language
 */
function shouldTranslateCity(city, lang) {
  const langConfig = targeting.languageConfig[lang];
  if (!langConfig) return false;

  // Check if city's country matches language targeting
  const countryMatch = langConfig.countries.includes(city.country) ||
                       langConfig.countryCodes.includes(city.countryCode);
  if (countryMatch) return true;

  // Check if city is in top cities list for this language
  if (langConfig.topCities.includes(city.slug)) return true;

  return false;
}

/**
 * Count cities for each language
 */
function countCitiesByLanguage() {
  const counts = {};
  const cityDetails = {};

  // Get all languages except English (English uses root pages)
  const languages = Object.keys(targeting.languageConfig).filter(lang => lang !== 'en');

  for (const lang of languages) {
    counts[lang] = 0;
    cityDetails[lang] = [];

    for (const city of cities) {
      if (shouldTranslateCity(city, lang)) {
        counts[lang]++;
        cityDetails[lang].push(city.slug);
      }
    }
  }

  return { counts, cityDetails };
}

/**
 * Main execution
 */
function main() {
  console.log('🌍 City Localization Counter\n');
  console.log('Configuration: language-targeting.json');
  console.log('Total cities in cities.json:', cities.length);
  console.log('');

  const { counts, cityDetails } = countCitiesByLanguage();

  // Display counts
  console.log('📊 Localized Cities per Language:\n');

  let totalLocalized = 0;
  for (const [lang, count] of Object.entries(counts)) {
    console.log(`  ${lang}: ${count} cities`);
    totalLocalized += count;
  }

  console.log('');
  console.log(`  Total: ${totalLocalized} localized pages`);
  console.log(`  English: ${cities.length} pages (root URLs)`);
  console.log(`  Grand Total: ${totalLocalized + cities.length} pages`);
  console.log('');

  // Calculate reduction
  const languageCount = Object.keys(counts).length;
  const wouldBeWithoutTargeting = cities.length * languageCount;
  const reduction = ((wouldBeWithoutTargeting - totalLocalized) / wouldBeWithoutTargeting * 100).toFixed(1);

  console.log(`💡 Optimization:`);
  console.log(`  Without targeting: ${cities.length} × ${languageCount} = ${wouldBeWithoutTargeting} pages`);
  console.log(`  With targeting: ${totalLocalized} pages`);
  console.log(`  Reduction: ${reduction}%`);
  console.log('');

  // Show details if verbose flag is set
  if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
    console.log('📋 City Details by Language:\n');
    for (const [lang, slugs] of Object.entries(cityDetails)) {
      console.log(`  ${lang} (${slugs.length} cities):`);
      console.log(`    ${slugs.slice(0, 5).join(', ')}${slugs.length > 5 ? `, ... (${slugs.length - 5} more)` : ''}`);
      console.log('');
    }
  }

  // Return status code based on expected counts
  // This allows the script to be used in CI/CD validation
  const EXPECTED_COUNTS = {
    ru: 44,
    no: 105,
    de: 60,
    es: 57,
    fr: 54
  };

  let allMatch = true;
  for (const [lang, expectedCount] of Object.entries(EXPECTED_COUNTS)) {
    if (counts[lang] !== expectedCount) {
      console.error(`❌ ERROR: ${lang} expected ${expectedCount} but got ${counts[lang]}`);
      allMatch = false;
    }
  }

  if (!allMatch) {
    console.error('\n⚠️  City counts do not match expected values!');
    process.exit(1);
  }

  console.log('✅ All city counts match expected values');
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { shouldTranslateCity, countCitiesByLanguage };
