// Número en el ícono de la app instalada (Badging API). Funciona en Android y escritorio con la app instalada, y en
// iPhone/iPad (iOS 16.4+) con la app agregada a la pantalla de inicio y las notificaciones activadas. Donde no
// exista, no hace nada: nunca debe romper la pantalla.

export function setAppBadge(count) {
  try {
    if (!('setAppBadge' in navigator)) return;
    if (count > 0) navigator.setAppBadge(count).catch(() => {});
    else navigator.clearAppBadge?.().catch(() => {});
  } catch {
    // Sin soporte o sin permiso: se ignora.
  }
}

export function clearAppBadge() {
  setAppBadge(0);
}
