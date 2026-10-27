// Copia local mínima para poder usar la app sin conexión (hoy: ver la clave de la puerta).
//
// Qué se guarda en este teléfono: los datos básicos de la persona (los mismos que ya usa la interfaz) y su clave de
// la puerta, si el servidor se la dio. Se reemplaza cada vez que /me/ responde, se borra al cerrar sesión y, si el
// servidor deja de dar la clave (por ejemplo, venció la membresía), se borra en la siguiente conexión.

const KEY = 'gymapp:offline';
const DAY_MS = 24 * 60 * 60 * 1000;

// Cuánto tiempo se sigue mostrando la clave guardada sin haber hablado con el servidor. Pasado ese plazo se pide
// conectarse una vez para actualizarla (evita que un teléfono sin conexión conserve la clave de una membresía vencida).
export const OFFLINE_MAX_AGE_DAYS = 30;

// Cuánto espera la app al servidor al abrirse antes de usar la copia local (internet "a medias": hay señal, no hay datos).
export const OFFLINE_FALLBACK_MS = 6000;

const USER_FIELDS = ['id', 'email', 'first_name', 'last_name', 'role', 'gym_name', 'profile_complete'];

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && data.v === 1 ? data : null;
  } catch {
    return null;
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Sin espacio o almacenamiento bloqueado: la app sigue igual, solo que sin copia local.
  }
}

/** ¿El fallo fue de red (sin conexión, servidor dormido, tiempo agotado) y no una respuesta del servidor? */
export function isNetworkError(err) {
  return err instanceof TypeError;
}

/** Guarda la respuesta de /me/ (o del inicio de sesión): datos básicos y clave de la puerta. */
export function saveOfflineSnapshot(me, now = Date.now()) {
  if (!me) return;
  const user = {};
  USER_FIELDS.forEach((field) => {
    if (field in me) user[field] = me[field];
  });
  write({ v: 1, user, door: me.door_code ? { code: me.door_code, savedAt: now } : null });
}

/** Los datos básicos guardados, para abrir la app sin conexión. null si no hay copia. */
export function loadOfflineUser() {
  const data = read();
  return data && data.user && data.user.role ? data.user : null;
}

/** La clave guardada: { code, savedAt, expired }. Si ya pasó el plazo, `code` viene vacío. null si no hay. */
export function loadOfflineDoor(now = Date.now()) {
  const data = read();
  if (!data || !data.door || !data.door.code) return null;
  const expired = now - data.door.savedAt > OFFLINE_MAX_AGE_DAYS * DAY_MS;
  return { code: expired ? '' : data.door.code, savedAt: data.door.savedAt, expired };
}

export function clearOfflineData() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nada que borrar.
  }
}

export function formatSavedDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
