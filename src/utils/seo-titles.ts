/**
 * SEO-Optimized Title Generation for Aurora Forecast Pages
 * Targets high-volume keywords based on magnetic latitude
 *
 * TOP KEYWORDS (500K/month each):
 * - "aurora forecast" / "aurora borealis forecast"
 * - "aurora borealis prediction" / "aurora borealis visibility"
 * - "northern lights aurora borealis forecast"
 *
 * HIGH GROWTH (YoY +9900%):
 * - "aurora borealis visibility tonight"
 * - "see aurora borealis tonight"
 */

import { calculateKpThreshold } from './kp-bands';

export interface CityData {
  name: string;
  country: string;
  state?: string;
  countryCode: string;
  slug: string;
  magneticLat?: number;
}

/**
 * Generate SEO-optimized title based on magnetic latitude and search volume
 * Targets 500K/month keywords: "aurora borealis forecast", "northern lights tonight"
 */
export function generateTrackerTitle(): string {
  return "Live Aurora Borealis Map UK | Northern Lights Tracker Tonight";
}

export function generateSEOTitle(city: CityData): string {
  const magneticLat = city.magneticLat || 50;

  // High-latitude cities (MLAT > 55) - Most likely to see aurora (Scotland)
  // Target: "aurora borealis tonight", "northern lights tonight" (50K each)
  if (magneticLat > 55) {
    if (isMajorCity(city.name)) {
      return `Aurora Borealis Tonight ${city.name} | Northern Lights UK`;
    }
    return `Northern Lights ${city.name} Tonight | Aurora Borealis UK`;
  }

  // Mid-latitude cities (MLAT 45-55) - England, Wales, N. Ireland
  // Target: "aurora borealis forecast" (500K/month)
  else if (magneticLat > 45) {
    return `${city.name} Aurora Borealis Forecast | Northern Lights UK`;
  }

  // Low-latitude cities (MLAT < 45) - Southern England
  // Target: "aurora borealis visibility" (5K, +9900% growth)
  else {
    return `${city.name} Aurora Borealis Visibility | Northern Lights UK`;
  }
}

/**
 * Generate optimized meta description with high-value keywords
 * Targets: "aurora borealis visibility", "see aurora borealis tonight", "aurora prediction"
 */
export function generateSEODescription(city: CityData): string {
  const magneticLat = city.magneticLat || 50;

  if (magneticLat > 55) {
    // Target: "see aurora borealis tonight" (5K, +9900%), "aurora borealis visibility tonight"
    return `See aurora borealis tonight in ${city.name}? Live visibility prediction with real-time Kp index and weather. Best time to view northern lights in Scotland. Free aurora alerts.`;
  } else if (magneticLat > 45) {
    // Target: "aurora borealis forecast" (500K), "aurora borealis prediction"
    return `Aurora borealis forecast for ${city.name} with live visibility prediction. Track northern lights across UK with Kp index, cloud cover, moon phase. Free aurora borealis alerts.`;
  } else {
    // Target: "aurora borealis visibility" (5K, +9900% growth)
    return `Aurora borealis visibility alerts for ${city.name}. Northern lights prediction with Met Office data. Get notified when aurora is visible in southern England.`;
  }
}

/**
 * Generate dynamic meta description with real-time data
 * Targets: "aurora borealis tonight", "time of aurora borealis tonight"
 */
export function generateDynamicDescription(city: CityData, kp: number, clouds: number, status: string): string {
  // High Activity: Sell the urgency
  // Target: "see aurora borealis tonight", "viewing aurora borealis tonight"
  if (status === 'high' || status === 'medium') {
    const cloudText = clouds <= 20 ? 'Clear skies' : (clouds <= 50 ? 'Partly cloudy' : 'Check cloud map');
    return `See aurora borealis tonight in ${city.name}: High visibility (KP ${kp}). ${cloudText}. Best viewing time: 10 PM - 2 AM. Free alerts.`;
  }

  // Low Activity: Sell the planning/monitoring
  // Target: "aurora borealis prediction", "aurora borealis forecast"
  return `Aurora borealis prediction for ${city.name}: Current KP ${kp}. Check tonight's visibility window and 3-day forecast. Free aurora alerts.`;
}

/**
 * Generate H1 optimized for featured snippets and voice search
 * Targets: "aurora borealis tonight", "aurora borealis visibility"
 */
export function generateSEOH1(city: CityData): string {
  const magneticLat = city.magneticLat || 50;

  if (magneticLat > 55) {
    // Target: "aurora borealis tonight {city}" (50K/month)
    return `Aurora Borealis Tonight in ${city.name}`;
  } else if (magneticLat > 45) {
    // Target: "aurora borealis forecast" (500K/month)
    return `Aurora Borealis Forecast for ${city.name}`;
  } else {
    // Target: "aurora borealis visibility" (+9900% growth)
    return `Aurora Borealis Visibility in ${city.name}`;
  }
}

