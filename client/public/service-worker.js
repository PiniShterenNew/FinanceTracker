// Service Worker for My Wallet PWA
const CACHE_NAME = 'my-wallet-cache-v1';
const OFFLINE_URL = '/';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  // The following will be injected by the build process
  // CSS and JS files from the build
];

// Install event - caches assets for offline use
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // If this cache is not present in the whitelist, delete it
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests differently (don't cache)
  if (event.request.url.includes('/api/')) {
    // For API requests, try network first, then fall back to offline page
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For non-API requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Don't cache auth responses or errors
                if (!event.request.url.includes('/auth/') && response.status === 200) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // If the network is unavailable, serve the offline page
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Sync event - handle background syncing
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Helper function to sync transactions
async function syncTransactions() {
  // This would sync any pending transactions when online
  // In a real implementation, we'd pull from IndexedDB and send to server
  const pendingRequests = await getPendingRequests();
  
  for (const request of pendingRequests) {
    try {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      // If successful, remove from pending
      await removePendingRequest(request.id);
    } catch (error) {
      console.error('Failed to sync transaction:', error);
      // Keep in pending for next sync attempt
    }
  }
}

// These would normally be implemented with IndexedDB
// Placeholder functions for demonstration
async function getPendingRequests() {
  return [];
}

async function removePendingRequest(id) {
  // Remove pending request with given id
}
