// Location Selector Integration Script
// This script manages the connection between location selector and aurora factors

document.addEventListener('DOMContentLoaded', function() {
  const locationSelector = document.querySelector('.location-selector');
  if (!locationSelector) return;
  
  // Update location display when data is loaded
  document.addEventListener('auroraDataLoaded', function(e) {
    const { location } = e.detail;
    updateLocationDisplay(location);
  });
  
  // Listen for location changes from selector
  document.addEventListener('locationChanged', function(e) {
    const location = e.detail;
    // Location changed event
    
    // Show loading indicator
    showLocationLoading();
    
    // Update URL without reload (for SEO and user experience)
    updateURL(location);
    
    // Analytics tracking
    if (window.gtag) {
      gtag('event', 'location_change', {
        'location_name': location.name,
        'country': location.country,
        'coordinates': `${location.lat},${location.lon}`,
        'platform_type': 'web',
        'platform_source': 'website',
        'environment': 'production'
      });
    }
  });
  
  // Handle aurora data loading errors
  document.addEventListener('auroraDataError', function(e) {
    hideLocationLoading();
    console.error('Aurora data error:', e.detail.error);
  });
  
  // Handle successful data load
  document.addEventListener('auroraDataLoaded', function(e) {
    hideLocationLoading();
    
    // Update meta description for SEO
    updateMetaDescription(e.detail.location, e.detail.data);
  });
  
  function updateLocationDisplay(location) {
    const nameElement = locationSelector.querySelector('.location-name');
    const countryElement = locationSelector.querySelector('.location-country');
    
    if (nameElement) {
      nameElement.textContent = location.name;
    }
    
    if (countryElement) {
      countryElement.textContent = location.country || '';
      countryElement.style.display = location.country ? 'block' : 'none';
    }
  }
  
  function showLocationLoading() {
    const currentLocation = locationSelector.querySelector('.current-location');
    if (currentLocation) {
      currentLocation.style.opacity = '0.6';
      currentLocation.style.pointerEvents = 'none';
    }
  }
  
  function hideLocationLoading() {
    const currentLocation = locationSelector.querySelector('.current-location');
    if (currentLocation) {
      currentLocation.style.opacity = '1';
      currentLocation.style.pointerEvents = 'auto';
    }
  }
  
  function updateURL(location) {
    if (!window.history || !window.history.pushState) return;
    
    try {
      const url = new URL(window.location);
      url.searchParams.set('lat', location.lat.toFixed(4));
      url.searchParams.set('lon', location.lon.toFixed(4));
      url.searchParams.set('location', location.name);
      
      window.history.pushState(
        { location },
        `Aurora Forecast for ${location.name}`,
        url.toString()
      );
    } catch (error) {
      console.warn('Could not update URL:', error);
    }
  }
  
  function updateMetaDescription(location, data) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !data.visibility) return;
    
    const statusLabels = {
      'very_low': 'unlikely',
      'low': 'might be visible',
      'medium': 'likely visible',
      'high': 'visible'
    };
    
    const status = statusLabels[data.visibility.status] || 'unknown';
    const newDescription = `Aurora forecast for ${location.name}: ${status} (${data.visibility.probability}% chance). Live northern lights predictions with weather, Kp index, and moon phase.`;
    
    metaDesc.setAttribute('content', newDescription);
  }
  
  // Handle browser back/forward navigation
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.location) {
      // Update location selector display
      updateLocationDisplay(e.state.location);
      
      // Trigger location change (but don't update URL again)
      document.dispatchEvent(new CustomEvent('locationChanged', {
        detail: e.state.location
      }));
    }
  });
  
  // Parse URL parameters on page load
  function parseURLLocation() {
    try {
      const url = new URL(window.location);
      const lat = parseFloat(url.searchParams.get('lat'));
      const lon = parseFloat(url.searchParams.get('lon'));
      const locationName = url.searchParams.get('location');
      
      if (!isNaN(lat) && !isNaN(lon) && locationName) {
        return {
          lat,
          lon,
          name: locationName,
          country: url.searchParams.get('country') || undefined
        };
      }
    } catch (error) {
      console.warn('Could not parse URL location:', error);
    }
    
    return null;
  }
  
  // Initialize from URL if available
  const urlLocation = parseURLLocation();
  if (urlLocation) {
    // Delay to ensure aurora factors manager is ready
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('locationChanged', {
        detail: urlLocation
      }));
    }, 100);
  }
});

// Geolocation utilities
class GeolocationHelper {
  static async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15 * 60 * 1000 // 15 minutes
      };
      
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }
  
  static async reverseGeocode(lat, lon) {
    try {
      // Simple reverse geocoding using a free service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      return {
        name: data.city || data.locality || data.principalSubdivision || 'Your Location',
        country: data.countryName
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {
        name: 'Your Location'
      };
    }
  }
}

// Export for use in other scripts
window.GeolocationHelper = GeolocationHelper;