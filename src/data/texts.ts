export const texts = {
  en: {
    ctaHeroTitle: 'Get precise aurora alerts',
    ctaHeroSubtitle: 'Smart notifications when visibility improves based on your exact location.',
    threeHourTitle: '6-Hour Forecast',
    visibilityTitle: 'What affects visibility',
    ctaContexts: {
      heroHeadline: 'Get precise aurora alerts for your location',
      heroSubheading: 'Smart notifications, extended forecasts, and offline access — all in your pocket',
      timelineHeadline: 'See the full 72-hour aurora timeline',
      timelineSubheading: 'Plan your aurora viewing with detailed hourly forecasts and weather integration',
      travelHeadline: 'Track aurora across multiple destinations',
      travelSubheading: 'Perfect for travelers — monitor aurora activity in all your planned locations',
      generalHeadline: 'Experience the complete aurora forecast',
      generalSubheading: 'Everything you see here, plus smart alerts, extended forecasts, and much more'
    },
    faq: {
      title: 'Frequently Asked Questions — {name}',
      q1: 'Can I see aurora during full moon in {name}?',
      a1: 'Yes! While bright moonlight can wash out faint auroras, it also illuminates the landscape beautifully. During strong aurora activity (high status), the lights are bright enough to see even with a full moon. The app helps you balance moon phases with aurora intensity for optimal viewing.',
      q2: 'Do I need Kp 7 to see aurora in {name}?',
      a2Prefix: 'Not necessarily. Based on {name}\'s magnetic latitude',
      a2Suffix: 'you typically need Kp {kpThreshold}+ for good visibility. The app calculates precise local thresholds and sends alerts only when aurora is likely visible from your specific location.',
      q3: 'When is the best month for aurora in {name}?',
      a3Prefix: 'The optimal months are',
      a3Suffix: 'when nights are longest and skies darkest. Activity peaks around equinoxes (March/September) due to solar wind interactions. Download the app for seasonal patterns and 27-day aurora history.',
      q4: 'Should I go to specific spots or stay near {name}?',
      a4: 'Both work! The aurora is visible across a wide area. Dark sky locations away from city lights offer better visibility, but aurora can be seen from {name} during strong activity. The app includes recent sightings feed to see where others spotted aurora nearby.',
      q5: 'What time should I check tonight in {name}?',
      a5: 'Aurora activity can happen anytime when dark, but peak hours are typically 22:00-02:00 local time. For precise timing, download the app for 72-hour forecasting with best hour recommendations based on Kp peaks, cloud breaks, and optimal darkness windows.',
      q6: 'How accurate are aurora forecasts for {name}?',
      a6: 'Our system combines multiple data sources (NOAA, GFZ) with local factors like magnetic latitude, weather, and twilight calculations. The app provides location-specific thresholds and smart low-noise alerts to avoid false positives. Accuracy improves closer to the event time.'
    }
  }
} as const;
