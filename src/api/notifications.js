import { request } from './client';

/** Los últimos avisos del cliente y cuántos faltan por leer: { unread_count, results: [{ id, type, title, message, sent_at, read }] }. */
export function fetchNotifications() {
  return request('/notifications/');
}

export function markAllNotificationsRead() {
  return request('/notifications/mark-all-read/', { method: 'POST', body: {} });
}

/**
 * Qué avisos recibe la persona y por qué canal:
 * { results: [{ type, label, description, required, whatsapp, push }] }, primero los importantes.
 */
export function fetchNotificationPreferences() {
  return request('/notifications/preferences/');
}

/** Guarda una o varias preferencias ([{ type, whatsapp, push }]) y devuelve la lista completa. */
export function saveNotificationPreferences(preferences) {
  return request('/notifications/preferences/', { method: 'PUT', body: { preferences } });
}
