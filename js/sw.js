// sw.js
const CACHE_NAME = "rpo-cache-v1";
const OFFLINE_URL = "offline.html";

const PRECACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./site.webmanifest",
  "./css/style.css",
  "./css/contact.css",
  "./landing.css",
  "./landing.js",
  "./testimonialw.png",
  "./test1.jpg",
  "./favicon/favicon-48x48.png",
  "./android-chrome-192x192.png",
  "./android-chrome-512x512.png",
  "./contact.html"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Handle other requests (CSS, JS, Images, Icons, Manifest)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return resp;
      }).catch(() => {
        // fallback for images/icons if offline
        if (event.request.destination === "image") {
          return new Response("", { status: 404 });
        }
      });
    })
  );
});
