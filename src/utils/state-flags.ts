/**
 * US State and Canadian Province flags
 * Using Wikimedia Commons SVG URLs for official flags
 */

// US State flags - Wikipedia/Wikimedia Commons URLs
const US_STATE_FLAGS: Record<string, string> = {
  'ak': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Flag_of_Alaska.svg',
  'al': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Alabama.svg',
  'ar': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
  'az': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arizona.svg',
  'ca': 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
  'co': 'https://upload.wikimedia.org/wikipedia/commons/4/46/Flag_of_Colorado.svg',
  'ct': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Flag_of_Connecticut.svg',
  'de': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Flag_of_Delaware.svg',
  'fl': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
  'ga': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Flag_of_Georgia_%28U.S._state%29.svg',
  'hi': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Flag_of_Hawaii.svg',
  'ia': 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Flag_of_Iowa.svg',
  'id': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_Idaho.svg',
  'il': 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_Illinois.svg',
  'in': 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Flag_of_Indiana.svg',
  'ks': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Kansas.svg',
  'ky': 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Flag_of_Kentucky.svg',
  'la': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Flag_of_Louisiana.svg',
  'ma': 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Flag_of_Massachusetts.svg',
  'md': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Flag_of_Maryland.svg',
  'me': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Flag_of_Maine.svg',
  'mi': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Flag_of_Michigan.svg',
  'mn': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Minnesota.svg',
  'mo': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Flag_of_Missouri.svg',
  'ms': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Flag_of_Mississippi.svg',
  'mt': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_Montana.svg',
  'nc': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Flag_of_North_Carolina.svg',
  'nd': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Flag_of_North_Dakota.svg',
  'ne': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Flag_of_Nebraska.svg',
  'nh': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Flag_of_New_Hampshire.svg',
  'nj': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_New_Jersey.svg',
  'nm': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_New_Mexico.svg',
  'nv': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Flag_of_Nevada.svg',
  'ny': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_New_York.svg',
  'oh': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Ohio.svg',
  'ok': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Flag_of_Oklahoma.svg',
  'or': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Oregon.svg',
  'pa': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Pennsylvania.svg',
  'ri': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Rhode_Island.svg',
  'sc': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Flag_of_South_Carolina.svg',
  'sd': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_South_Dakota.svg',
  'tn': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Tennessee.svg',
  'tx': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
  'ut': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Flag_of_Utah.svg',
  'va': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Flag_of_Virginia.svg',
  'vt': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Vermont.svg',
  'wa': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Flag_of_Washington.svg',
  'wi': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Flag_of_Wisconsin.svg',
  'wv': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Flag_of_West_Virginia.svg',
  'wy': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Wyoming.svg',
};

// Canadian Province/Territory flags
const CA_PROVINCE_FLAGS: Record<string, string> = {
  'ab': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Flag_of_Alberta.svg',
  'bc': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Flag_of_British_Columbia.svg',
  'mb': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Flag_of_Manitoba.svg',
  'nb': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Flag_of_New_Brunswick.svg',
  'nl': 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Newfoundland_and_Labrador.svg',
  'ns': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Nova_Scotia.svg',
  'nt': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Flag_of_the_Northwest_Territories.svg',
  'nu': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Flag_of_Nunavut.svg',
  'on': 'https://upload.wikimedia.org/wikipedia/commons/8/88/Flag_of_Ontario.svg',
  'pe': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Flag_of_Prince_Edward_Island.svg',
  'qc': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Flag_of_Quebec.svg',
  'sk': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Flag_of_Saskatchewan.svg',
  'yt': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Flag_of_Yukon.svg',
};

// State name to code mapping
const US_STATE_CODES: Record<string, string> = {
  'alaska': 'ak', 'alabama': 'al', 'arkansas': 'ar', 'arizona': 'az',
  'california': 'ca', 'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de',
  'florida': 'fl', 'georgia': 'ga', 'hawaii': 'hi', 'iowa': 'ia',
  'idaho': 'id', 'illinois': 'il', 'indiana': 'in', 'kansas': 'ks',
  'kentucky': 'ky', 'louisiana': 'la', 'massachusetts': 'ma', 'maryland': 'md',
  'maine': 'me', 'michigan': 'mi', 'minnesota': 'mn', 'missouri': 'mo',
  'mississippi': 'ms', 'montana': 'mt', 'north-carolina': 'nc', 'north-dakota': 'nd',
  'nebraska': 'ne', 'new-hampshire': 'nh', 'new-jersey': 'nj', 'new-mexico': 'nm',
  'nevada': 'nv', 'new-york': 'ny', 'ohio': 'oh', 'oklahoma': 'ok',
  'oregon': 'or', 'pennsylvania': 'pa', 'rhode-island': 'ri', 'south-carolina': 'sc',
  'south-dakota': 'sd', 'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut',
  'virginia': 'va', 'vermont': 'vt', 'washington': 'wa', 'wisconsin': 'wi',
  'west-virginia': 'wv', 'wyoming': 'wy'
};

const CA_PROVINCE_CODES: Record<string, string> = {
  'alberta': 'ab', 'british-columbia': 'bc', 'manitoba': 'mb',
  'new-brunswick': 'nb', 'newfoundland-and-labrador': 'nl', 'newfoundland': 'nl',
  'nova-scotia': 'ns', 'northwest-territories': 'nt', 'nunavut': 'nu',
  'ontario': 'on', 'prince-edward-island': 'pe', 'quebec': 'qc',
  'saskatchewan': 'sk', 'yukon': 'yt'
};

/**
 * Get flag URL for a US state or Canadian province
 * @param stateSlug - normalized state slug (e.g., 'ak', 'california', 'british-columbia')
 * @param countryCode - 'US' or 'CA'
 * @returns URL to flag SVG or null if not found
 */
export function getStateFlagUrl(stateSlug: string, countryCode: string): string | null {
  const normalizedSlug = stateSlug.toLowerCase().replace(/\s+/g, '-');
  const countryLower = countryCode.toLowerCase();

  if (countryLower === 'us') {
    // Try direct match (2-letter code)
    if (US_STATE_FLAGS[normalizedSlug]) {
      return US_STATE_FLAGS[normalizedSlug];
    }
    // Try full name
    const code = US_STATE_CODES[normalizedSlug];
    if (code && US_STATE_FLAGS[code]) {
      return US_STATE_FLAGS[code];
    }
  }

  if (countryLower === 'ca') {
    // Try direct match (2-letter code)
    if (CA_PROVINCE_FLAGS[normalizedSlug]) {
      return CA_PROVINCE_FLAGS[normalizedSlug];
    }
    // Try full name
    const code = CA_PROVINCE_CODES[normalizedSlug];
    if (code && CA_PROVINCE_FLAGS[code]) {
      return CA_PROVINCE_FLAGS[code];
    }
  }

  return null;
}

/**
 * Check if country has state/province flags
 */
export function hasStateFlags(countryCode: string): boolean {
  const code = countryCode.toLowerCase();
  return code === 'us' || code === 'ca';
}
