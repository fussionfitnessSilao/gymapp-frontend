import { request } from './client';

export function fetchReservations(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return request(`/reservations/${params ? `?${params}` : ''}`);
}

export function createReservation(classSessionId) {
  return request('/reservations/', { method: 'POST', body: { class_session: classSessionId } });
}

export function cancelReservation(id) {
  return request(`/reservations/${id}/cancel/`, { method: 'POST' });
}
