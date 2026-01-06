/**
 * City Page Runtime Scripts
 * Handles Sky Darkness Timer, Premium Section Toggle, and Sticky Footer Logic
 */

// ============================================================================
// Sky Darkness Timer - matches mobile app implementation
// ============================================================================

function calculateSunPosition(date, lat, lon) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Julian day calculation
  const a = Math.floor((14 - date.getUTCMonth() - 1) / 12);
  const y = date.getUTCFullYear() - a;
  const m = date.getUTCMonth() + 1 + 12 * a - 3;
  const jd = date.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const jd2000 = jd - 2451545.0 + (date.getUTCHours() - 12) / 24;

  // Solar calculations
  const L = (280.460 + 0.9856474 * jd2000) % 360;
  const g = (357.528 + 0.9856003 * jd2000) * rad;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;

  // Declination and hour angle
  const sinDelta = Math.sin(lambda) * Math.sin(23.439 * rad);
  const cosDelta = Math.sqrt(1 - sinDelta * sinDelta);
  const delta = Math.asin(sinDelta);

  const gmst = (280.16 + 360.9856235 * jd2000) % 360;
  const lmst = (gmst + lon) % 360;
  const H = (lmst * rad) - (L * rad);

  // Sun altitude
  const sinAlt = Math.sin(lat * rad) * sinDelta + Math.cos(lat * rad) * cosDelta * Math.cos(H);
  return Math.asin(sinAlt) * deg;
}

function findTimeUntilDarkness(lat, lon) {
  const now = new Date();
  const ASTRONOMICAL_TWILIGHT = -18; // degrees

  // Check current altitude
  const currentAlt = calculateSunPosition(now, lat, lon);
  if (currentAlt <= ASTRONOMICAL_TWILIGHT) {
    return null; // Already dark enough
  }

  // Search for next astronomical darkness within 24 hours
  for (let minutes = 1; minutes <= 24 * 60; minutes++) {
    const testTime = new Date(now.getTime() + minutes * 60000);
    const altitude = calculateSunPosition(testTime, lat, lon);

    if (altitude <= ASTRONOMICAL_TWILIGHT) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
      if (hours > 0) return `${hours}h`;
      return `${mins}m`;
    }
  }

  return null; // No darkness in next 24h (polar day)
}

function updateDarknessTimer() {
  const timer = document.getElementById('darkness-timer');
  if (!timer) return;

  const lat = parseFloat(timer.dataset.lat);
  const lon = parseFloat(timer.dataset.lon);

  if (isNaN(lat) || isNaN(lon)) return;

  const timeUntil = findTimeUntilDarkness(lat, lon);

  if (timeUntil) {
    timer.textContent = `${timeUntil} until optimal darkness`;
    timer.style.display = 'block';
  } else {
    timer.style.display = 'none';
  }
}

// ============================================================================
// Premium Section Toggle Logic
// ============================================================================

/**
 * Check if user has premium access via JWT cookie
 * Note: JWT is HttpOnly in production, so we can't read its value directly.
 * Instead, we call the premiumStatus API endpoint which validates the cookie server-side.
 * For client-side display toggle, we use a non-HttpOnly flag cookie set by the success page.
 */
async function checkPremiumAccess() {
  // First, check for the client-side flag cookie (set by success page)
  const cookies = document.cookie.split(';').map(c => c.trim());
  const flagCookie = cookies.find(c => c.startsWith('aurora_premium_flag='));
  if (flagCookie) {
    const value = flagCookie.split('=')[1];
    if (value === 'active') return true;
  }

  // Fallback: call API to check premium status (validates HttpOnly JWT cookie)
  try {
    const apiBase = window.AURORA_API_BASE || 'https://europe-west1-aurorame-621f6.cloudfunctions.net';
    const response = await fetch(`${apiBase}/premiumStatus`, {
      method: 'GET',
      credentials: 'include', // Send cookies
    });
    if (response.ok) {
      const data = await response.json();
      return data.premium === true;
    }
  } catch (e) {
    console.warn('Premium status check failed:', e);
  }

  return false;
}

async function togglePremiumSection() {
  const previewContainer = document.getElementById('forecast-preview-container');
  const forecastContainer = document.getElementById('premium-forecast-container');

  if (!previewContainer || !forecastContainer) {
    return;
  }

  const hasPremium = await checkPremiumAccess();

  if (hasPremium) {
    // User has premium access - show full forecast, hide preview (which contains paywall)
    previewContainer.style.display = 'none';
    forecastContainer.style.display = 'block';
  } else {
    // User doesn't have premium - show preview (with paywall), hide full forecast
    previewContainer.style.display = 'block';
    forecastContainer.style.display = 'none';

    // Show the integrated paywall inside ForecastPreview
    const integratedPaywall = previewContainer.querySelector('.integrated-paywall');
    if (integratedPaywall) {
      integratedPaywall.style.display = 'block';
    }
  }
}

// ============================================================================
// Sticky Footer Visibility Logic
// ============================================================================

function initStickyFooter() {
  const stickyFooter = document.querySelector('.store-badges.sticky');
  if (!stickyFooter) return;

  // Track visibility state for all observed elements
  const visibilityState = new Map();

  function updateFooterVisibility() {
    const anyVisible = Array.from(visibilityState.values()).some(v => v);
    if (anyVisible) {
      stickyFooter.style.opacity = '0';
      stickyFooter.style.pointerEvents = 'none';
    } else {
      stickyFooter.style.opacity = '1';
      stickyFooter.style.pointerEvents = 'auto';
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      visibilityState.set(entry.target, entry.isIntersecting);
    });
    updateFooterVisibility();
  }, { threshold: 0.1 });

  // Observe enhanced-mobile-cta (legacy)
  const enhancedCta = document.querySelector('.enhanced-mobile-cta');
  if (enhancedCta) {
    visibilityState.set(enhancedCta, false);
    observer.observe(enhancedCta);
  }

  // Observe all app-download-cta blocks (A/B test)
  const appCtaBlocks = document.querySelectorAll('.app-download-cta');
  appCtaBlocks.forEach(cta => {
    visibilityState.set(cta, false);
    observer.observe(cta);
  });
}

// ============================================================================
// Initialize All Features on DOMContentLoaded
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize Sky Darkness Timer
  updateDarknessTimer();
  setInterval(updateDarknessTimer, 30000); // Update every 30s like mobile

  // Initialize Premium Section (async)
  await togglePremiumSection();

  // Initialize Sticky Footer
  initStickyFooter();
});

// Listen for storage changes (when JWT is set from another tab/window)
window.addEventListener('storage', () => togglePremiumSection());

// Re-check premium status when page becomes visible (user returns from checkout)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    togglePremiumSection();
  }
});
