#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ruFile = path.join(__dirname, '../src/data/web-strings/ru.json');
const frFile = path.join(__dirname, '../src/data/web-strings/fr.json');

// Read Russian translations
const ruData = JSON.parse(fs.readFileSync(ruFile, 'utf-8'));
const enFile = path.join(__dirname, '../src/data/web-strings/en.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

const keys = Object.keys(ruData);
console.log(`📖 Found ${keys.length} keys to translate from Russian to French`);

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
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ru|fr`;

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
  const frData = {};
  let translated = 0;
  let failed = 0;

  console.log('\n🔄 Starting French translation...\n');

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const ruText = ruData[key];

    process.stdout.write(
      `\r⏳ Progress: ${i + 1}/${keys.length} (${translated} translated, ${failed} failed)`
    );

    const frText = await translateText(ruText);

    // If translation failed, use English fallback
    if (frText === ruText || !frText) {
      frData[key] = enData[key] || ruText;
      failed++;
    } else {
      frData[key] = frText;
      translated++;
    }

    // Rate limiting - increase delay to avoid API limit
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n\n✅ French translation completed!');
  console.log(`📊 Stats: ${translated} translated, ${failed} used English fallback`);

  if (failedKeys.length > 0) {
    console.log(`\n⚠️  Failed to translate ${failedKeys.length} items (used English fallback)`);
  }

  // Write to file
  fs.writeFileSync(frFile, JSON.stringify(frData, null, 2), 'utf-8');
  console.log(`\n✅ French translations written to: ${frFile}`);
  console.log(`📁 Total keys: ${Object.keys(frData).length}`);
}

translateAll().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
