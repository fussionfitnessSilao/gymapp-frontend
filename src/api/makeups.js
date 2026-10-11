import { request } from './client';

/** Reposiciones disponibles del cliente (sin usar y vigentes), la que vence antes primero. */
export function fetchMakeups() {
  return request('/makeups/');
}
