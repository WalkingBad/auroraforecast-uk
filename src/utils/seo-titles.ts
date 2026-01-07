/**
 * SEO-Optimized Title Generation for Aurora Forecast Pages
 * Targets high-volume keywords based on magnetic latitude
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
 * Targets 500K/month keywords: "northern lights tonight", "aurora forecast", "aurora tracker"
 */
export function generateTrackerTitle(): string {
  return "Live Aurora Map & Forecast Tracker - Northern Lights Tonight UK";
}

export function generateSEOTitle(city: CityData): string {
  const magneticLat = city.magneticLat || 50;

  // High-latitude cities (MLAT > 55) - Most likely to see aurora (Scotland)
  // Target: "northern lights tonight UK" searches
  if (magneticLat > 55) {
    if (isMajorCity(city.name)) {
      return `Northern Lights Tonight ${city.name} | Aurora Forecast UK`;
    }
    return `Northern Lights ${city.name} Tonight | UK Aurora Forecast`;
  }

  // Mid-latitude cities (MLAT 45-55) - England, Wales, N. Ireland
  else if (magneticLat > 45) {
    return `${city.name} Aurora Forecast | Northern Lights UK`;
  }

  // Low-latitude cities (MLAT < 45) - Southern England
  else {
    return `${city.name} Northern Lights Alerts | Aurora UK`;
  }
}

/**
 * Generate optimized meta description with high-value keywords
 */
export function generateSEODescription(city: CityData): string {
  const magneticLat = city.magneticLat || 50;

  if (magneticLat > 55) {
    return `See northern lights tonight in ${city.name}? Live aurora tracker for Scotland and the UK with real-time Kp index, Met Office data, and local conditions. Get instant alerts. Best dark sky spots near ${city.name}.`;
  } else if (magneticLat > 45) {
    return `Aurora forecast for ${city.name} - track northern lights across the United Kingdom. Live Kp index, cloud cover, moonrise times. Free alerts when aurora is visible. Download our UK aurora app.`;
  } else {
    return `Northern lights alerts for ${city.name}. Rare aurora events tracked with Met Office data and Kp monitoring. Get notified during geomagnetic storms visible in southern England.`;
  }
}

/**
 * Generate dynamic meta description with real-time data
 */
export function generateDynamicDescription(city: CityData, kp: number, clouds: number, status: string): string {
  // High Activity: Sell the urgency
  if (status === 'high' || status === 'medium') {
    const cloudText = clouds <= 20 ? 'Clear skies' : (clouds <= 50 ? 'Partly cloudy' : 'Check cloud map');
    return `Live forecast for ${city.name}: High chance (KP ${kp}) tonight. ${cloudText}. Best viewing time: 10 PM - 2 AM. View real-time alerts.`;
  }

  // Low Activity: Sell the planning/monitoring
  return `Live forecast for ${city.name}: Current KP ${kp}. Check tonight's best viewing window and 3-day prediction. Set free alerts for sudden activity spikes.`;
}

/**
 * Generate H1 optimized for featured snippets and voice search
 */
export function generateSEOH1(city: CityData): string {
  const magneticLat = city.magneticLat || 50;

  if (magneticLat > 55) {
    return `Northern Lights Tonight in ${city.name}`;
  } else if (magneticLat > 45) {
    return `Aurora Forecast & Visibility in ${city.name}`;
  } else {
    return `Aurora Alerts for ${city.name}`;
  }
}

/**
 * Get geo-specific name for better local SEO
 */
function getGeoName(city: CityData): string {
  return `${city.name}, ${city.country}`;
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
 * Generate breadcrumb text optimized for rich snippets
 */
export function generateBreadcrumbs(city: CityData): Array<{ name: string, url: string }> {
  const crumbs = [
    { name: 'Aurora Forecast', url: '/' }
  ];

  crumbs.push({
    name: `${city.country} Aurora`,
    url: `/country/${city.country.toLowerCase().replace(' ', '-')}`
  });

  crumbs.push({
    name: city.name,
    url: `/${city.slug}`
  });

  return crumbs;
}

/**
 * Generate FAQ questions for schema markup (targets voice search)
 */
export function generateFAQSchema(city: CityData): Array<{ question: string, answer: string }> {
  const magneticLat = city.magneticLat || 50;
  const kpThreshold = calculateKpThreshold(magneticLat);

  return [
    {
      question: `Can I see northern lights tonight in ${city.name}?`,
      answer: `Northern lights visibility in ${city.name} depends on KP index reaching ${kpThreshold} or higher, clear skies, and darkness. Check our real-time forecast for tonight's aurora chances.`
    },
    {
      question: `What time are northern lights visible in ${city.name}?`,
      answer: `The best time to see aurora in ${city.name} is typically between 10 PM and 2 AM local time, when skies are darkest. Our app shows the optimal viewing hour based on real-time conditions.`
    },
    {
      question: `How often can you see northern lights in ${city.name}?`,
      answer: magneticLat > 55
        ? `${city.name} at magnetic latitude ${magneticLat.toFixed(1)}° can see aurora frequently during active periods, typically 10-20 nights per year depending on solar activity.`
        : `${city.name} at magnetic latitude ${magneticLat.toFixed(1)}° sees aurora during strong geomagnetic storms, typically 1-5 times per year when KP reaches ${kpThreshold} or higher.`
    }
  ];
}
