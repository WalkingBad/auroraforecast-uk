/**
 * Aurora Status Sync - Unified Script
 *
 * Smart hydration script that:
 * - On city pages: loads detailed seoSnapshot data (5KB, 1 city)
 * - On other pages: loads city-statuses data (100KB, all cities)
 *
 * This ensures optimal performance and bandwidth usage.
 */

(() => {
  const CACHE_KEY = 'aurorame_city_statuses_v2'; // v2: 6-hour forecast (was 3-hour)
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  // 🔥 FIX (2025-11-30): Use direct Cloud Function URL to avoid fetching stale static build artifacts
  const STATUS_ENDPOINT = 'https://europe-west1-aurorame-621f6.cloudfunctions.net/allCitiesStatus';
  const LOG_PREFIX = '[AuroraMe][AuroraSync]';
  const OVERCAST_THRESHOLD = 85;

  // Country flags mapping
  const COUNTRY_FLAGS = {
    'Norway': '🇳🇴',
    'USA': '🇺🇸',
    'Canada': '🇨🇦',
    'Russia': '🇷🇺',
    'Iceland': '🇮🇸',
    'Sweden': '🇸🇪',
    'Finland': '🇫🇮',
    'Greenland': '🇬🇱',
    'Alaska': '🇺🇸',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'UK': '🇬🇧',
    'Denmark': '🇩🇰',
    'Faroe Islands': '🇫🇴'
  };

  const log = (...args) => {
    if (typeof console !== 'undefined') {
      console.log(LOG_PREFIX, ...args);
    }
  };

  const warn = (...args) => {
    if (typeof console !== 'undefined') {
      console.warn(LOG_PREFIX, ...args);
    }
  };

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const formatCityWithPrefix = (city) => {
    const flag = COUNTRY_FLAGS[city.country] || '🌍';
    const countryName = city.state ? `${city.country}, ${city.state}` : city.country;
    const cityName = escapeHtml(city.name);
    const escapedCountry = escapeHtml(countryName);
    return `${flag} ${escapedCountry} · ${cityName}`;
  };

  const getCachedStatuses = () => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (!data || typeof timestamp !== 'number') {
        window.localStorage.removeItem(CACHE_KEY);
        return null;
      }

      const age = Date.now() - timestamp;
      if (age > CACHE_TTL_MS) {
        window.localStorage.removeItem(CACHE_KEY);
        return null;
      }

      log(`Using cached statuses (${Math.round(age / 1000)}s old)`);
      return data;
    } catch (error) {
      warn('Failed to read cache', error);
      return null;
    }
  };

  const setCachedStatuses = (data) => {
    try {
      window.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      warn('Failed to write cache', error);
    }
  };

  const sanitizeStatusClass = (element, prefix) => {
    if (!element?.classList) return;
    Array.from(element.classList)
      .filter((cls) => cls.startsWith(prefix))
      .forEach((cls) => element.classList.remove(cls));
  };

  // ============================================================================
  // City Status Card Update (for all pages)
  // ============================================================================

  const updateMainCityStatus = (response) => {
    const statuses = response.cities || response;

    const card = document.querySelector('[data-city-status-card]');
    if (!card) return;

    const slug = card.getAttribute('data-city-status-card');
    if (!slug) return;

    const status = statuses[slug];
    if (!status) return;

    const color = status.color || '#34C97B';

    sanitizeStatusClass(card, 'level-');
    card.classList.add(`level-${status.status}`);
    card.setAttribute('data-status-level', status.status);
    card.style.setProperty('--status-color', color);

    const titleEl = card.querySelector('.status-title-large');
    if (titleEl) {
      const isLocalizedPage = document.documentElement.lang && document.documentElement.lang !== 'en';
      if (!isLocalizedPage) {
        titleEl.textContent = status.statusText;
      }
      titleEl.style.color = color;
    }

    const headerEl = card.querySelector('.status-header');
    if (headerEl) {
      headerEl.style.setProperty('--status-color', color);
    }
  };

  // ============================================================================
  // City Cards Update (for country/homepage/tracker)
  // ============================================================================

  const updateCityCards = (response) => {
    const statuses = response.cities || response;
    let updatedCount = 0;

    document.querySelectorAll('[data-city-slug]').forEach((card) => {
      const slug = card.getAttribute('data-city-slug');
      if (!slug) return;

      const status = statuses[slug];
      if (!status) return;

      sanitizeStatusClass(card, 'status-');
      card.classList.add(`status-${status.status}`);

      const label = card.querySelector('[data-status-label]');
      if (label) {
        label.textContent = status.statusText;
      }

      updatedCount += 1;
    });

    return updatedCount;
  };

  const calculateGlobalKp = (statuses) => {
    const statusCounts = { high: 0, medium: 0, low: 0 };
    let totalCities = 0;

    for (const city of Object.values(statuses)) {
      if (city.status !== 'unknown') {
        statusCounts[city.status] = (statusCounts[city.status] || 0) + 1;
        totalCities++;
      }
    }

    if (totalCities === 0) return 2.0;

    const highPercentage = statusCounts.high / totalCities;
    const mediumPercentage = statusCounts.medium / totalCities;

    if (highPercentage >= 0.3) return 6.0;
    if (highPercentage >= 0.15) return 5.0;
    if (highPercentage >= 0.05 || mediumPercentage >= 0.3) return 4.0;
    if (mediumPercentage >= 0.15) return 3.5;
    if (mediumPercentage >= 0.05) return 3.0;
    return 2.0;
  };

  const getKpColor = (kp) => {
    if (kp >= 6) return 'var(--aurora-status-high)';
    if (kp >= 4) return 'var(--aurora-status-medium)';
    if (kp >= 2) return 'var(--aurora-status-low)';
    return 'var(--aurora-text-tertiary)';
  };

  const normalizeSearchText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ø/g, 'o')
      .replace(/ö/g, 'o')
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/æ/g, 'ae')
      .replace(/ü/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ç/g, 'c')
      .replace(/ß/g, 'ss')
      .replace(/þ/g, 'th')
      .replace(/ð/g, 'd');
  };

  const sortCitiesByStatus = (cities) => {
    const statusPriority = {
      'high': 3,
      'medium': 2,
      'low': 1,
      'very_low': 0,
      'unknown': 0
    };

    return cities.sort((a, b) => {
      const priorityDiff = (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.magneticLat - a.magneticLat;
    });
  };

  const updateLiveForecastBar = (response) => {
    const cityMetadata = window.AURORA_CITY_METADATA || [];
    if (cityMetadata.length === 0) {
      warn('AURORA_CITY_METADATA not available, skipping LiveForecastBar update');
      return;
    }

    const statuses = response.cities || response;

    // Build prepared cities for search and live bar
    const preparedCities = Object.keys(statuses)
      .map(slug => {
        const cityMeta = cityMetadata.find(c => c.slug === slug);
        if (!cityMeta) return null;

        const status = statuses[slug];
        return {
          name: cityMeta.name,
          slug: slug,
          country: cityMeta.country,
          state: cityMeta.state,
          magneticLat: cityMeta.magneticLat,
          status: status.status,
          statusText: status.statusText,
          color: status.color,
          url: `/${slug}`
        };
      })
      .filter(city => city !== null);

    // Build and set search index FIRST (needed for all pages with search)
    const searchIndex = preparedCities.map(city => ({
      name: city.name,
      slug: city.slug,
      country: city.country,
      state: city.state,
      url: city.url,
      status: city.status,
      color: city.color,
      searchText: normalizeSearchText(`${city.name} ${city.country} ${city.state || ''}`)
    }));

    window.AURORA_SEARCH_INDEX = searchIndex;
    log(`Search index set with ${searchIndex.length} cities`);

    // Legacy support for LiveForecastBar
    if (typeof window.setAuroraSearchIndex === 'function') {
      window.setAuroraSearchIndex(searchIndex);
    }

    // Check for LiveForecastBar UI elements - return early if not present
    const kpValueEl = document.getElementById('global-kp-value');
    const topCitiesListEl = document.getElementById('top-cities-list');

    if (!kpValueEl || !topCitiesListEl) {
      return;
    }

    // Use real global Kp from API (planetary index, same for entire Earth)
    const globalKp = response.global?.kp ?? calculateGlobalKp(statuses);
    kpValueEl.textContent = typeof globalKp === 'number' ? globalKp.toFixed(1) : globalKp;
    kpValueEl.style.color = getKpColor(globalKp);

    // Update top cities
    const goodVisibilityCities = preparedCities.filter(
      city => ['high', 'medium', 'low'].includes(city.status)
    );

    const sortedCities = sortCitiesByStatus(goodVisibilityCities);
    const topCities = sortedCities.slice(0, 8);

    if (topCities.length > 0) {
      topCitiesListEl.innerHTML = topCities
        .map(city => `
          <a
            href="${escapeHtml(city.url)}"
            class="city-chip status-${city.status}"
            data-city-slug="${escapeHtml(city.slug)}"
          >
            <span class="city-name">${formatCityWithPrefix(city)}</span>
            <span class="city-status" data-status-label>${escapeHtml(city.statusText)}</span>
          </a>
        `)
        .join('');
    } else {
      topCitiesListEl.innerHTML = `
        <div class="no-good-visibility">
          <p>No high visibility locations at the moment. Check back later!</p>
        </div>
      `;
    }

    log(`Updated LiveForecastBar: Kp ${globalKp.toFixed(1)}, ${topCities.length} top cities`);
  };

  const applyAllCityStatuses = (statuses, source) => {
    if (!statuses || typeof statuses !== 'object') return;

    updateMainCityStatus(statuses);
    const count = updateCityCards(statuses);
    updateLiveForecastBar(statuses);

    if (count > 0) {
      log(`Updated ${count} city cards from ${source}`);
    }
  };

  // ============================================================================
  // City Page Detailed Update (seoSnapshot)
  // ============================================================================

  const buildSeoSnapshotUrl = (lat, lon) => {
    const timestamp = Date.now();
    // Use Cloud Functions directly (regional sites don't have /seoSnapshot endpoint)
    return [`https://europe-west1-aurorame-621f6.cloudfunctions.net/seoSnapshot?lat=${lat}&lon=${lon}&_t=${timestamp}`];
  };

  const fetchCityDetails = async (lat, lon) => {
    const urls = buildSeoSnapshotUrl(lat, lon);

    for (const url of urls) {
      try {
        log(`Fetching city details from ${url}...`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AuroraMe-Web/1.0'
          }
        });

        if (!response.ok) {
          warn(`Failed: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        log('Successfully fetched city details');
        return data;
      } catch (error) {
        warn(`Error fetching from ${url}:`, error);
      }
    }

    throw new Error('All seoSnapshot endpoints failed');
  };

  const updateStatusCardDetailed = (data) => {
    const card = document.querySelector('[data-city-status-card]');
    if (!card) return;

    const statusLevel = data.currentStatus?.level || 'very_low';
    const statusColor = data.ui?.statusColors?.[statusLevel] || '#FF4747';
    const statusText = data.ui?.statusTexts?.[statusLevel] || 'Unlikely';
    const probability = data.currentStatus?.probability ?? 0;

    card.className = card.className.replace(/level-\w+/, `level-${statusLevel}`);
    card.style.setProperty('--status-color', statusColor);

    const titleEl = card.querySelector('.status-title-large');
    if (titleEl) {
      titleEl.textContent = statusText;
      titleEl.style.color = statusColor;
    }

    // Update or hide probability (Chance X%)
    const chanceEl = card.querySelector('.status-chance');
    if (chanceEl) {
      if (statusLevel === 'very_low' || statusLevel === 'none' || probability === 0) {
        chanceEl.style.display = 'none';
      } else {
        chanceEl.style.display = '';
        chanceEl.textContent = `Chance ${Math.round(probability)}%`;
        chanceEl.style.color = statusColor;
      }
    }

    // Hide visibility text for very_low/none status
    const visibilityEl = card.querySelector('.status-sub');
    if (visibilityEl) {
      if (statusLevel === 'very_low' || statusLevel === 'none') {
        visibilityEl.style.display = 'none';
      } else {
        visibilityEl.style.display = '';
      }
    }

    log(`Updated status card: ${statusLevel} (${statusText}), probability: ${probability}%`);
  };

  const updateWarningBanners = (data) => {
    const card = document.querySelector('[data-city-status-card]');
    if (!card) return;

    const skyDarkness = data.conditions?.skyDarkness;
    const cloudCover = data.conditions?.cloudCover || 0;

    // Remove existing warning pills
    const existingWarnings = card.querySelectorAll('.status-pill');
    existingWarnings.forEach(pill => pill.remove());

    const statusHeader = card.querySelector('.status-header');
    if (!statusHeader) return;

    // Add daylight warning
    if (skyDarkness === 'daylight' || skyDarkness === 'civil') {
      const warningPill = document.createElement('div');
      warningPill.className = 'status-pill warning';
      warningPill.textContent = '☀️ Aurora not visible during daylight';
      statusHeader.insertAdjacentElement('afterend', warningPill);
      log('Added daylight warning banner');
    }
    // Add overcast warning (only when NOT daylight/civil)
    else if (skyDarkness !== 'daylight' && skyDarkness !== 'civil' && cloudCover >= OVERCAST_THRESHOLD) {
      const warningPill = document.createElement('div');
      warningPill.className = 'status-pill overcast';
      warningPill.textContent = '☁️ Overcast conditions may block aurora visibility';
      statusHeader.insertAdjacentElement('afterend', warningPill);
      log('Added overcast warning banner');
    }
  };

  const updateFactors = (data) => {
    const conditions = data.conditions || {};

    // Update Kp value
    const kpFactor = document.querySelector('[data-factor="kp"] .factor-value-main .value');
    if (kpFactor && conditions.kpIndex != null) {
      kpFactor.textContent = conditions.kpIndex.toFixed(1).replace(/\.0$/, '');
      log(`Updated Kp: ${conditions.kpIndex}`);
    }

    // Update Weather (cloud cover) - removed percentage display
    // Cloud cover values are shown in the factor card but text removed per previous fix

    // Update Moon illumination
    const moonFactor = document.querySelector('[data-factor="moon"] .factor-value-main .value');
    if (moonFactor && conditions.moonIllumination != null) {
      moonFactor.textContent = `${Math.round(conditions.moonIllumination)}%`;
      log(`Updated moon: ${conditions.moonIllumination}%`);
    }

    // Update Darkness
    const darknessFactor = document.querySelector('[data-factor="darkness"] .factor-value-main');
    if (darknessFactor && conditions.skyDarkness) {
      const darknessLabels = {
        'night': 'Night',
        'astronomical': 'Astronomical Twilight',
        'nautical': 'Nautical Twilight',
        'civil': 'Civil Twilight',
        'daylight': 'Daylight'
      };
      const label = darknessLabels[conditions.skyDarkness] || conditions.skyDarkness;

      // Keep the timer element, only update the label
      const timerEl = darknessFactor.querySelector('#darkness-timer');
      darknessFactor.innerHTML = '';
      darknessFactor.textContent = label;
      darknessFactor.className = 'factor-value-main';

      // Add danger class for daylight
      if (conditions.skyDarkness === 'daylight' || conditions.skyDarkness === 'civil') {
        darknessFactor.classList.add('danger');
      }

      // Re-append timer element
      if (timerEl) {
        darknessFactor.appendChild(timerEl);
      }

      log(`Updated darkness: ${label}`);
    }
  };

  const applyCityDetails = async (lat, lon) => {
    try {
      const data = await fetchCityDetails(lat, lon);

      updateStatusCardDetailed(data);
      updateWarningBanners(data);
      updateFactors(data);
      updateForecastPreview(data);

      log('✅ City details update complete');
    } catch (error) {
      warn('Failed to fetch city details:', error);
    }
  };

  const updateForecastPreview = (data) => {
    const container = document.querySelector('.forecast-preview-container');
    if (!container || !data.h12 || !Array.isArray(data.h12)) return;

    const grid = container.querySelector('.hours-grid');
    if (!grid) return;

    // Show content, hide error (for SSR fallback case)
    const previewError = container.querySelector('#preview-error');
    const previewContent = container.querySelector('#preview-content');
    if (previewError) previewError.classList.add('hidden');
    if (previewContent) previewContent.classList.remove('hidden');

    // Keep only the column headers
    const headers = grid.querySelector('.column-headers');
    grid.innerHTML = '';
    if (headers) grid.appendChild(headers);

    const timezone = container.getAttribute('data-timezone') || 'UTC';

    // Check premium status (JWT cookie or flag cookie)
    const cookies = document.cookie.split(';').map(c => c.trim());
    const isPremium = cookies.some(c => c.startsWith('aurora_premium=') || c.startsWith('aurora_premium_flag='));

    // Free: expand 2 entries (6h) into 6 hourly cards
    // Premium: show all 24 entries (72h) as-is
    let forecast;
    if (isPremium) {
      forecast = data.h12.slice(0, 24);
    } else {
      // Take first 2 entries and expand each into 3 hourly cards
      const sourceEntries = data.h12.slice(0, 2);
      forecast = [];
      sourceEntries.forEach(entry => {
        const baseTime = new Date(entry.time);
        for (let h = 0; h < 3; h++) {
          const hourTime = new Date(baseTime.getTime() + h * 60 * 60 * 1000);
          forecast.push({
            ...entry,
            time: hourTime.toISOString(),
            displayTime24: hourTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: timezone
            })
          });
        }
      });
    }
    let lastDayLabel = null;

    // Helper to get day label (Today, Tomorrow, etc.)
    const getDayLabel = (dateStr) => {
      try {
        const date = new Date(dateStr);
        const now = new Date();
        const options = { timeZone: timezone };

        // Create dates in target timezone to compare days correctly
        const targetDateStr = date.toLocaleDateString('en-US', options);
        const todayStr = now.toLocaleDateString('en-US', options);

        const targetDate = new Date(targetDateStr);
        const todayDate = new Date(todayStr);

        const diffTime = targetDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const dateFormatted = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (diffDays === 0) return `${dateFormatted}, Today`;
        if (diffDays === 1) return `${dateFormatted}, Tomorrow`;

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${dateFormatted}, ${weekdays[date.getDay()]}`;
      } catch (e) {
        return 'Today';
      }
    };

    // Helper for status text
    const getStatusText = (status) => {
      return data.ui?.statusTexts?.[status] || status;
    };

    // Helper for status class
    const getStatusClass = (status) => {
      switch (status) {
        case 'high': case 'good': return 'status-high';
        case 'medium': return 'status-medium';
        case 'low': return 'status-low';
        case 'very_low': case 'none': return 'status-very_low';
        default: return 'status-very_low';
      }
    };

    // Find best hour index
    let bestHourIdx = -1;
    let bestScore = -Infinity;
    forecast.forEach((hour, idx) => {
      if (hour.status !== 'high' && hour.status !== 'good') return;
      let score = hour.kp;
      if (hour.status === 'high') score += 5;
      if (score > bestScore) {
        bestScore = score;
        bestHourIdx = idx;
      }
    });

    forecast.forEach((hour, idx) => {
      const currentDayLabel = getDayLabel(hour.time);
      const showDayHeader = currentDayLabel !== lastDayLabel;
      lastDayLabel = currentDayLabel;
      const isBestHour = idx === bestHourIdx;
      const statusClass = getStatusClass(hour.status);

      if (showDayHeader) {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
          <span class="calendar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <span>${currentDayLabel}</span>
        `;
        grid.appendChild(dayHeader);
      }

      const card = document.createElement('div');
      card.className = `hour-card visible`;
      card.setAttribute('data-status', hour.status);
      if (isBestHour) card.setAttribute('data-best-hour', 'true');

      let bestBadgeHtml = '';
      if (isBestHour) {
        bestBadgeHtml = `
          <div class="best-time-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Best time
          </div>
        `;
      }

      // Use displayTime24 from API if available, else format locally
      const timeLabel = hour.displayTime24 || new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone });

      card.innerHTML = `
        ${bestBadgeHtml}
        <div class="hour-card-time">${timeLabel}</div>
        <div class="hour-card-kp-large">${hour.kp.toFixed(1)}</div>
        <div class="hour-card-status ${statusClass}">${getStatusText(hour.status)}</div>
      `;

      grid.appendChild(card);
    });

    log(`Updated forecast preview with ${forecast.length} entries (${forecast.length * 3}h, ${isPremium ? 'premium' : 'free'})`);
  };

  // ============================================================================
  // All Cities Status (city-statuses)
  // ============================================================================

  const fetchAllCityStatuses = async () => {
    log(`Fetching all city statuses from ${STATUS_ENDPOINT}...`);

    const response = await fetch(STATUS_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const text = await response.text();
    const data = JSON.parse(text);
    return data;
  };

  const loadAllCityStatuses = async (forceRefresh) => {
    if (!forceRefresh) {
      const cached = getCachedStatuses();
      if (cached) {
        applyAllCityStatuses(cached, 'cache');
        return;
      }
    }

    try {
      const statuses = await fetchAllCityStatuses();
      setCachedStatuses(statuses);
      applyAllCityStatuses(statuses, 'API');
    } catch (error) {
      warn('Failed to load city statuses', error);
    }
  };

  // ============================================================================
  // Main Init - Smart Page Detection
  // ============================================================================

  const init = async () => {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const params = new URLSearchParams(window.location.search);
    const forceRefresh = params.has('refresh');

    // Detect page type
    const statusCard = document.querySelector('[data-city-status-card]');
    const hasLiveBar = !!document.getElementById('global-kp-value');
    const hasCityCards = !!document.querySelector('[data-city-slug]');

    // 🔧 FIX (2025-12-01): Use darkness-timer as definitive city page marker
    // Previously used !hasCityCards which broke when "Other cities in {Country}" section was added
    const darknessTimer = document.getElementById('darkness-timer');
    const forecastContainer = document.querySelector('.forecast-preview-container');
    const isCityPage = statusCard && darknessTimer && forecastContainer;

    // City page: load detailed seoSnapshot data AND city statuses for search
    if (isCityPage) {
      // Get coordinates from forecast container (darkness-timer doesn't have them)
      const lat = parseFloat(forecastContainer.dataset.lat);
      const lon = parseFloat(forecastContainer.dataset.lon);

      if (isNaN(lat) || isNaN(lon)) {
        warn('Invalid coordinates', { lat, lon });
        return;
      }

      log(`City page detected: loading detailed data for ${lat}, ${lon}`);

      // Load city statuses first for search functionality
      await loadAllCityStatuses(forceRefresh);

      // Then load detailed seoSnapshot data
      setTimeout(() => applyCityDetails(lat, lon), 500);
    }
    // Other pages: load all city statuses
    else if (hasLiveBar || hasCityCards || statusCard) {
      log('Homepage/Country/Tracker page detected: loading all city statuses');
      await loadAllCityStatuses(forceRefresh);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
