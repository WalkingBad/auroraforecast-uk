#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ruFile = path.join(__dirname, '../src/data/web-strings/ru.json');
const noFile = path.join(__dirname, '../src/data/web-strings/no.json');

// Read Russian translations
const ruData = JSON.parse(fs.readFileSync(ruFile, 'utf-8'));
const keys = Object.keys(ruData);
console.log(`📖 Found ${keys.length} keys to translate from Russian to Norwegian`);

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
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ru|no`;

    const timeout = setTimeout(() => {
      console.warn(`⚠️  Timeout for: ${text.substring(0, 30)}...`);
      failedKeys.push(text);
      resolve(text); // Return original text on timeout
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
            // Avoid back-translations (if translation is same as source, it failed)
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
  const noData = {};
  let translated = 0;
  let failed = 0;

  console.log('\n🔄 Starting translation...\n');

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const ruText = ruData[key];

    process.stdout.write(
      `\r⏳ Progress: ${i + 1}/${keys.length} (${translated} translated, ${failed} failed)`
    );

    const noText = await translateText(ruText);
    noData[key] = noText;

    if (noText !== ruText) {
      translated++;
    } else if (ruText !== noText) {
      // It's the same text (failed translation)
      failed++;
    }

    // Rate limiting - be nice to the API
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log('\n\n✅ Translation completed!');
  console.log(`📊 Stats: ${translated} translated, ${failed} failed to translate`);

  if (failedKeys.length > 0) {
    console.log(`\n⚠️  Failed to translate ${failedKeys.length} items (will use Russian originals)`);
  }

  // Write to file
  fs.writeFileSync(noFile, JSON.stringify(noData, null, 2), 'utf-8');
  console.log(`\n✅ Norwegian translations written to: ${noFile}`);
  console.log(`📁 Total keys: ${Object.keys(noData).length}`);
}

translateAll().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
