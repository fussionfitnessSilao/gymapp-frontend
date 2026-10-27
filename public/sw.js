// Service worker de Fussion Fitness: atiende las notificaciones push y guarda la propia app (el HTML y sus archivos
// de /assets/) para poder abrirla sin conexión. Los datos nunca se guardan aquí: la API vive en otro dominio y solo se
// atienden peticiones del mismo origen que la app.

const SHELL_CACHE = 'fussion-shell-v1';
const SHELL_URL = '/index.html'; // todas las rutas de la app devuelven el mismo HTML
const NAVIGATION_TIMEOUT_MS = 4000; // con internet "a medias", pasado este tiempo se abre la copia guardada
const MAX_CACHED_ASSETS = 80; // cada despliegue trae archivos nuevos con otro nombre; los más viejos se descartan

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Guarda de una vez la app actual (sin esperar a una segunda visita). Si falla, no impide instalar el service worker.
  event.waitUntil(precacheShell().catch(() => {}));
});

self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== SHELL_CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  )
);

async function precacheShell() {
  const cache = await caches.open(SHELL_CACHE);
  const response = await fetch('/', { cache: 'reload' });
  if (!response.ok) return;
  const html = await response.clone().text();
  await cache.put(SHELL_URL, response);
  const assets = Array.from(new Set(html.match(/\/assets\/[^"'\s)]+/g) || []));
  await Promise.all(assets.map((path) => cache.add(path).catch(() => {})));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // la API y todo lo de otros dominios pasa directo

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  }
});

// Abrir la app: primero la red (para tener siempre la versión más nueva) y, si no responde a tiempo, la copia guardada.
async function handleNavigation(event) {
  const cache = await caches.open(SHELL_CACHE);
  const network = fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(cache.put(SHELL_URL, copy).catch(() => {}));
    }
    return response;
  });
  const cached = await cache.match(SHELL_URL);
  if (!cached) return network; // primera vez: no hay copia, se espera a la red
  const slow = new Promise((resolve) => setTimeout(() => resolve(cached), NAVIGATION_TIMEOUT_MS));
  return Promise.race([network.catch(() => cached), slow]);
}

// Los archivos de /assets/ llevan el hash en el nombre y nunca cambian: si ya están guardados, se usan tal cual.
async function cacheFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone()).catch(() => {});
    await trimAssets(cache);
  }
  return response;
}

async function trimAssets(cache) {
  const keys = (await cache.keys()).filter((key) => new URL(key.url).pathname.startsWith('/assets/'));
  const extra = keys.length - MAX_CACHED_ASSETS;
  for (let index = 0; index < extra; index += 1) {
    await cache.delete(keys[index]);
  }
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  // Cada push debe mostrar una notificación (iPhone retira el permiso si no se muestra).
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'Fussion Fitness', {
        body: data.body || '',
        icon: '/icon-192.png',
        tag: data.tag || undefined,
        data: { url: data.url || '/reservations' },
      }),
      updateBadge(data.badge),
    ])
  );
});

// Número en el ícono de la app: el servidor manda cuántos avisos sin leer tiene la persona. Si el navegador no
// soporta la Badging API (o el push no trae el dato), se deja como estaba.
async function updateBadge(count) {
  if (typeof count !== 'number' || !self.navigator || !('setAppBadge' in self.navigator)) return;
  try {
    if (count > 0) await self.navigator.setAppBadge(count);
    else await self.navigator.clearAppBadge();
  } catch {
    // Sin permiso o sin soporte: no es motivo para fallar el aviso.
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const win of windows) {
        if (new URL(win.url).origin === self.location.origin && 'focus' in win) {
          await win.focus();
          if ('navigate' in win) {
            try {
              await win.navigate(target);
            } catch {
              // Si no se puede navegar, basta con haber traído la app al frente.
            }
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
