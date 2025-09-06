// Service Worker for Research Paper Organizer
const CACHE_NAME = 'research-paper-organizer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/home.html',
  '/login.html',
  '/signup.html',
  '/about.html',
  '/contact.html',
  '/tools.html',
  '/Faq.html',
  '/glossary.html',
  '/blog.html',
  '/open-source.html',
  '/Tag-Based-filtering.html',
  '/css/style.css',
  '/landing.css',
  '/js/script.js',
  '/js/landing.js',
  '/js/auth.js',
  '/js/contact.js',
  '/js/faq.js',
  '/js/glossary.js',
  '/js/about.js',
  '/js/tools.js',
  '/js/chatbot.js',
  '/js/cloud-sync.js',
  '/js/forgot-password.js',
  '/js/form-validation.js',
  '/js/pdf-annotator.js',
  '/js/pdf-viewer.js',
  '/js/profile-settings.js',
  '/js/summarize.js',
  '/js/sw.js',
  '/js/tag-suggest.js',
  '/favicon/favicon-48x48.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/site.webmanifest',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
