import { request } from './client';

// Paquetes que el estudio marcó "publicar en la app". Es público: se pide sin token, para que se vea también sin
// haber iniciado sesión (y para que un token vencido no lo tumbe).
export function fetchPackages() {
  return request('/packages/', { auth: false });
}
