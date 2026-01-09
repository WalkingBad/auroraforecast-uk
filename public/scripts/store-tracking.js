// Store button click tracking for Google Analytics + Yandex.Metrica
// Tracks: store_click (main event) + download_app_{platform} (conversion)
// Also tracks: app_cta_view (CTA block views)
// Updated: Jan 2026 - Added site_id tracking for multi-domain analytics
(function() {
  'use strict';

  var tracked = new WeakSet();
  var viewedCtas = new WeakSet();

  // Get Yandex Metrika ID based on hostname
  function getYmId() {
    var ymIdMap = {
      'auroraforecast.me': 105603339,
      'www.auroraforecast.me': 105603339,
      'aurora-forecast-usa.com': 106166729,
      'www.aurora-forecast-usa.com': 106166729,
      'auroraforecast.uk': 106166738,
      'www.auroraforecast.uk': 106166738
    };
    return ymIdMap[window.location.hostname.toLowerCase()] || 105603339;
  }

  // Get site_id from global (set by BaseLayout.astro) or detect from hostname
  function getSiteId() {
    if (window.AURORA_SITE_ID) return window.AURORA_SITE_ID;
    var siteIdMap = {
      'auroraforecast.me': 'main',
      'www.auroraforecast.me': 'main',
      'aurora-forecast-usa.com': 'usa',
      'www.aurora-forecast-usa.com': 'usa',
      'auroraforecast.uk': 'uk',
      'www.auroraforecast.uk': 'uk'
    };
    return siteIdMap[window.location.hostname.toLowerCase()] || 'other';
  }

  // Helper: send to Yandex.Metrica
  function ymTrack(goal, params) {
    if (typeof ym !== 'undefined') {
      ym(getYmId(), 'reachGoal', goal, params);
    }
  }

  function trackStoreClick(element) {
    // Prevent double tracking
    if (tracked.has(element)) return;
    tracked.add(element);

    var platform = element.getAttribute('data-platform');
    var href = element.getAttribute('href');
    var siteId = getSiteId();

    // Get UTM from data attributes (server-rendered)
    var utmSource = element.getAttribute('data-utm-source') || 'website';
    var utmMedium = element.getAttribute('data-utm-medium') || 'organic';
    var utmCampaign = element.getAttribute('data-utm-campaign') || 'web';
    var utmContent = element.getAttribute('data-utm-content') || 'default';
    var pageType = element.getAttribute('data-page-type') || 'other';

    // Extract block from utm_content (e.g., "city_cta_72h" -> "72h")
    var blockMatch = utmContent.match(/cta_(\w+)$/);
    var block = blockMatch ? blockMatch[1] : 'unknown';

    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'store_click', {
        'platform': platform,
        'site_id': siteId,
        'utm_source': utmSource,
        'utm_medium': utmMedium,
        'utm_campaign': utmCampaign,
        'utm_content': utmContent,
        'page_type': pageType,
        'store_url': href,
        'block': block
      });

      // Conversion event: platform-specific
      gtag('event', 'download_app_' + platform, {
        'value': 1,
        'currency': 'USD',
        'site_id': siteId,
        'utm_campaign': utmCampaign,
        'utm_content': utmContent,
        'page_type': pageType
      });
    }

    // Yandex.Metrica
    ymTrack('store_click', {
      platform: platform,
      site_id: siteId,
      block: block,
      utm_content: utmContent
    });

    // Platform-specific events for iOS/Android breakdown
    ymTrack('store_click_' + platform, { block: block, site_id: siteId });
  }

  // Track CTA block views
  function trackCtaView(ctaElement) {
    if (viewedCtas.has(ctaElement)) return;
    viewedCtas.add(ctaElement);

    var block = ctaElement.getAttribute('data-block') || 'unknown';
    var city = ctaElement.getAttribute('data-city') || '';
    var siteId = getSiteId();

    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'app_cta_view', {
        'block': block,
        'city': city,
        'site_id': siteId
      });
    }

    // Yandex.Metrica
    ymTrack('app_cta_view', { block: block, city: city, site_id: siteId });
  }

  // IntersectionObserver for CTA view tracking
  function setupCtaViewTracking() {
    var ctas = document.querySelectorAll('.app-download-cta');
    if (!ctas.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          trackCtaView(entry.target);
        }
      });
    }, { threshold: 0.5 }); // Track when 50% visible

    ctas.forEach(function(cta) {
      observer.observe(cta);
    });
  }

  // Single delegated listener (works for static + dynamic badges)
  document.addEventListener('click', function(e) {
    var badge = e.target.closest('.store-badges .badge-link, a[data-platform]');
    if (badge) {
      trackStoreClick(badge);
    }
  });

  // Initialize CTA view tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCtaViewTracking);
  } else {
    setupCtaViewTracking();
  }

  // Re-init on Astro page loads (client-side navigation)
  document.addEventListener('astro:page-load', setupCtaViewTracking);
})();
