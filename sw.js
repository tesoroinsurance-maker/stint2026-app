// ★ 스스로 물러나는 서비스워커 (OWNER 2026-10-03)
//   tesoro2026.com 의 자료가 ★ 떼소로Office 안으로 들어갔다.
//   옛 워커가 남아 있으면 ★ 품고 있던 옛 화면이 계속 보인다.
//   그래서 ★ 깔리자마자 캐시를 지우고 ★ 스스로 등록을 푼다.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (err) {}
    try { await self.registration.unregister(); } catch (err) {}
    try {
      const cs = await self.clients.matchAll({ type: "window" });
      cs.forEach((c) => c.navigate(c.url));
    } catch (err) {}
  })());
});
