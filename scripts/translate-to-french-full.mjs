#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ruFile = path.join(__dirname, '../src/data/web-strings/ru.json');
const frFile = path.join(__dirname, '../src/data/web-strings/fr.json');
const enFile = path.join(__dirname, '../src/data/web-strings/en.json');

const ruData = JSON.parse(fs.readFileSync(ruFile, 'utf-8'));
const frData = JSON.parse(fs.readFileSync(frFile, 'utf-8'));
const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

const keys = Object.keys(ruData);
const untranslatedKeys = [];

for (const key of keys) {
  if (frData[key] === enData[key]) {
    untranslatedKeys.push(key);
  }
}

console.log(`⚠️  Found ${untranslatedKeys.length} untranslated French keys to fix\n`);

const stillFailed = [];

function translateText(text, retries = 5) {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string' || text.length < 2) {
      resolve(text);
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ru|fr`;

    const attemptTranslate = (attempt = 0) => {
      if (attempt >= retries) {
        stillFailed.push(text);
        resolve(text);
        return;
      }

      const timeout = setTimeout(() => {
        setTimeout(() => attemptTranslate(attempt + 1), 1000 + Math.random() * 1000);
      }, 10000);

      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            clearTimeout(timeout);
            try {
              const parsed = JSON.parse(data);
              const translated = parsed.responseData?.translatedText || text;
              if (translated && translated !== text && !translated.includes('MYMEMORY')) {
                resolve(translated);
              } else {
                setTimeout(() => attemptTranslate(attempt + 1), 400 + Math.random() * 800);
              }
            } catch (e) {
              setTimeout(() => attemptTranslate(attempt + 1), 400 + Math.random() * 800);
            }
          });
        })
        .on('error', () => {
          clearTimeout(timeout);
          setTimeout(() => attemptTranslate(attempt + 1), 1000 + Math.random() * 1000);
        });
    };

    attemptTranslate();
  });
}

async function translateAll() {
  let translated = 0;

  console.log('🔄 Translating French...\n');

  for (let i = 0; i < untranslatedKeys.length; i++) {
    const key = untranslatedKeys[i];
    const ruText = ruData[key];

    process.stdout.write(`\r⏳ ${i + 1}/${untranslatedKeys.length}`);

    const frText = await translateText(ruText);
    if (frText !== enData[key]) {
      frData[key] = frText;
      translated++;
    }

    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));
  }

  console.log('\n✅ French translation completed!');
  console.log(`📊 Translated: ${translated}/${untranslatedKeys.length}`);

  fs.writeFileSync(frFile, JSON.stringify(frData, null, 2), 'utf-8');
  console.log(`✅ Written to: ${frFile}`);
}

translateAll().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
