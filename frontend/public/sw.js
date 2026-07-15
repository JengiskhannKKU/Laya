const CACHE_NAME = "laya-cache-v1";
const PRECACHE_URLS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const STATIC_ASSET_RE = /\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff2?|ttf)$/;

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // ไม่แคช cross-origin และ API — ข้อมูลผู้ใช้/ตะกร้า/auth ต้องสดเสมอ
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const isStaticAsset = url.pathname.startsWith("/_next/static/") || STATIC_ASSET_RE.test(url.pathname);

  if (isStaticAsset) {
    // Cache-first — ไฟล์ static ไม่เปลี่ยนบ่อย (Next.js ใส่ content hash ในชื่อไฟล์อยู่แล้ว)
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    // Network-first สำหรับหน้าเว็บ — fallback เป็นแคช/หน้าแรกเมื่อออฟไลน์
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
  }
});
