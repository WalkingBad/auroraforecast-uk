/**
 * UTM Parameter Builder for Store Links
 * Generates dynamic UTM parameters for tracking app downloads from different pages
 */

export interface UtmParams {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export type PageType =
  | 'homepage'
  | 'homepage_hero'
  | 'city_page'
  | 'best_time'
  | 'country_hub'
  | 'state_page'
  | 'guide'
  | 'aurora_tracker'
  | 'other';

/**
 * Generate UTM parameters based on page context
 */
export function buildUtmParams(pageType: PageType, context?: {
  citySlug?: string;
  countryCode?: string;
  stateCode?: string;
  guideSlug?: string;
  placement?: string; // hero, footer, cta, sticky, inline
}): UtmParams {
  const placement = context?.placement || 'default';

  const params: UtmParams = {
    source: 'website',
    medium: 'organic',
  };

  switch (pageType) {
    case 'homepage':
    case 'homepage_hero':
      params.campaign = 'homepage';
      params.content = `homepage_${placement}`;
      break;

    case 'city_page':
      params.campaign = context?.citySlug || 'city_page';
      params.content = `city_${placement}`;
      break;

    case 'best_time':
      params.campaign = context?.citySlug || 'best_time';
      params.content = `best_time_${placement}`;
      break;

    case 'country_hub':
      // Lowercase for consistent analytics (us, ca, etc.)
      params.campaign = context?.countryCode?.toLowerCase() || 'country';
      params.content = `country_hub_${placement}`;
      break;

    case 'state_page':
      // Only build combined campaign if both codes are present, otherwise fallback to 'state'
      if (context?.countryCode && context?.stateCode) {
        params.campaign = `${context.countryCode.toLowerCase()}_${context.stateCode.toLowerCase()}`;
      } else {
        params.campaign = 'state';
      }
      params.content = `state_page_${placement}`;
      break;

    case 'guide':
      params.campaign = context?.guideSlug || 'guides';
      params.content = `guide_${placement}`;
      break;

    case 'aurora_tracker':
      params.campaign = 'aurora_tracker';
      params.content = `aurora_tracker_${placement}`;
      break;

    default:
      params.campaign = 'web';
      params.content = placement;
  }

  return params;
}

/**
 * Convert UTM params to URL query string
 */
export function utmParamsToString(params: UtmParams): string {
  const parts: string[] = [
    `utm_source=${encodeURIComponent(params.source)}`,
    `utm_medium=${encodeURIComponent(params.medium)}`,
  ];

  if (params.campaign) {
    parts.push(`utm_campaign=${encodeURIComponent(params.campaign)}`);
  }
  if (params.content) {
    parts.push(`utm_content=${encodeURIComponent(params.content)}`);
  }
  if (params.term) {
    parts.push(`utm_term=${encodeURIComponent(params.term)}`);
  }

  return parts.join('&');
}

/**
 * Build store URL with UTM parameters
 */
export function buildStoreUrl(baseUrl: string, utmParams: UtmParams): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${utmParamsToString(utmParams)}`;
}

/**
 * Helper to create legacy utm string for backwards compatibility
 */
export function buildLegacyUtmString(pageType: PageType, context?: {
  citySlug?: string;
  countryCode?: string;
  stateCode?: string;
  guideSlug?: string;
  placement?: string;
}): string {
  const params = buildUtmParams(pageType, context);
  return params.campaign || 'web';
}
