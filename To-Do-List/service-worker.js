// Funky To-Do List App - Service Worker - Book Repository Version
const CACHE_NAME = 'funky-todo-list-v1';

// Helper function to get the deployment base path
function getBasePath() {
  // Get base path from service worker location
  const swPath = self.location.pathname;
  const pathParts = swPath.split('/');
  // Remove the service-worker.js from the path
  pathParts.pop();
  return pathParts.join('/');
}

// Install event - cache assets with correct base path
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting forces the waiting service worker to become the active service worker
  self.skipWaiting();
  
  // Get the base path dynamically based on where the service worker is located
  const basePath = getBasePath();
  console.log('[Service Worker] Base path detected as:', basePath);
  
  // Assets to cache - using relative paths that work in any deployment context
  const ASSETS_TO_CACHE = [
    // HTML and core files
    `${basePath}/index.html`,
    `${basePath}/style.css`,
    `${basePath}/improved.js`,
    `${basePath}/manifest.json`,
    
    // Icons
    `${basePath}/icons/icon-192x192.png`,
    `${basePath}/icons/icon-512x512.png`,
    
    // Sound files
    `${basePath}/sounds/beep.mp3`,
    `${basePath}/sounds/chime.mp3`,
    `${basePath}/sounds/music.mp3`,
    `${basePath}/sounds/alert.mp3`,
    `${basePath}/sounds/bell.mp3`,
    
    // External resources
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@400;600&display=swap'
  ];
  
  // Add the base path itself (in case it's accessed without trailing slash)
  if (basePath !== '') {
    ASSETS_TO_CACHE.push(basePath);
    ASSETS_TO_CACHE.push(`${basePath}/`);
  } else {
    ASSETS_TO_CACHE.push('/');
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and content');
        return cache.addAll(ASSETS_TO_CACHE)
          .catch(error => {
            console.log('[Service Worker] Cache failure, some assets could not be added to cache:', error);
            // Continue even if some assets fail to cache
            // Log which assets failed
            console.log('Failed assets:', error);
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients so that the service worker is immediately in control of clients
  event.waitUntil(clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - respond with cache then network
self.addEventListener('fetch', event => {
  // Log the fetch request for debugging
  console.log('[Service Worker] Fetch:', event.request.url);
  
  // Skip cross-origin requests that aren't in our allowlist
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com') && 
      !event.request.url.includes('fonts.googleapis.com') &&
      !event.request.url.includes('fonts.gstatic.com') &&
      !event.request.url.includes('assets.mixkit.co')) {
    console.log('[Service Worker] Skipping non-origin fetch:', event.request.url);
    return;
  }
  
  // For HTML requests, always try network first then fall back to cache
  if (event.request.headers.get('accept') && 
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.log('[Service Worker] Fetch failed; returning offline page instead.', error);
          return caches.match('index.html');
        })
    );
    return;
  }
  
  // For non-HTML requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('[Service Worker] Returning cached response for:', event.request.url);
          return response;
        }
        
        // Clone the request - a request is a stream and can only be consumed once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(fetchResponse => {
            // If this is a valid resource, cache it for later
            if (fetchResponse && fetchResponse.status === 200 && 
                (fetchResponse.type === 'basic' || event.request.url.includes('assets.mixkit.co'))) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('[Service Worker] Caching new resource:', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }
            return fetchResponse;
          })
          .catch(error => {
            console.log('[Service Worker] Fetch failed:', error, 'URL:', event.request.url);
            // Try to match any type of resource as a fallback
            return caches.match(event.request);
          });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(clientList => {
        // Get the base path
        const basePath = getBasePath();
        
        if (clientList.length > 0) {
          return clientList[0].focus();
        } else {
          // Open correct URL based on base path
          if (basePath === '') {
            return clients.openWindow('/');
          } else {
            return clients.openWindow(basePath + '/');
          }
        }
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const title = 'Funky To-Do List Reminder';
  const options = {
    body: event.data ? event.data.text() : 'You have tasks to complete!',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
}); 