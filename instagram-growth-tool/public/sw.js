const CACHE_NAME = 'instagram-analytics-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch Strategy: Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network request is successful, update cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('Serving from cache:', event.request.url);
              return response;
            }
            
            // For navigation requests, serve a basic offline page
            if (event.request.mode === 'navigate') {
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Instagram Analytics Pro - Offline</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      text-align: center;
                      padding: 20px;
                    }
                    .offline-container {
                      max-width: 400px;
                    }
                    .icon {
                      font-size: 64px;
                      margin-bottom: 20px;
                    }
                    h1 {
                      margin-bottom: 10px;
                      font-size: 24px;
                      font-weight: 600;
                    }
                    p {
                      margin-bottom: 30px;
                      opacity: 0.9;
                      line-height: 1.5;
                    }
                    .retry-btn {
                      background: rgba(255, 255, 255, 0.2);
                      border: 2px solid rgba(255, 255, 255, 0.3);
                      color: white;
                      padding: 12px 24px;
                      border-radius: 8px;
                      font-size: 16px;
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      text-decoration: none;
                      display: inline-block;
                    }
                    .retry-btn:hover {
                      background: rgba(255, 255, 255, 0.3);
                      border-color: rgba(255, 255, 255, 0.5);
                    }
                  </style>
                </head>
                <body>
                  <div class="offline-container">
                    <div class="icon">📊</div>
                    <h1>You're Offline</h1>
                    <p>Instagram Analytics Pro requires an internet connection to sync your latest data and insights.</p>
                    <button class="retry-btn" onclick="window.location.reload()">
                      Try Again
                    </button>
                  </div>
                </body>
                </html>
              `, {
                headers: {
                  'Content-Type': 'text/html'
                }
              });
            }
            
            // For other requests, return a basic error response
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background Sync for Analytics Data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    console.log('Background sync: Analytics data');
    event.waitUntil(syncAnalyticsData());
  }
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let notificationData = {
    title: 'Instagram Analytics Pro',
    body: 'You have new insights available!',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: 'analytics-update',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Dashboard',
        icon: '/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/?utm_source=notification')
    );
  }
});

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'analytics-sync') {
    console.log('Periodic background sync: Analytics');
    event.waitUntil(syncAnalyticsData());
  }
});

// Helper function to sync analytics data
async function syncAnalyticsData() {
  try {
    console.log('Syncing analytics data in background...');
    
    // This would typically sync with your API
    const response = await fetch('/api/sync-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Analytics data synced successfully');
      
      // Show notification about successful sync
      await self.registration.showNotification('Data Synced', {
        body: 'Your Instagram analytics have been updated',
        icon: '/icon-192x192.png',
        tag: 'sync-complete',
        silent: true
      });
    } else {
      console.error('Failed to sync analytics data');
    }
  } catch (error) {
    console.error('Error during background sync:', error);
  }
}

// Handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker script loaded successfully');