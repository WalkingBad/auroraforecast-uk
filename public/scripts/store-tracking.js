// Store button click tracking for Google Analytics + Yandex.Metrica
// Tracks: store_click (main event) + download_app_{platform} (conversion)
// Also tracks: app_cta_view (CTA block views)
(function() {
  'use strict';

  var tracked = new WeakSet();
  var viewedCtas = new WeakSet();
  var YM_ID = 105603339;

  // Helper: send to Yandex.Metrica
  function ymTrack(goal, params) {
    if (typeof ym !== 'undefined') {
      ym(YM_ID, 'reachGoal', goal, params);
    }
  }

  function trackStoreClick(element) {
    // Prevent double tracking
    if (tracked.has(element)) return;
    tracked.add(element);

    var platform = element.getAttribute('data-platform');
    var href = element.getAttribute('href');

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
        'utm_campaign': utmCampaign,
        'utm_content': utmContent,
        'page_type': pageType
      });
    }

    // Yandex.Metrica
    ymTrack('store_click', {
      platform: platform,
      block: block,
      utm_content: utmContent
    });

    // Platform-specific events for iOS/Android breakdown
    ymTrack('store_click_' + platform, { block: block });
  }

  // Track CTA block views
  function trackCtaView(ctaElement) {
    if (viewedCtas.has(ctaElement)) return;
    viewedCtas.add(ctaElement);

    var block = ctaElement.getAttribute('data-block') || 'unknown';
    var city = ctaElement.getAttribute('data-city') || '';

    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'app_cta_view', {
        'block': block,
        'city': city
      });
    }

    // Yandex.Metrica
    ymTrack('app_cta_view', { block: block, city: city });
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
