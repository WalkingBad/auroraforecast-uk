// Aurora Forecast Service Worker
// Provides offline caching and performance optimization

const CACHE_NAME = 'aurora-forecast-v4';
const STATIC_CACHE_NAME = 'aurora-static-v4';
const DATA_CACHE_NAME = 'aurora-data-v5';

// Files to cache immediately
const STATIC_FILES = [
  '/scripts/location-selector.js',
  '/scripts/cross-link-tracker.js',
  '/scripts/aurora-sync.js',
  '/utils/analytics-helper.js',
  '/manifest.json'
];

// API endpoints to cache (only Cloud Functions - local proxies don't exist)
const API_ENDPOINTS = [
  'https://europe-west1-aurorame-621f6.cloudfunctions.net/seoSnapshot',
  'https://europe-west1-aurorame-621f6.cloudfunctions.net/allCitiesStatus'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DATA_CACHE_NAME &&
              cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (API_ENDPOINTS.some(endpoint => request.url.startsWith(endpoint))) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Handle static assets
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests with cache-first strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
    const age = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp, 10) : 0;

    if (age < 15 * 60 * 1000) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());

      const cachedClone = new Response(networkResponse.clone().body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers
      });

      cache.put(request, cachedClone);
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Aurora data unavailable offline'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  if (request.destination === 'document') {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
  }

  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try network if not in cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Failed to fetch resource
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Offline - Aurora Forecast</title>
          <style>
            body { font-family: Inter, sans-serif; text-align: center; padding: 2rem; background: #0A0A0A; color: white; }
            .offline { max-width: 400px; margin: 2rem auto; }
            h1 { color: #F59E0B; }
            button { background: #F59E0B; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>You're Offline</h1>
            <p>Aurora Forecast requires an internet connection to show live aurora data.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    throw error;
  }
}

// Handle background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'aurora-data-sync') {
    event.waitUntil(syncAuroraData());
  }
});

async function syncAuroraData() {
  
  try {
    // Get stored requests that failed while offline
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedRequests = await cache.keys();
    
    // Retry failed requests
    for (const request of cachedRequests) {
      try {
        const freshResponse = await fetch(request);
        if (freshResponse.ok) {
          await cache.put(request, freshResponse.clone());
          
          // Notify clients about updated data
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'DATA_UPDATED',
                url: request.url
              });
            });
          });
        }
      } catch (error) {
        // Background sync failed for request
      }
    }
  } catch (error) {
    // Background sync error occurred
  }
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCaches();
  }
});

async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  // All caches cleared
}
