#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ruFile = path.join(__dirname, '../src/data/web-strings/ru.json');
const noFile = path.join(__dirname, '../src/data/web-strings/no.json');

const ruData = JSON.parse(fs.readFileSync(ruFile, 'utf-8'));
const noData = JSON.parse(fs.readFileSync(noFile, 'utf-8'));
const enFile = path.join(__dirname, '../src/data/web-strings/en.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

const keys = Object.keys(ruData);
console.log(`📖 Found ${keys.length} keys to ensure are translated to Norwegian`);

// Find keys that are not translated (still have English)
const untranslatedKeys = [];
for (const key of keys) {
  if (noData[key] === enData[key]) {
    untranslatedKeys.push(key);
  }
}

console.log(`⚠️  Found ${untranslatedKeys.length} untranslated keys to fix\n`);

const translatedCache = {};
const stillFailed = [];

function translateText(text, retries = 3) {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string' || text.length < 2) {
      resolve(text);
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ru|no`;

    const attemptTranslate = (attempt = 0) => {
      if (attempt >= retries) {
        console.warn(`❌ Failed to translate after ${retries} attempts: ${text.substring(0, 30)}...`);
        stillFailed.push(text);
        resolve(text);
        return;
      }

      const timeout = setTimeout(() => {
        console.warn(`⚠️  Timeout (attempt ${attempt + 1}): ${text.substring(0, 30)}...`);
        setTimeout(() => attemptTranslate(attempt + 1), 500 + Math.random() * 500);
      }, 8000);

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

              // Check if translation is valid (not the same as original)
              if (translated && translated !== text && !translated.includes('MYMEMORY')) {
                resolve(translated);
              } else {
                // Retry on failure
                setTimeout(() => attemptTranslate(attempt + 1), 300 + Math.random() * 700);
              }
            } catch (e) {
              setTimeout(() => attemptTranslate(attempt + 1), 300 + Math.random() * 700);
            }
          });
        })
        .on('error', (err) => {
          clearTimeout(timeout);
          setTimeout(() => attemptTranslate(attempt + 1), 500 + Math.random() * 500);
        });
    };

    attemptTranslate();
  });
}

async function translateAll() {
  let translated = 0;

  console.log('🔄 Starting Norwegian translation for untranslated keys...\n');

  for (let i = 0; i < untranslatedKeys.length; i++) {
    const key = untranslatedKeys[i];
    const ruText = ruData[key];

    process.stdout.write(
      `\r⏳ Progress: ${i + 1}/${untranslatedKeys.length} (${translated} translated)`
    );

    const noText = await translateText(ruText);

    // Only accept if it's not English
    if (noText !== enData[key] && noText !== ruText) {
      noData[key] = noText;
      translated++;
    } else {
      console.warn(`\n⚠️  Could not translate ${key}: ${ruText.substring(0, 40)}...`);
    }

    // Slower rate limiting to avoid API issues
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));
  }

  console.log('\n\n✅ Norwegian translation completed!');
  console.log(`📊 Stats: ${translated}/${untranslatedKeys.length} previously untranslated keys now translated`);

  if (stillFailed.length > 0) {
    console.log(`\n⚠️  Could not translate ${stillFailed.length} items despite retries`);
  }

  // Write to file
  fs.writeFileSync(noFile, JSON.stringify(noData, null, 2), 'utf-8');
  console.log(`\n✅ Norwegian translations updated to: ${noFile}`);
}

translateAll().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
