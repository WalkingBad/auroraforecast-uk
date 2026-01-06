/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated at: 2026-01-05T21:23:31.650Z
 * Run 'npm run sync' to regenerate
 */

import type { SupportedLanguage } from '../config/language-targeting.ts';

export type { FactorDefinition, FactorStatusLevel, FactorColorType } from './factor-definitions/en.ts';
export { getStatusColor } from './factor-definitions/en.ts';

// Import all language-specific factor definitions
import * as en from './factor-definitions/en.ts';
import * as ru from './factor-definitions/ru.ts';
import * as no from './factor-definitions/no.ts';
import * as de from './factor-definitions/de.ts';
import * as es from './factor-definitions/es.ts';
import * as fr from './factor-definitions/fr.ts';

const factorDefinitionsMap = {
  en: en.factorDefinitions,
  ru: ru.factorDefinitions,
  no: no.factorDefinitions,
  de: de.factorDefinitions,
  es: es.factorDefinitions,
  fr: fr.factorDefinitions
};

/**
 * Get factor definitions for a specific language
 * @param lang - Language code (en, ru, no, de, es, fr)
 * @returns Localized factor definitions
 */
export function getFactorDefinitions(lang: SupportedLanguage) {
  return factorDefinitionsMap[lang] || factorDefinitionsMap.en;
}

// Backward compatibility: export English as default
export const factorDefinitions = en.factorDefinitions;
