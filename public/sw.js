const CACHE_NAME = "dopameme-offline-v3";
const STATIC_CACHE_NAME = "dopameme-static-v1";
const OFFLINE_URL = "/offline";
const PUBLIC_NAVIGATION_URLS = ["/", "/about", "/terms", "/privacy", OFFLINE_URL];
const PRECACHE_URLS = ["/manifest.webmanifest", "/icon.svg"];
const OFFLINE_FALLBACK_HTML = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>오프라인 | 도파밈</title>
    <style>
      body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #111827; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      section { max-width: 520px; border: 1px solid #e5e7eb; border-radius: 18px; background: #fff; padding: 32px; box-shadow: 0 16px 48px rgba(15, 23, 42, 0.08); }
      h1 { margin: 0 0 12px; font-size: 28px; line-height: 1.2; }
      p { margin: 0 0 24px; color: #4b5563; line-height: 1.7; }
      a { display: inline-flex; border-radius: 999px; background: #2563eb; color: #fff; padding: 12px 18px; text-decoration: none; font-weight: 800; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>현재 오프라인 상태입니다</h1>
        <p>네트워크 연결이 복구되면 도파밈 페이지를 다시 불러올 수 있습니다.</p>
        <a href="/">홈으로 이동</a>
      </section>
    </main>
  </body>
</html>`;

function isPublicNavigationPath(pathname) {
  return PUBLIC_NAVIGATION_URLS.includes(pathname);
}

function isStaticAssetPath(pathname) {
  return pathname.startsWith("/_next/static/") || pathname === "/icon.svg";
}

function getSameOriginNotificationUrl(value) {
  try {
    const url = new URL(value || "/notifications", self.location.origin);
    return url.origin === self.location.origin ? url.href : `${self.location.origin}/notifications`;
  } catch {
    return `${self.location.origin}/notifications`;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("dopameme-") && key !== CACHE_NAME && key !== STATIC_CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    if (isPublicNavigationPath(url.pathname)) {
      event.respondWith(networkOnlyNavigation(request));
      return;
    }

    event.respondWith(fallbackToOfflinePage(request));
    return;
  }

  if (isStaticAssetPath(url.pathname)) {
    event.respondWith(cacheFirstStaticAsset(request));
    return;
  }

  if (url.pathname === "/manifest.webmanifest") {
    event.respondWith(networkFirstPrecachedAsset(request));
  }
});

async function networkOnlyNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    return fallbackToOfflinePage(request);
  }
}

async function networkFirstPrecachedAsset(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return fallbackToOfflinePage(request);
  }
}

async function cacheFirstStaticAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

async function fallbackToOfflinePage() {
  const cachedOfflinePage = await caches.match(OFFLINE_URL);
  if (cachedOfflinePage) return cachedOfflinePage;
  return createOfflineFallbackResponse();
}

function createOfflineFallbackResponse() {
  return new Response(OFFLINE_FALLBACK_HTML, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "Dopameme";
  const options = {
    body: payload.body || "New notification",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: payload.tag || "dopameme-notification",
    data: {
      url: getSameOriginNotificationUrl(payload.url),
      notificationId: payload.notificationId || null,
      type: payload.type || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = getSameOriginNotificationUrl(event.notification.data && event.notification.data.url);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    }),
  );
});
