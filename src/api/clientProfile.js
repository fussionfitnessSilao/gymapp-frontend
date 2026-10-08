import { request } from './client';

export function fetchClientProfile() {
  return request('/me/profile/');
}

export function updateClientProfile(payload) {
  return request('/me/profile/', { method: 'PATCH', body: payload });
}

export function fetchHealth() {
  return request('/me/health/');
}

export function saveHealth({ has_condition: hasCondition, details }) {
  return request('/me/health/', { method: 'PUT', body: { has_condition: hasCondition, details: details || '' } });
}
