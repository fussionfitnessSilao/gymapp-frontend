import { request } from './client';

export function fetchMyMembership() {
  return request('/me/membership/');
}
