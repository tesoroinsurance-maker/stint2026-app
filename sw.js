// STINT 2026 - 서비스 워커
// PWA 설치 및 기본적인 오프라인 캐싱을 위한 최소한의 서비스 워커입니다.
// 외부 CDN(React, Tailwind 등)은 캐싱하지 않고 브라우저 기본 캐시에 맡깁니다.
//
// v2에서 바뀐 점: index.html(HTML 문서)은 "네트워크 우선"으로 항상 최신 버전을 먼저 시도하고,
// 오프라인일 때만 캐시로 대체합니다. (v1은 캐시를 먼저 써서 새로 배포해도 옛 화면이 보이는 문제가 있었습니다.)

const CACHE_NAME = "stint2026-v2";
const CORE_ASSETS = ["./manifest.json", "./icon-192.png", "./icon-512.png"];

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
  // 같은 출처(내 사이트)의 요청만 처리, 외부 CDN/백엔드 API는 그대로 네트워크로 전달
  if (url.origin !== self.location.origin) return;

  // 페이지 이동(HTML 문서) 요청은 항상 네트워크에서 최신 버전을 먼저 시도 — 오프라인일 때만 캐시 사용
  const isNavigation = event.request.mode === "navigate" || event.request.destination === "document";
  if (isNavigation) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 그 외 정적 자산(아이콘, manifest 등)은 캐시 우선
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
