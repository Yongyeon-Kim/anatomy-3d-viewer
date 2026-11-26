const metadataCache = 'anatomy-3d-offline';
const scope = new URL(self.registration.scope);

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

async function savedCache() {
  const key = new URL('offline-files.json', scope);
  const response = await caches.match(key.href, { cacheName: metadataCache });
  const copy = response && await response.json();
  return copy && await caches.has(copy.cacheName) ? caches.open(copy.cacheName) : null;
}

async function onlineResponse(request) {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 5000);
  try {
    const response = await fetch(request, { signal: abort.signal });
    if (response.status < 500) return response;
  } catch {
    // DNS and connection failures also use the saved copy.
  } finally {
    clearTimeout(timeout);
  }
  return null;
}

async function openViewer(request, url) {
  const cache = await savedCache();
  const saved = cache && await cache.match(new URL('index.html', scope).href);
  if (!saved) return fetch(request);
  if (url.searchParams.has('offline')) return saved;
  const response = await onlineResponse(request);
  if (response) return response;
  url.searchParams.set('offline', '1');
  return Response.redirect(url.href);
}

async function openAsset(request, clientId, ignoreSearch) {
  const cache = await savedCache();
  const saved = cache && await cache.match(request, { ignoreSearch });
  if (!saved) return fetch(request);
  const client = clientId && await self.clients.get(clientId);
  if (client && new URL(client.url).searchParams.has('offline')) return saved;
  return await onlineResponse(request) ?? saved;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || request.cache === 'no-store') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const path = url.pathname.slice(scope.pathname.length);
  if (request.mode === 'navigate' && (path === '' || path === 'index.html')) {
    event.respondWith(openViewer(request, url));
  } else if (/^(assets\/|models\/|licenses\/|manifest\.json$|app-icon-)/.test(path)) {
    event.respondWith(openAsset(request, event.clientId, path.startsWith('app-icon-')));
  }
});
