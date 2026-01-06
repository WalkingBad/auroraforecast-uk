#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ruFile = path.join(__dirname, '../src/data/web-strings/ru.json');
const esFile = path.join(__dirname, '../src/data/web-strings/es.json');

// Read Russian translations
const ruData = JSON.parse(fs.readFileSync(ruFile, 'utf-8'));
const enFile = path.join(__dirname, '../src/data/web-strings/en.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

const keys = Object.keys(ruData);
console.log(`📖 Found ${keys.length} keys to translate from Russian to Spanish`);

// Translate function with caching and retry
const translatedCache = {};
const failedKeys = [];

function translateText(text) {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string') {
      resolve(text);
      return;
    }

    // Skip very short keys (abbreviations, etc.)
    if (text.length < 2) {
      resolve(text);
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ru|es`;

    const timeout = setTimeout(() => {
      console.warn(`⚠️  Timeout for: ${text.substring(0, 30)}...`);
      failedKeys.push(text);
      resolve(text);
    }, 5000);

    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          clearTimeout(timeout);
          try {
            const parsed = JSON.parse(data);
            const translated = parsed.responseData?.translatedText || text;
            if (translated && translated !== text) {
              resolve(translated);
            } else {
              resolve(text);
              failedKeys.push(text);
            }
          } catch (e) {
            console.warn(`❌ Parse error for: ${text.substring(0, 30)}...`);
            failedKeys.push(text);
            resolve(text);
          }
        });
      })
      .on('error', (err) => {
        clearTimeout(timeout);
        console.warn(`❌ Request error: ${err.message}`);
        failedKeys.push(text);
        resolve(text);
      });
  });
}

// Main translation loop
async function translateAll() {
  const esData = {};
  let translated = 0;
  let failed = 0;

  console.log('\n🔄 Starting Spanish translation...\n');

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const ruText = ruData[key];

    process.stdout.write(
      `\r⏳ Progress: ${i + 1}/${keys.length} (${translated} translated, ${failed} failed)`
    );

    const esText = await translateText(ruText);

    // If translation failed, use English fallback
    if (esText === ruText || !esText) {
      esData[key] = enData[key] || ruText;
      failed++;
    } else {
      esData[key] = esText;
      translated++;
    }

    // Rate limiting - increase delay to avoid API limit
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n\n✅ Spanish translation completed!');
  console.log(`📊 Stats: ${translated} translated, ${failed} used English fallback`);

  if (failedKeys.length > 0) {
    console.log(`\n⚠️  Failed to translate ${failedKeys.length} items (used English fallback)`);
  }

  // Write to file
  fs.writeFileSync(esFile, JSON.stringify(esData, null, 2), 'utf-8');
  console.log(`\n✅ Spanish translations written to: ${esFile}`);
  console.log(`📁 Total keys: ${Object.keys(esData).length}`);
}

translateAll().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
