const CACHE_VERSION = 'v1';
const CACHE_NAME = 'techstore-' + CACHE_VERSION;
const DATA_CACHE = 'techstore-data-' + CACHE_VERSION;
const IMAGE_CACHE = 'techstore-images-' + CACHE_VERSION;

const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
        .catch(err => console.log('Cache open failed:', err))
    ]).then(() => self.skipWaiting())
  );
});

// Activate Service Worker - Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first for some, cache first for others
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests for now, allow font and cdn
  if (!url.origin.includes(self.location.origin) && 
      !url.hostname.includes('cdnjs') && 
      !url.hostname.includes('googleapis')) {
    return;
  }

  // Network first strategy for HTML, JS, CSS
  if (request.method === 'GET' && (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return caches.match(request);
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache first strategy for images
  if (request.method === 'GET' && /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(response => {
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
              return response;
            })
            .catch(() => {
              // Return a placeholder offline image if needed
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="#e0e0e0" width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image Offline</text></svg>',
                {
                  headers: { 'Content-Type': 'image/svg+xml' }
                }
              );
            });
        })
    );
    return;
  }

  // Default strategy - Cache first, then network
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseClone = response.clone();
            caches.open(DATA_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // Offline fallback
            return new Response(
              '<!DOCTYPE html><html><body style="font-family: Arial; text-align: center; padding: 20px;"><h1>Offline</h1><p>You\'re currently offline. Some features may be limited.</p></body></html>',
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/html'
                })
              }
            );
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    caches.delete(DATA_CACHE);
    caches.delete(IMAGE_CACHE);
  }
});

// Background sync for offline actions (for future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  // Sync logic would go here
  console.log('Syncing cart...');
}
