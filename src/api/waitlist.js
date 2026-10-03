import { request } from './client';

export function joinWaitlist(classSessionId) {
  return request(`/sessions/${classSessionId}/waitlist/`, { method: 'POST' });
}

export function leaveWaitlist(classSessionId) {
  return request(`/sessions/${classSessionId}/waitlist/`, { method: 'DELETE' });
}

export function fetchMyWaitlist() {
  return request('/waitlist/');
}
