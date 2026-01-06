#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targetLang = process.argv[2]; // no, de, es, fr
if (!targetLang) {
  console.error('Usage: node translate-from-english.mjs <target_lang>');
  process.exit(1);
}

const enFile = path.join(__dirname, '../src/data/web-strings/en.json');
const targetFile = path.join(__dirname, `../src/data/web-strings/${targetLang}.json`);

const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));

// Find keys that still have English text (not translated)
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

function translateText(text, retries = 5) {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string' || text.length < 2) {
      resolve(text);
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;

    const attemptTranslate = (attempt = 0) => {
      if (attempt >= retries) {
        resolve(text); // Keep English if translation fails
        return;
      }

      const timeout = setTimeout(() => {
        setTimeout(() => attemptTranslate(attempt + 1), 1000);
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

              // Check if translation is valid
              if (translated &&
                  translated !== text &&
                  !translated.includes('MYMEMORY') &&
                  !translated.includes('MEMORY WARNING')) {
                resolve(translated);
              } else {
                // Retry with backoff
                setTimeout(() => attemptTranslate(attempt + 1), 500 + Math.random() * 1000);
              }
            } catch (e) {
              setTimeout(() => attemptTranslate(attempt + 1), 500 + Math.random() * 1000);
            }
          });
        })
        .on('error', () => {
          clearTimeout(timeout);
          setTimeout(() => attemptTranslate(attempt + 1), 1000);
        });
    };

    attemptTranslate();
  });
}

async function translateAll() {
  let translated = 0;
  let failed = 0;

  console.log(`🔄 Translating ${targetLang.toUpperCase()} from English...\n`);

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

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 150));
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
