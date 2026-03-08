const CACHE_NAME = 'farmcap-core-v3';
const DYNAMIC_CACHE = 'farmcap-dynamic-images-v3';
const MAX_DYNAMIC_IMAGES = 100;
const MAX_FILE_SIZE = 20971520; // 20MB in bytes

// The bare minimum files needed to load the app structure offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. INSTALL: Save the core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('FARMCAP SW: Caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// 2. ACTIVATE: Clean up old caches if we ever update the version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
        .map(key => caches.delete(key))
      );
    })
  );
});

// 3. HELPER: Enforce the 100 Image Limit
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