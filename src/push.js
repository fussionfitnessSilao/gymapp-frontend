import { fetchPushConfig, sendTestPush, subscribePush, unsubscribePush } from './api/push';
import { isInstalledApp, isIos } from './pwa';

// Estados de las notificaciones en ESTE dispositivo:
//   'unavailable'  el servidor no tiene push configurado
//   'ios-install'  iPhone/iPad: primero hay que agregar la app a la pantalla de inicio
//   'unsupported'  el navegador no admite push
//   'blocked'      la persona las bloqueó en el navegador
//   'off'          se pueden activar
//   'on'           activadas

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function sameKey(subscription, key) {
  const current = subscription.options?.applicationServerKey;
  if (!current) return true; // el navegador no lo expone: se reutiliza la suscripción
  const bytes = new Uint8Array(current);
  return bytes.length === key.length && bytes.every((value, index) => value === key[index]);
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  return registration ? registration.pushManager.getSubscription() : null;
}

async function registerWorker() {
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

export async function getPushState() {
  let config;
  try {
    config = await fetchPushConfig();
  } catch {
    return 'unavailable';
  }
  if (!config.enabled) return 'unavailable';
  if (isIos() && !isInstalledApp()) return 'ios-install';
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';

  if (Notification.permission === 'granted') {
    const subscription = await currentSubscription();
    if (subscription) {
      // Vuelve a ligar el dispositivo a la cuenta actual (por si se usó con otra cuenta o el servidor la borró).
      subscribePush(subscription.toJSON()).catch(() => {});
      return 'on';
    }
  }
  return 'off';
}

/** Pide permiso y suscribe este dispositivo. Devuelve 'on', 'blocked' (lo negó) o 'dismissed' (cerró el aviso). */
export async function enablePush() {
  const config = await fetchPushConfig();
  if (!config.enabled) throw { code: 'PUSH_NOT_CONFIGURED', message: 'Las notificaciones no están disponibles por ahora.' };

  const permission = await Notification.requestPermission();
  if (permission === 'denied') return 'blocked';
  if (permission !== 'granted') return 'dismissed';

  const registration = await registerWorker();
  const key = urlBase64ToUint8Array(config.public_key);

  let subscription = await registration.pushManager.getSubscription();
  if (subscription && !sameKey(subscription, key)) {
    await subscription.unsubscribe(); // quedó hecha con otras llaves del servidor
    subscription = null;
  }
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  }

  await subscribePush(subscription.toJSON());
  return 'on';
}

/** Apaga las notificaciones de este dispositivo (en el servidor y en el navegador). */
export async function disablePush() {
  const subscription = await currentSubscription();
  if (!subscription) return;
  try {
    await unsubscribePush(subscription.endpoint);
  } catch {
    // Si el servidor no responde, igual se da de baja en el navegador.
  }
  await subscription.unsubscribe();
}

/**
 * Al cerrar sesión: el servidor deja de mandar a este dispositivo los avisos de esa cuenta (útil en celulares
 * compartidos). El permiso del navegador se conserva; al volver a entrar, Perfil lo vuelve a ligar. Nunca falla.
 */
export async function detachPushDevice() {
  try {
    if (!pushSupported()) return;
    const subscription = await currentSubscription();
    if (subscription) await unsubscribePush(subscription.endpoint);
  } catch {
    // No debe impedir cerrar la sesión.
  }
}

export async function sendPushTest() {
  const { sent } = await sendTestPush();
  return sent;
}
