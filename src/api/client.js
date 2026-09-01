const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export function getTokens() {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  };
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken() {
  const { refresh } = getTokens();
  if (!refresh) throw new Error('No hay sesión activa.');

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('La sesión expiró.');
  }

  const data = await response.json();
  setTokens({ access: data.access });
  return data.access;
}

/**
 * Wrapper de fetch: agrega el token, reintenta una vez si expiró (401), y
 * normaliza los errores al formato { code, message, details } que ya usa
 * el backend (Fase 7).
 */
export async function request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const { access } = getTokens();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && retry) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, auth, retry: false });
    } catch {
      clearTokens();
      throw { code: 'SESSION_EXPIRED', message: 'Tu sesión expiró. Inicia sesión de nuevo.' };
    }
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw data?.error || { code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado.' };
  }

  return data;
}