/**
 * Check if city is a major metropolitan area (higher search volume)
 */
function isMajorCity(cityName: string): boolean {
  const majorCities = [
    'London',
    'Manchester',
    'Birmingham',
    'Glasgow',
    'Edinburgh',
    'Belfast',
    'Newcastle'
  ];

  return majorCities.includes(cityName);
}

/**
 * Generate title for country hub pages
 */
export function generateCountryTitle(country: string, cityCount: number): string {
  const countryTitles: Record<string, string> = {
    'United Kingdom': `Northern Lights UK Tonight - Aurora Forecast ${cityCount} Cities`,
  };

  return countryTitles[country] || `Aurora Forecast ${country} - ${cityCount} Cities Northern Lights Tracker`;
}

/**
 * Generate title for state/province pages
 */
export function generateStateTitle(state: string, stateCode: string, cityCount: number): string {
  return `${state} Aurora Forecast - ${cityCount} Cities Northern Lights Tracker`;
}

/**
 * Generate FAQ questions for schema markup (targets voice search)
 * Expanded to 7 questions for better featured snippet coverage
 *
 * Target queries:
 * - "can I see aurora borealis tonight" (5K, +9900%)
 * - "what time is aurora borealis visible" (5K, +9900%)
 * - "what KP index needed for aurora" (common query)
 * - "where to view aurora borealis UK"
 */
export function generateFAQSchema(city: CityData): Array<{ question: string, answer: string }> {
  const magneticLat = city.magneticLat || 50;
  const kpThreshold = calculateKpThreshold(magneticLat);

  return [
    {
      // Target: "can I see aurora borealis tonight" (5K, +9900% growth)
      question: `Can I see aurora borealis tonight in ${city.name}?`,
      answer: `Aurora borealis visibility in ${city.name} requires KP index of ${kpThreshold} or higher, clear skies, and darkness. Check our real-time visibility prediction for tonight's aurora borealis chances.`
    },
    {
      // Target: "what time is aurora borealis visible tonight" (5K, +9900%)
      question: `What time is aurora borealis visible in ${city.name}?`,
      answer: `The best time to see aurora borealis in ${city.name} is between 10 PM and 2 AM local time when skies are darkest. Our live tracker shows the optimal viewing window based on real-time Kp index and weather conditions.`
    },
    {
      // Target: "how often aurora borealis visible"
      question: `How often can you see aurora borealis in ${city.name}?`,
      answer: magneticLat > 55
        ? `${city.name} at magnetic latitude ${magneticLat.toFixed(1)}° sees aurora borealis frequently during solar maximum, typically 15-25 nights per year. Current solar cycle 25 is near peak activity.`
        : `${city.name} at magnetic latitude ${magneticLat.toFixed(1)}° sees aurora borealis during strong geomagnetic storms, typically 2-8 times per year when KP reaches ${kpThreshold}+.`
    },
    {
      // Target: "what KP index needed for aurora" / "aurora borealis KP"
      question: `What KP index is needed to see aurora borealis in ${city.name}?`,
      answer: `${city.name} needs a KP index of ${kpThreshold} or higher to see aurora borealis. Higher KP values (${kpThreshold + 1}-9) increase visibility chances and aurora intensity. Our app sends free alerts when KP reaches your threshold.`
    },
    {
      // Target: "where to view aurora borealis" / "best place to see northern lights"
      question: `Where is the best place to view aurora borealis near ${city.name}?`,
      answer: `For best aurora borealis viewing near ${city.name}, find a dark sky location away from city lights with clear northern horizon. Parks, beaches, and elevated areas work well. Check our dark sky map for nearby spots.`
    },
    {
      // Target: "aurora borealis forecast accuracy" / "how accurate aurora prediction"
      question: `How accurate is the aurora borealis forecast for ${city.name}?`,
      answer: `Our aurora borealis forecast combines NOAA space weather data, Met Office cloud predictions, moon phase, and magnetic latitude calculations. Short-term predictions (0-3 hours) are most accurate; 27-day forecasts show solar rotation patterns.`
    },
    {
      // Target: "aurora borealis alerts" / "northern lights notification"
      question: `How do I get aurora borealis alerts for ${city.name}?`,
      answer: `Download our free Aurora Forecast app to get instant push notifications when aurora borealis is likely visible in ${city.name}. Set your KP threshold (${kpThreshold} recommended) and receive alerts for clear sky opportunities.`
    }
  ];
}
