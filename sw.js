// ============================================================
//  Glimt – service worker
//  Enkel cache-strategi:
//   • App-skall (HTML/CSS/JS) caches ved install
//   • HTML-sider: network-first, fallback til cache (så du alltid får siste versjon når du er online)
//   • CSS/JS/bilder: cache-first, fallback til nettverk (rask)
//   • Cloudinary/Unsplash-bilder caches også (opptil 50)
// ============================================================

const CACHE_VERSION = "glimt-v1";
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Filer som alltid skal være tilgjengelig offline
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png"
];

const MAX_IMAGE_CACHE_ENTRIES = 50;

// ── Install: pre-cache skallet ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      // Bruk addAll med catch-per-fil så ett manglende element ikke stopper alt
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => console.warn("SW precache feil:", url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// ── Activate: rydd gamle caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch-strategi ──
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignorer ikke-GET og cross-origin API-kall
  if (req.method !== "GET") return;

  // Firebase / Auth / API-kall: gå rett til nettverk (ikke cache sensitive)
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("api.cloudinary.com") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Bilder (Cloudinary, Unsplash, Pexels): cache-first, med LRU-trim
  if (
    req.destination === "image" ||
    /\.(png|jpg|jpeg|webp|gif|svg|avif)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirstImages(req));
    return;
  }

  // HTML-sider: network-first
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirst(req));
    return;
  }

  // CSS/JS: cache-first
  if (
    req.destination === "style" ||
    req.destination === "script" ||
    /\.(css|js|woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default: prøv nettverk, ellers cache
  event.respondWith(networkFirst(req));
});

// ── Hjelpefunksjoner ──
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Hvis navigasjon til HTML og ingenting i cache, vis index
    if (req.mode === "navigate") {
      const fallback = await caches.match("/index.html");
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function cacheFirstImages(req) {
  const cache = await caches.open(CACHE_IMAGES);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      cache.put(req, res.clone());
      // LRU-trim: hold under MAX_IMAGE_CACHE_ENTRIES
      trimCache(CACHE_IMAGES, MAX_IMAGE_CACHE_ENTRIES);
    }
    return res;
  } catch (e) {
    return new Response("", { status: 503 });
  }
}

async function trimCache(name, maxEntries) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Slett eldste (keys() returnerer i innsettingsrekkefølge)
    for (let i = 0; i < keys.length - maxEntries; i++) {
      cache.delete(keys[i]);
    }
  }
}
