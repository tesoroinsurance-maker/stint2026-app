// STINT 2026 - 서비스 워커
// PWA 설치 및 기본적인 오프라인 캐싱을 위한 최소한의 서비스 워커입니다.
// 외부 CDN(React, Tailwind 등)은 캐싱하지 않고 브라우저 기본 캐시에 맡깁니다.

const CACHE_NAME = "stint2026-v1";
const CORE_ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // 같은 출처(내 사이트)의 요청만 캐시 우선으로 처리, 외부 CDN/백엔드 API는 그대로 네트워크로 전달
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
