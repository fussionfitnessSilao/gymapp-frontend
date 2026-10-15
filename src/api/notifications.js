import { request } from './client';

/** Los últimos avisos del cliente y cuántos faltan por leer: { unread_count, results: [{ id, type, title, message, sent_at, read }] }. */
export function fetchNotifications() {
  return request('/notifications/');
}

export function markAllNotificationsRead() {
  return request('/notifications/mark-all-read/', { method: 'POST', body: {} });
}
