#!/usr/bin/env node

/**
 * Core Web Vitals Testing Script
 * Tests performance impact of new sections and components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeComponentComplexity() {
  console.log('🔍 Analyzing Component Complexity for Core Web Vitals');
  console.log('=' .repeat(60));
  
  const cityPagePath = path.join(__dirname, 'src/pages/[city].astro');
  
  if (!fs.existsSync(cityPagePath)) {
    console.log('❌ City page template not found');
    return { score: 0, issues: ['City page template missing'] };
  }
  
  const content = fs.readFileSync(cityPagePath, 'utf8');
  const issues = [];
  let score = 100;
  
  // Check for lazy loading implementation
  if (!content.includes('ResponsiveTestWrapper')) {
    issues.push('Missing lazy loading for heavy components');
    score -= 20;
  } else {
    console.log('✅ Lazy loading implemented with ResponsiveTestWrapper');
  }
  
  // Check for SSR configuration
  if (!content.includes('export const prerender = false')) {
    issues.push('Static generation may serve stale data');
    score -= 10;
  } else {
    console.log('✅ SSR enabled for fresh data');
  }
  
  // Check for error handling
  if (!content.includes('getSafeThreeHourForecast') || !content.includes('getSafeCountryCities')) {
    issues.push('Missing safe data handling functions');
    score -= 15;
  } else {
    console.log('✅ Safe data handling implemented');
  }
  
  // Check for multiple CTA sections (potential layout shift)
  const ctaMatches = content.match(/StoreBadges/g);
  const ctaCount = ctaMatches ? ctaMatches.length : 0;
  
  if (ctaCount > 3) {
    issues.push(`Too many CTA sections (${ctaCount}) may cause layout shift`);
    score -= 10;
  } else {
    console.log(`✅ Reasonable number of CTA sections: ${ctaCount}`);
  }
  
  // Check for inline styles (potential render blocking)
  const inlineStyleMatches = content.match(/style=\{/g);
  const inlineStyleCount = inlineStyleMatches ? inlineStyleMatches.length : 0;
  
  if (inlineStyleCount > 10) {
    issues.push(`High number of inline styles (${inlineStyleCount}) may impact rendering`);
    score -= 5;
  } else {
    console.log(`✅ Reasonable inline styles usage: ${inlineStyleCount}`);
  }
  
  console.log(`\n📊 Component Complexity Score: ${score}/100`);
  
  return { score, issues };
}

function analyzeBundleSize() {
  console.log('\n🔍 Analyzing Bundle Size Impact');
  console.log('=' .repeat(40));
  
  const citiesPath = path.join(__dirname, 'src/data/cities.json');
  const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  
  const dataSize = JSON.stringify(citiesData).length;
  const dataSizeKB = Math.round(dataSize / 1024);
  
  console.log(`📊 Cities data size: ${dataSizeKB}KB`);
  
  const issues = [];
  let score = 100;
  
  if (dataSizeKB > 50) {
    issues.push(`Cities data too large (${dataSizeKB}KB) for optimal bundle size`);
    score -= 20;
  } else {
    console.log('✅ Cities data size is reasonable');
  }
  
  // Check for potential data redundancy
  const descriptions = citiesData.map(city => city.description || '').join('');
  const seoTitles = citiesData.map(city => city.seoTitle || '').join('');
  const seoDescriptions = citiesData.map(city => city.seoDescription || '').join('');
  
  const totalTextSize = descriptions.length + seoTitles.length + seoDescriptions.length;
  const textSizeKB = Math.round(totalTextSize / 1024);
  
  console.log(`📊 Text content size: ${textSizeKB}KB`);
  
  if (textSizeKB > 20) {
    issues.push(`High text content size (${textSizeKB}KB) may impact initial load`);
    score -= 10;
  }
  
  console.log(`\n📊 Bundle Size Score: ${score}/100`);
  
  return { score, issues, dataSizeKB, textSizeKB };
}

function analyzeRenderingPerformance() {
  console.log('\n🔍 Analyzing Rendering Performance');
  console.log('=' .repeat(45));
  
  const cityPagePath = path.join(__dirname, 'src/pages/[city].astro');
  const content = fs.readFileSync(cityPagePath, 'utf8');
  
  const issues = [];
  let score = 100;
  
  // Check for potential layout shifts
  const dynamicContentSections = [
    'three-hour-forecast',
    'country-cities-gallery',
    'strategic-cta'
  ];
  
  let hasMinHeight = 0;
  dynamicContentSections.forEach(section => {
    if (content.includes(section) && content.includes('minHeight')) {
      hasMinHeight++;
    }
  });
  
  if (hasMinHeight < dynamicContentSections.length) {
    issues.push('Some dynamic sections missing min-height (potential CLS)');
    score -= 15;
  } else {
    console.log('✅ Dynamic sections have min-height defined');
  }
  
  // Check for image optimization
  if (content.includes('<img') && !content.includes('loading="lazy"')) {
    issues.push('Images not optimized with lazy loading');
    score -= 10;
  } else {
    console.log('✅ No unoptimized images detected');
  }
  
  // Check for JavaScript execution
  const scriptTags = content.match(/<script[^>]*>/g);
  const scriptCount = scriptTags ? scriptTags.length : 0;
  
  if (scriptCount > 3) {
    issues.push(`Multiple script tags (${scriptCount}) may impact FID`);
    score -= 10;
  } else {
    console.log(`✅ Reasonable script usage: ${scriptCount} tags`);
  }
  
  console.log(`\n📊 Rendering Performance Score: ${score}/100`);
  
  return { score, issues };
}

function analyzeSEOPerformance() {
  console.log('\n🔍 Analyzing SEO Performance Impact');
  console.log('=' .repeat(45));
  
  const citiesPath = path.join(__dirname, 'src/data/cities.json');
  const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  
  const issues = [];
  let score = 100;
  
  // Check for duplicate content risk
  const countries = [...new Set(citiesData.map(city => city.country))];
  const avgCitiesPerCountry = citiesData.length / countries.length;
  
  if (avgCitiesPerCountry > 3) {
    issues.push(`High cities per country (${avgCitiesPerCountry.toFixed(1)}) increases duplicate content risk`);
    score -= 10;
  } else {
    console.log('✅ Good distribution of cities per country');
  }
  
  // Check for keyword density
  const allKeywords = citiesData.flatMap(city => city.keywords || []);
  const keywordFrequency = {};
  
  allKeywords.forEach(keyword => {
    keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
  });
  
  const duplicateKeywords = Object.entries(keywordFrequency)
    .filter(([_, count]) => count > 1)
    .length;
  
  if (duplicateKeywords > 0) {
    issues.push(`${duplicateKeywords} keywords used by multiple cities`);
    score -= 5;
  } else {
    console.log('✅ No duplicate keywords detected');
  }
  
  // Check for meta description uniqueness
  const descriptions = citiesData.map(city => city.seoDescription).filter(Boolean);
  const uniqueDescriptions = new Set(descriptions);
  
  if (descriptions.length !== uniqueDescriptions.size) {
    issues.push('Duplicate meta descriptions detected');
    score -= 15;
  } else {
    console.log('✅ All meta descriptions are unique');
  }
  
  console.log(`\n📊 SEO Performance Score: ${score}/100`);
  
  return { score, issues };
}

function generatePerformanceReport() {
  console.log('\n📋 CORE WEB VITALS PERFORMANCE REPORT');
  console.log('=' .repeat(60));
  
  const componentAnalysis = analyzeComponentComplexity();
  const bundleAnalysis = analyzeBundleSize();
  const renderingAnalysis = analyzeRenderingPerformance();
  const seoAnalysis = analyzeSEOPerformance();
  
  const overallScore = Math.round(
    (componentAnalysis.score + bundleAnalysis.score + renderingAnalysis.score + seoAnalysis.score) / 4
  );
  
  console.log(`\n🎯 Overall Performance Score: ${overallScore}/100`);
  
  const allIssues = [
    ...componentAnalysis.issues,
    ...bundleAnalysis.issues,
    ...renderingAnalysis.issues,
    ...seoAnalysis.issues
  ];
  
  if (allIssues.length === 0) {
    console.log('🎉 No performance issues detected! Core Web Vitals should be optimal.');
  } else {
    console.log(`\n⚠️  Found ${allIssues.length} performance issues:`);
    allIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');
  
  if (overallScore >= 90) {
    console.log('   ✅ Excellent performance! Monitor Core Web Vitals in production.');
  } else if (overallScore >= 75) {
    console.log('   ⚠️  Good performance with room for improvement. Address issues above.');
  } else {
    console.log('   ❌ Performance needs attention. Prioritize fixing critical issues.');
  }
  
  console.log('   • Use Lighthouse CI for continuous monitoring');
  console.log('   • Test on real devices with slow networks');
  console.log('   • Monitor CLS, LCP, and FID metrics in production');
  
  return {
    overallScore,
    issues: allIssues,
    breakdown: {
      component: componentAnalysis.score,
      bundle: bundleAnalysis.score,
      rendering: renderingAnalysis.score,
      seo: seoAnalysis.score
    }
  };
}

// Run performance analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePerformanceReport();
}

export { generatePerformanceReport };