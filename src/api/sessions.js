import { request } from './client';

export function fetchSessions(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return request(`/sessions/${params ? `?${params}` : ''}`);
}
