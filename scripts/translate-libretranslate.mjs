#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targetLang = process.argv[2]; // no, de, es, fr
if (!targetLang) {
  console.error('Usage: node translate-libretranslate.mjs <target_lang>');
  process.exit(1);
}

// Map language codes
const langMap = {
  'no': 'nb', // LibreTranslate uses 'nb' for Norwegian
  'de': 'de',
  'es': 'es',
  'fr': 'fr'
};

const libreTranslateLang = langMap[targetLang] || targetLang;

const enFile = path.join(__dirname, '../src/data/web-strings/en.json');
const targetFile = path.join(__dirname, `../src/data/web-strings/${targetLang}.json`);

const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));

// Find untranslated keys
const untranslatedKeys = [];
for (const key of Object.keys(enData)) {
  if (targetData[key] === enData[key] || !targetData[key]) {
    untranslatedKeys.push(key);
  }
}

console.log(`📖 Found ${untranslatedKeys.length} untranslated ${targetLang.toUpperCase()} keys\n`);

if (untranslatedKeys.length === 0) {
  console.log('✅ All keys already translated!');
  process.exit(0);
}

function translateText(text, retries = 3) {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string' || text.length < 2) {
      resolve(text);
      return;
    }

    const attemptTranslate = (attempt = 0) => {
      if (attempt >= retries) {
        resolve(text); // Keep English if translation fails
        return;
      }

      const postData = JSON.stringify({
        q: text,
        source: 'en',
        target: libreTranslateLang,
        format: 'text'
      });

      const options = {
        hostname: 'libretranslate.com',
        port: 443,
        path: '/translate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const timeout = setTimeout(() => {
        setTimeout(() => attemptTranslate(attempt + 1), 1000);
      }, 15000);

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          clearTimeout(timeout);
          try {
            const parsed = JSON.parse(data);
            const translated = parsed.translatedText || text;

            if (translated && translated !== text && !translated.includes('error')) {
              resolve(translated);
            } else {
              setTimeout(() => attemptTranslate(attempt + 1), 500 + Math.random() * 1000);
            }
          } catch (e) {
            setTimeout(() => attemptTranslate(attempt + 1), 500 + Math.random() * 1000);
          }
        });
      });

      req.on('error', () => {
        clearTimeout(timeout);
        setTimeout(() => attemptTranslate(attempt + 1), 1000);
      });

      req.write(postData);
      req.end();
    };

    attemptTranslate();
  });
}

async function translateAll() {
  let translated = 0;
  let failed = 0;

  console.log(`🔄 Translating ${targetLang.toUpperCase()} via LibreTranslate...\n`);

  for (let i = 0; i < untranslatedKeys.length; i++) {
    const key = untranslatedKeys[i];
    const enText = enData[key];

    process.stdout.write(
      `\r⏳ Progress: ${i + 1}/${untranslatedKeys.length} (${translated} translated, ${failed} kept English)`
    );

    const translatedText = await translateText(enText);

    if (translatedText !== enText) {
      targetData[key] = translatedText;
      translated++;
    } else {
      failed++;
    }

    // Rate limiting - LibreTranslate allows more requests
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));
  }

  console.log(`\n\n✅ Translation completed!`);
  console.log(`📊 Stats: ${translated} translated, ${failed} kept English fallback`);

  fs.writeFileSync(targetFile, JSON.stringify(targetData, null, 2), 'utf-8');
  console.log(`✅ Written to: ${targetFile}`);
}

translateAll().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
