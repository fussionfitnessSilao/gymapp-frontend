// Dirección del panel de administración (el backend, /admin/). Se arma con la misma dirección del servidor que usa
// la app, así funciona igual en producción y en desarrollo.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function buildAdminUrl() {
  try {
    return new URL('/admin/', API_BASE_URL).href;
  } catch {
    return '/admin/';
  }
}

export const ADMIN_URL = buildAdminUrl();
