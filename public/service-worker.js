const CACHE_NAME = 'farmcap-core-v4'; // Upgraded to v4 to force a fresh install!
const DYNAMIC_CACHE = 'farmcap-dynamic-images-v4';
const MAX_DYNAMIC_IMAGES = 100;
const MAX_FILE_SIZE = 20971520; // 20MB in bytes

// The bare minimum files needed to load the app structure offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. INSTALL: Save the core assets and wake up immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // NEW: Forces the phone to use the new worker instantly!
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('FARMCAP SW: Caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// 2. ACTIVATE: Clean up old caches and take control of the screen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
        .map(key => caches.delete(key)) // Destroys the old, broken files
      );
    }).then(() => self.clients.claim()) // NEW: Takes control of the browser immediately
  );
});

// 3. HELPER: Enforce the 100 Image Limit (Brilliant logic, kept exactly as is!)
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        // Delete the oldest item and check again
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
};

// 4. FETCH: The Smart Interceptor
self.addEventListener('fetch', (event) => {
  // Only intercept normal GET requests
  if (event.request.method !== 'GET') return;

  // NEW: RULE A - If it's an HTML page (navigation), always ask Vercel first! (Fixes the blank screen)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return; // Stop here, don't run the image logic below for HTML
  }

  // RULE B: Your exact original Cache-First logic for everything else (Images, CSS, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      // If we already have it saved on the phone, return it instantly!
      if (cachedRes) {
        return cachedRes;
      }

      // If not, fetch it from the internet
      return fetch(event.request).then((fetchRes) => {
        // We only want to cache successful responses
        if (!fetchRes || fetchRes.status !== 200 || (fetchRes.type !== 'basic' && fetchRes.type !== 'cors')) {
          return fetchRes;
        }

        // Check if the response is an image
        const contentType = fetchRes.headers.get('content-type');
        if (contentType && contentType.includes('image')) {
          
          // Check if it is under the 200MB limit
          const contentLength = fetchRes.headers.get('content-length');
          if (contentLength && parseInt(contentLength, 10) < MAX_FILE_SIZE) {
            
            // Clone it, save it to the dynamic cache, and enforce the limit
            const resClone = fetchRes.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, resClone);
              limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_IMAGES);
            });
          }
        }

        return fetchRes;
      }).catch(() => {
        // If internet is completely down and it's not cached, it fails gracefully
        console.log('FARMCAP: Offline and asset not found in cache.');
      });
    })
  );
});