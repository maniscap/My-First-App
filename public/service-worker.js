// ============================================================================
// FARMCAP PROGRESSIVE WEB APP (PWA) - SERVICE WORKER
// ============================================================================

// VERSION CONTROL: Increment these versions to force a complete cache reset.
// This is the "Master Reset Switch" for the application.
const CACHE_VERSION = 11;
const CACHE_NAME = `farmcap-core-v${CACHE_VERSION}`; 
const DYNAMIC_CACHE = `farmcap-dynamic-images-v${CACHE_VERSION}`;

// CONFIGURATION LIMITS
const MAX_DYNAMIC_IMAGES = 100; // Prevent the phone's storage from filling up
const MAX_FILE_SIZE = 20971520; // 20MB limit in bytes

// CORE ASSETS: The bare minimum files needed to load the app structure offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ============================================================================
// 1. INSTALL EVENT: The Initial Setup
// ============================================================================
self.addEventListener('install', (event) => {
  // self.skipWaiting() forces the new service worker to take over immediately.
  // This instantly applies updates without requiring the user to close all tabs.
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[FarmCap SW] Caching core assets for version ${CACHE_VERSION}`);
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// ============================================================================
// 2. ACTIVATE EVENT: The Garbage Collector
// ============================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Delete any cache that doesn't match our CURRENT version names
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map(key => {
              console.log(`[FarmCap SW] Deleting obsolete cache: ${key}`);
              return caches.delete(key);
            })
      );
    }).then(() => {
      // self.clients.claim() tells the active service worker to take control of 
      // all open client pages immediately, preventing ghost files.
      return self.clients.claim();
    })
  );
});

// ============================================================================
// 3. HELPER FUNCTION: Cache Size Management
// ============================================================================
// Recursively deletes the oldest items in a specific cache until it is under the limit.
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        // Delete the oldest item (index 0) and check again
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
};

// ============================================================================
// 4. FETCH EVENT: The Smart Interceptor (Traffic Cop)
// ============================================================================
self.addEventListener('fetch', (event) => {
  // Only intercept normal GET requests. Ignore POST, PUT, DELETE, etc.
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ------------------------------------------------------------------------
  // BYPASS RULE: Ignore Vite Dev Server, Manifest, APIs, and Extensions
  // ------------------------------------------------------------------------
  if (
    url.pathname.includes('manifest.json') ||
    url.pathname.includes('/api/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.protocol === 'chrome-extension:' ||
    url.hostname.includes('gnews.io') ||
    url.hostname.includes('newsdata.io') ||
    url.hostname.includes('newsapi.org') ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('pexels.com') ||
    url.hostname.includes('wallpaperaccess.com') ||
    url.hostname.includes('openstreetmap.org') || // Block GPS map tiles from caching!
    url.hostname.includes('radio-browser.info') || // Block Radio API station images
    url.hostname.includes('shoutcast.com')
  ) {
    return; // Let the browser handle these natively
  }

  // ------------------------------------------------------------------------
  // RULE A: HTML / NAVIGATION LOGIC -> NETWORK FIRST
  // ------------------------------------------------------------------------
  // This completely prevents the "Blank Screen" SPA routing crash.
  // We always ask Vercel for the freshest index.html first.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If the network completely fails (offline), serve the cached fallback
        console.log('[FarmCap SW] Offline! Serving cached index.html fallback.');
        return caches.match('/index.html');
      })
    );
    return; // Halt execution. Do not let HTML fall into the image logic.
  }

  // ------------------------------------------------------------------------
  // RULE B: IMAGE LOGIC -> CACHE FIRST (With CORS/Opaque Support)
  // ------------------------------------------------------------------------
  // Look at the destination, or check the URL string for image extensions
  const isImage = event.request.destination === 'image' || 
                  event.request.url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);
  
  if (isImage) {
    event.respondWith(
      caches.match(event.request).then((cachedRes) => {
        // 1. If we already have the image saved on the phone, return it instantly!
        if (cachedRes) {
          return cachedRes; 
        }

        // 2. If it is NOT in the cache, go fetch it from the internet.
        return fetch(event.request).then((fetchRes) => {
          // SECURITY CHECK: We only want to cache valid responses.
          // fetchRes.type === 'opaque' is CRITICAL for caching external URLs 
          // (like Cloudinary or Unsplash) that hide their CORS headers.
          const isValidLocal = fetchRes.status === 200;
          const isValidExternal = fetchRes.type === 'opaque';
          
          if (!fetchRes || (!isValidLocal && !isValidExternal)) {
            return fetchRes; // Return whatever we got, but don't cache it.
          }

          // Clone the image, save it to the dynamic cache vault, and enforce the limit.
          const resClone = fetchRes.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, resClone);
            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_IMAGES);
          });

          // Return the original image to the browser so the user can see it.
          return fetchRes;
        });
      })
    );
    return; // Halt execution.
  }

  // ------------------------------------------------------------------------
  // RULE C: EVERYTHING ELSE (API Calls, Scripts) -> PASS THROUGH
  // ------------------------------------------------------------------------
  // By simply returning, we force the browser to handle the request natively.
  return;
});
// ============================================================================
// END OF SERVICE WORKER
// ============================================================================