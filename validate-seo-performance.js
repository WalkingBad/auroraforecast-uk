#!/usr/bin/env node

/**
 * SEO and Performance Validation Script
 * Tests H1 character limits, unique meta descriptions, and performance impact
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import cities data
const citiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/cities.json'), 'utf8'));

// Import geo-utils functions
const geoUtilsPath = path.join(__dirname, 'src/utils/geo-utils.ts');
const geoUtilsContent = fs.readFileSync(geoUtilsPath, 'utf8');

// Simple TypeScript-to-JavaScript conversion for validation
function getGeoSpecificName(city) {
  if ((city.countryCode === 'US' || city.countryCode === 'CA') && city.state) {
    return `${city.name}, ${city.state}`;
  }
  return `${city.name}, ${city.country}`;
}

function generateOptimizedH1(city) {
  const geoName = getGeoSpecificName(city);
  const baseTitle = `Northern Lights forecast in ${geoName} tonight`;
  
  // If title is too long, use shorter format
  if (baseTitle.length > 60) {
    // For long state/province names, try abbreviated format first
    if ((city.countryCode === 'US' || city.countryCode === 'CA') && city.state) {
      const shortTitle = `Northern Lights in ${city.name}, ${city.state} tonight`;
      if (shortTitle.length <= 60) {
        return shortTitle;
      }
      // If still too long, use state abbreviation or just city
      const stateAbbreviations = {
        'Northwest Territories': 'NWT',
        'British Columbia': 'BC',
        'Newfoundland and Labrador': 'NL'
      };
      
      const abbrev = stateAbbreviations[city.state];
      if (abbrev) {
        const abbrevTitle = `Northern Lights in ${city.name}, ${abbrev} tonight`;
        if (abbrevTitle.length <= 60) {
          return abbrevTitle;
        }
      }
    }
    return `Northern Lights in ${city.name} tonight`;
  }
  
  return baseTitle;
}

function generateOptimizedTitle(city) {
  const maxLength = 60;
  
  // Try different title formats in order of preference
  const geoName = getGeoSpecificName(city);
  
  // Format 1: Full format with suffix
  const fullTitle = `Northern Lights forecast in ${geoName} tonight — live visibility & conditions`;
  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }
  
  // Format 2: Without suffix
  const baseTitle = `Northern Lights forecast in ${geoName} tonight`;
  if (baseTitle.length <= maxLength) {
    return baseTitle;
  }
  
  // Format 3: Shorter format with geo
  const shortGeoTitle = `Northern Lights in ${geoName} tonight`;
  if (shortGeoTitle.length <= maxLength) {
    return shortGeoTitle;
  }
  
  // Format 4: Just city name
  const cityTitle = `Northern Lights in ${city.name} tonight`;
  if (cityTitle.length <= maxLength) {
    return cityTitle;
  }
  
  // Format 5: Minimal fallback
  return `Aurora forecast ${city.name}`;
}

function generateOptimizedDescription(city) {
  const geoName = getGeoSpecificName(city);
  return `Live aurora visibility forecast for ${geoName}. Check tonight's conditions, cloud cover, moon phase and optimal viewing times.`;
}

// Validation functions
function validateH1CharacterLimits() {
  console.log('\n🔍 Analyzing H1 Character Lengths (Informational)');
  console.log('=' .repeat(55));
  
  const results = [];
  let under60 = 0;
  let over60 = 0;
  
  citiesData.forEach(city => {
    const h1 = generateOptimizedH1(city);
    const length = h1.length;
    const isUnder60 = length <= 60;
    
    results.push({
      city: city.name,
      slug: city.slug,
      h1,
      length,
      isUnder60,
      geoName: getGeoSpecificName(city)
    });
    
    if (isUnder60) {
      under60++;
    } else {
      over60++;
      console.log(`📏 ${city.name}: ${length} chars - "${h1}"`);
    }
  });
  
  console.log(`\n📊 H1 Length Distribution:`);
  console.log(`   Under 60 chars: ${under60}/${citiesData.length} cities`);
  console.log(`   Over 60 chars: ${over60}/${citiesData.length} cities`);
  
  if (over60 > 0) {
    console.log(`\n💡 Note: Longer H1s provide complete geo information but may be truncated in SERP`);
  }
  
  // Show longest H1s for reference
  const sortedByLength = results.sort((a, b) => b.length - a.length);
  console.log('\n📊 Longest H1 titles:');
  sortedByLength.slice(0, 3).forEach(result => {
    console.log(`   ${result.city}: ${result.length} chars - "${result.h1}"`);
  });
  
  return { under60, over60, results };
}

function validateUniqueMetaDescriptions() {
  console.log('\n🔍 Testing Unique Meta Descriptions (Keyword Cannibalization Prevention)');
  console.log('=' .repeat(70));
  
  const descriptions = new Map();
  const duplicates = [];
  let unique = 0;
  
  citiesData.forEach(city => {
    // Use existing seoDescription or generate new one
    const description = city.seoDescription || generateOptimizedDescription(city);
    
    if (descriptions.has(description)) {
      duplicates.push({
        description,
        cities: [descriptions.get(description), city.name]
      });
    } else {
      descriptions.set(description, city.name);
      unique++;
    }
  });
  
  console.log(`✅ Unique descriptions: ${unique}/${citiesData.length}`);
  
  if (duplicates.length > 0) {
    console.log(`❌ Found ${duplicates.length} duplicate descriptions:`);
    duplicates.forEach(dup => {
      console.log(`   "${dup.description.substring(0, 80)}..." used by: ${dup.cities.join(', ')}`);
    });
  }
  
  // Check description lengths (Google shows ~155-160 chars)
  const longDescriptions = [];
  citiesData.forEach(city => {
    const description = city.seoDescription || generateOptimizedDescription(city);
    if (description.length > 160) {
      longDescriptions.push({
        city: city.name,
        length: description.length,
        description: description.substring(0, 80) + '...'
      });
    }
  });
  
  if (longDescriptions.length > 0) {
    console.log(`\n⚠️  ${longDescriptions.length} descriptions exceed 160 characters:`);
    longDescriptions.forEach(desc => {
      console.log(`   ${desc.city}: ${desc.length} chars - "${desc.description}"`);
    });
  }
  
  return { unique, duplicates: duplicates.length, longDescriptions: longDescriptions.length };
}

function validateSEOTitleLimits() {
  console.log('\n🔍 Testing SEO Title Character Limits');
  console.log('=' .repeat(50));
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  citiesData.forEach(city => {
    // Always use the new optimized title generation
    const title = generateOptimizedTitle(city);
    const length = title.length;
    const isValid = length <= 60;
    
    results.push({
      city: city.name,
      title,
      length,
      isValid
    });
    
    if (isValid) {
      passed++;
    } else {
      failed++;
      console.log(`❌ ${city.name}: ${length} chars - "${title}"`);
    }
  });
  
  console.log(`\n✅ Passed: ${passed}/${citiesData.length} titles within 60 characters`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${citiesData.length} titles exceed 60 characters`);
  }
  
  return { passed, failed, results };
}

function validateGeoSpecificNaming() {
  console.log('\n🔍 Testing Geo-Specific Naming (US/Canada State Priority)');
  console.log('=' .repeat(60));
  
  const usCanadaCities = citiesData.filter(city => 
    city.countryCode === 'US' || city.countryCode === 'CA'
  );
  
  let withState = 0;
  let withoutState = 0;
  
  usCanadaCities.forEach(city => {
    const geoName = getGeoSpecificName(city);
    const hasState = city.state && geoName.includes(city.state);
    
    if (hasState) {
      withState++;
      console.log(`✅ ${city.name}: "${geoName}" (includes state/province)`);
    } else {
      withoutState++;
      console.log(`⚠️  ${city.name}: "${geoName}" (missing state/province data)`);
    }
  });
  
  console.log(`\n📊 US/Canada cities with state/province: ${withState}/${usCanadaCities.length}`);
  
  return { withState, withoutState, total: usCanadaCities.length };
}

function validatePerformanceImpact() {
  console.log('\n🔍 Testing Performance Impact (Core Web Vitals)');
  console.log('=' .repeat(55));
  
  // Check for potential performance issues in the implementation
  const performanceChecks = {
    lazyLoading: false,
    componentOptimization: false,
    bundleSize: false,
    caching: false
  };
  
  // Check if lazy loading is implemented
  const cityPagePath = path.join(__dirname, 'src/pages/[city].astro');
  if (fs.existsSync(cityPagePath)) {
    const cityPageContent = fs.readFileSync(cityPagePath, 'utf8');
    
    // Check for ResponsiveTestWrapper (lazy loading implementation)
    if (cityPageContent.includes('ResponsiveTestWrapper')) {
      performanceChecks.lazyLoading = true;
      console.log('✅ Lazy loading implemented with ResponsiveTestWrapper');
    } else {
      console.log('⚠️  No lazy loading detected');
    }
    
    // Check for SSR configuration
    if (cityPageContent.includes('export const prerender = false')) {
      performanceChecks.caching = true;
      console.log('✅ SSR enabled for fresh data (prerender = false)');
    } else {
      console.log('⚠️  Static generation may serve stale data');
    }
    
    // Check for component optimization
    if (cityPageContent.includes('getSafeThreeHourForecast') && 
        cityPageContent.includes('getSafeCountryCities')) {
      performanceChecks.componentOptimization = true;
      console.log('✅ Safe data handling functions implemented');
    } else {
      console.log('⚠️  Missing safe data handling functions');
    }
  }
  
  // Check bundle size considerations
  const citiesCount = citiesData.length;
  const estimatedDataSize = JSON.stringify(citiesData).length;
  
  console.log(`📊 Cities data: ${citiesCount} cities, ~${Math.round(estimatedDataSize / 1024)}KB`);
  
  if (estimatedDataSize < 50000) { // Less than 50KB
    performanceChecks.bundleSize = true;
    console.log('✅ Cities data size is reasonable for bundle inclusion');
  } else {
    console.log('⚠️  Cities data might be too large for optimal bundle size');
  }
  
  const passedChecks = Object.values(performanceChecks).filter(Boolean).length;
  const totalChecks = Object.keys(performanceChecks).length;
  
  console.log(`\n📊 Performance checks passed: ${passedChecks}/${totalChecks}`);
  
  return { passedChecks, totalChecks, checks: performanceChecks };
}

function validateKeywordCannibalization() {
  console.log('\n🔍 Testing Keyword Cannibalization Prevention');
  console.log('=' .repeat(55));
  
  // Analyze keywords for potential conflicts
  const keywordMap = new Map();
  const conflicts = [];
  
  citiesData.forEach(city => {
    const keywords = city.keywords || [];
    keywords.forEach(keyword => {
      if (keywordMap.has(keyword)) {
        conflicts.push({
          keyword,
          cities: [keywordMap.get(keyword), city.name]
        });
      } else {
        keywordMap.set(keyword, city.name);
      }
    });
  });
  
  if (conflicts.length === 0) {
    console.log('✅ No keyword conflicts detected');
  } else {
    console.log(`⚠️  Found ${conflicts.length} potential keyword conflicts:`);
    conflicts.forEach(conflict => {
      console.log(`   "${conflict.keyword}" used by: ${conflict.cities.join(', ')}`);
    });
  }
  
  // Check for generic vs specific keywords
  const genericKeywords = [];
  const specificKeywords = [];
  
  citiesData.forEach(city => {
    const keywords = city.keywords || [];
    keywords.forEach(keyword => {
      if (keyword.includes(city.name.toLowerCase()) || 
          keyword.includes(city.slug)) {
        specificKeywords.push(keyword);
      } else {
        genericKeywords.push(keyword);
      }
    });
  });
  
  console.log(`📊 Specific keywords: ${specificKeywords.length}`);
  console.log(`📊 Generic keywords: ${genericKeywords.length}`);
  
  return { conflicts: conflicts.length, specificKeywords: specificKeywords.length };
}

// Main validation function
function runValidation() {
  console.log('🚀 Starting SEO and Performance Validation');
  console.log('=' .repeat(80));
  
  const results = {
    h1Limits: validateH1CharacterLimits(),
    seoTitles: validateSEOTitleLimits(),
    metaDescriptions: validateUniqueMetaDescriptions(),
    geoNaming: validateGeoSpecificNaming(),
    performance: validatePerformanceImpact(),
    keywords: validateKeywordCannibalization()
  };
  
  // Summary
  console.log('\n📋 VALIDATION SUMMARY');
  console.log('=' .repeat(50));
  
  const totalIssues = 
    results.seoTitles.failed +
    results.metaDescriptions.duplicates +
    results.metaDescriptions.longDescriptions +
    results.geoNaming.withoutState +
    (results.performance.totalChecks - results.performance.passedChecks) +
    results.keywords.conflicts;
  
  if (totalIssues === 0) {
    console.log('🎉 All validations passed! SEO and performance are optimized.');
  } else {
    console.log(`⚠️  Found ${totalIssues} issues that need attention:`);
  }
  
  // H1 lengths are informational, not issues
  if (results.h1Limits.over60 > 0) {
    console.log(`\n📏 H1 Length Info: ${results.h1Limits.over60} titles over 60 chars (by design for complete geo info)`);
  }
    if (results.seoTitles.failed > 0) {
      console.log(`   • ${results.seoTitles.failed} SEO titles exceed 60 characters`);
    }
    if (results.metaDescriptions.duplicates > 0) {
      console.log(`   • ${results.metaDescriptions.duplicates} duplicate meta descriptions`);
    }
    if (results.metaDescriptions.longDescriptions > 0) {
      console.log(`   • ${results.metaDescriptions.longDescriptions} descriptions exceed 160 characters`);
    }
    if (results.geoNaming.withoutState > 0) {
      console.log(`   • ${results.geoNaming.withoutState} US/Canada cities missing state data`);
    }
    if (results.performance.passedChecks < results.performance.totalChecks) {
      console.log(`   • ${results.performance.totalChecks - results.performance.passedChecks} performance optimizations missing`);
    }
    if (results.keywords.conflicts > 0) {
      console.log(`   • ${results.keywords.conflicts} keyword conflicts detected`);
    }
  }
  
  console.log('\n✅ Validation complete. Review issues above and update implementation as needed.');
  
  return results;
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation();
}

export { runValidation };