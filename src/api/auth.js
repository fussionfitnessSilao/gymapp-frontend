import { clearTokens, request, setTokens } from './client';

export async function login(email, password) {
  const data = await request('/auth/login/', { method: 'POST', body: { email, password }, auth: false });
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export function register(payload) {
  return request('/auth/register/', { method: 'POST', body: payload, auth: false });
}

export async function logout() {
  const refresh = localStorage.getItem('refresh_token');
  try {
    if (refresh) {
      await request('/auth/logout/', { method: 'POST', body: { refresh } });
    }
  } finally {
    clearTokens();
  }
}

export function fetchMe() {
  return request('/me/');
}

export function fetchCheckinToken() {
  return request('/me/checkin-token/');
}

export function updateMe(payload) {
  return request('/me/', { method: 'PATCH', body: payload });
}

export function requestPasswordReset(email) {
  return request('/auth/password-reset/', { method: 'POST', body: { email }, auth: false });
}

export function confirmPasswordReset({ uid, token, new_password: newPassword }) {
  return request('/auth/password-reset/confirm/', {
    method: 'POST',
    body: { uid, token, new_password: newPassword },
    auth: false,
  });
}
