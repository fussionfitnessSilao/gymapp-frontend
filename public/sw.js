// Service worker de Fussion Fitness: solo atiende las notificaciones push (no guarda nada en caché).

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

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
