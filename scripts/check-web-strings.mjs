#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const stringsDir = join(process.cwd(), 'src', 'data', 'web-strings');
const files = readdirSync(stringsDir).filter((file) => file.endsWith('.json'));

if (!files.includes('en.json')) {
  console.error('Missing en.json in src/data/web-strings. Unable to run comparison.');
  process.exit(1);
}

const KEY_PREFIXES = ['city_', 'cross_link_'];
const REQUIRED_KEYS = ['darkness_timer_suffix'];

function isTrackedKey(key) {
  return KEY_PREFIXES.some((prefix) => key.startsWith(prefix)) || REQUIRED_KEYS.includes(key);
}

const reference = JSON.parse(readFileSync(join(stringsDir, 'en.json'), 'utf8'));
const referenceKeys = new Set(Object.keys(reference).filter(isTrackedKey));

let hasMismatch = false;

for (const file of files) {
  const filePath = join(stringsDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const keys = new Set(Object.keys(data).filter(isTrackedKey));

  const missing = [...referenceKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !referenceKeys.has(key));

  if (missing.length || extra.length) {
    hasMismatch = true;
    if (missing.length) {
      console.error(`\n${file} is missing keys:\n  - ${missing.join('\n  - ')}`);
    }
    if (extra.length) {
      console.error(`\n${file} has extra keys:\n  - ${extra.join('\n  - ')}`);
    }
  }
}

if (hasMismatch) {
  process.exit(1);
}

console.log('All web string files are in sync with en.json');
