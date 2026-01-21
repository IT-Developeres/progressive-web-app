// Cache versioning strategy - Only update when you intentionally change this
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'techstore-' + CACHE_VERSION;
const DATA_CACHE = 'techstore-data-' + CACHE_VERSION;
const IMAGE_CACHE = 'techstore-images-' + CACHE_VERSION;

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing version:', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] Caching app shell');
          return cache.addAll(urlsToCache);
        })
        .catch(err => console.log('[Service Worker] Cache open failed:', err))
    ]).then(() => {
      console.log('[Service Worker] Install complete, skipping waiting');
      self.skipWaiting();
    })
  );
});

// Activate Service Worker - Clean old caches and claim clients
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
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
            return caches.match(request).then(cached => {
              return cached || goOffline();
            });
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            return cached || goOffline();
          });
        })
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
            // Offline fallback - show offline page
            return goOffline();
          });
      })
  );
});

// Offline fallback function
async function goOffline() {
  try {
    // Try to get cached offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback to generic offline message
    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;margin:0}.offline-content{background:white;padding:40px;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);}h1{color:#333;margin:20px 0;}p{color:#666;font-size:16px;}</style></head><body><div class="offline-content"><h1>📡 You\'re Offline</h1><p>No internet connection detected. Please check your connection and try again.</p><button onclick="location.reload()" style="padding:10px 20px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer;font-size:16px;">↻ Try Again</button></div></body></html>',
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/html; charset=utf-8'
        })
      }
    );
  } catch (error) {
    console.error('[Service Worker] Error in goOffline:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle messages from clients
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] SKIP_WAITING triggered');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Clearing all caches');
    Promise.all([
      caches.delete(CACHE_NAME),
      caches.delete(DATA_CACHE),
      caches.delete(IMAGE_CACHE)
    ]).then(() => {
      console.log('[Service Worker] All caches cleared');
      event.ports[0].postMessage({ success: true, message: 'Caches cleared' });
    });
  }

  if (event.data && event.data.type === 'GET_CACHE_VERSION') {
    event.ports[0].postMessage({ 
      cacheVersion: CACHE_VERSION,
      cacheName: CACHE_NAME
    });
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
