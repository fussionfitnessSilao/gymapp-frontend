import { request } from './client';

/** ¿Hay push disponible en el servidor? y la llave pública que el navegador necesita para suscribirse. */
export function fetchPushConfig() {
  return request('/push/public-key/');
}

/** Registra este dispositivo. `subscription` es lo que devuelve `subscription.toJSON()` del navegador. */
export function subscribePush(subscription) {
  return request('/push/subscribe/', { method: 'POST', body: subscription });
}

export function unsubscribePush(endpoint) {
  return request('/push/unsubscribe/', { method: 'POST', body: { endpoint } });
}

/** Manda una notificación de prueba a los dispositivos de la persona. Devuelve { sent }. */
export function sendTestPush() {
  return request('/push/test/', { method: 'POST', body: {} });
}
