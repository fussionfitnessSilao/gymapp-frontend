// Opciones y utilidades compartidas por el registro (pasos 1 a 3) y la edición desde Perfil.

export const ACTIVITY_OPTIONS = [
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'spinning', label: 'Spinning' },
  { value: 'other', label: 'Otra' },
];

export const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Pérdida de grasa' },
  { value: 'muscle_tone', label: 'Tono muscular' },
  { value: 'flexibility', label: 'Flexibilidad' },
  { value: 'relaxation', label: 'Relajación' },
  { value: 'aesthetics_health', label: 'Estética/salud' },
  { value: 'meditation', label: 'Meditación' },
  { value: 'other', label: 'Otros' },
];

export const HEARD_ABOUT_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'friend', label: 'Recomendación de un amigo' },
  { value: 'walk_by', label: 'Pasé por el estudio' },
  { value: 'google', label: 'Google' },
  { value: 'other', label: 'Otro' },
];

// El aviso de privacidad vive en la propia app (/privacidad, texto en src/content/aviso-privacidad.md).
// Si algún día se publica en otro sitio, VITE_PRIVACY_NOTICE_URL tiene prioridad.
export const PRIVACY_NOTICE_URL = import.meta.env.VITE_PRIVACY_NOTICE_URL || '/privacidad';

// Debe coincidir con MIN_CLIENT_AGE y ADULT_AGE del backend (apps/accounts/models.py).
export const MIN_AGE = 16;
export const ADULT_AGE = 18;

export const UNDER_AGE_MESSAGE = 'Por ahora nuestras clases son para personas de 16 años en adelante.';

export function todayISO() {
  return new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD en la zona del dispositivo
}

/** Edad en años cumplidos de una fecha AAAA-MM-DD (null si la fecha no está completa). */
export function ageFromDate(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) age -= 1;
  return age;
}

export const EMPTY_PROFILE_FORM = {
  birth_date: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_consent: false,
  emergency_contact_name: '',
  emergency_contact_phone: '',
  address: '',
  social_handle: '',
  shoe_size: '',
  previous_sports: '',
  activities_of_interest: [],
  training_goals: [],
  heard_about: '',
  heard_about_other: '',
  activities_other: '',
  goals_other: '',
  comments: '',
  marketing_opt_in: true,
};

export const EMPTY_HEALTH = { has_condition: null, details: '' };

/** Convierte la respuesta de /me/profile/ en el estado de un formulario (sin nulos). */
export function profileToForm(profile) {
  const form = { ...EMPTY_PROFILE_FORM };
  for (const key of Object.keys(EMPTY_PROFILE_FORM)) {
    if (profile[key] !== undefined && profile[key] !== null) form[key] = profile[key];
  }
  return form;
}

/** Toma del formulario solo los campos indicados, listos para mandarse al backend. */
export function pickPayload(form, keys) {
  const payload = {};
  for (const key of keys) {
    let value = form[key];
    if (key === 'birth_date' && value === '') value = null;
    if (key === 'heard_about_other' && form.heard_about !== 'other') value = '';
    if (key === 'activities_other' && !form.activities_of_interest.includes('other')) value = '';
    if (key === 'goals_other' && !form.training_goals.includes('other')) value = '';
    payload[key] = value;
  }
  return payload;
}

export const ACCOUNT_STEP_PROFILE_KEYS = ['birth_date', 'guardian_name', 'guardian_phone', 'guardian_consent'];
export const CONTACT_KEYS = ['emergency_contact_name', 'emergency_contact_phone', 'address', 'social_handle', 'shoe_size'];
export const PREFERENCE_KEYS = [
  'previous_sports',
  'activities_of_interest',
  'training_goals',
  'heard_about',
  'heard_about_other',
  'activities_other',
  'goals_other',
  'comments',
  'marketing_opt_in',
];

// ---- Deportes practicados: los más comunes, en orden alfabético ----
export const SPORT_OPTIONS = [
  'Atletismo',
  'Baile',
  'Básquetbol',
  'Box',
  'Ciclismo',
  'CrossFit',
  'Fútbol',
  'Gimnasia',
  'Natación',
  'Pilates',
  'Running',
  'Spinning',
  'Tenis',
  'Voleibol',
  'Yoga',
  'Zumba',
].sort((a, b) => a.localeCompare(b, 'es'));

/** "Yoga, Natación" -> ['Yoga', 'Natación'] (el backend guarda los deportes como un solo texto). */
export function splitSports(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinSports(list) {
  return list.join(', ');
}

// ---- Calzado: del 21 al 32, con media talla u "Otro" ----
export const SHOE_SIZES = Array.from({ length: 12 }, (_, index) => String(21 + index));

/** Interpreta el calzado guardado: { mode: '' | 'size' | 'other', size, half, other }. */
export function parseShoeSize(value) {
  const text = (value || '').trim();
  if (!text) return { mode: '', size: '', half: false, other: '' };
  const match = text.match(/^(\d{2})(\.5)?$/);
  if (match && SHOE_SIZES.includes(match[1])) return { mode: 'size', size: match[1], half: Boolean(match[2]), other: '' };
  return { mode: 'other', size: '', half: false, other: text };
}

export function buildShoeSize({ size, half }) {
  return size ? `${size}${half ? '.5' : ''}` : '';
}

// ---- Fecha de nacimiento en tres listas (día, mes, año) ----
export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Años de nacimiento a elegir: del año de quien hoy cumple 16 hacia atrás, hasta 1930. */
export function birthYearOptions(extraYear) {
  const newest = new Date().getFullYear() - MIN_AGE;
  const years = [];
  for (let year = newest; year >= 1930; year -= 1) years.push(String(year));
  if (extraYear && !years.includes(String(extraYear))) years.unshift(String(extraYear));
  return years;
}

export function splitDate(iso) {
  const [year = '', month = '', day = ''] = (iso || '').split('-');
  return { year, month: month ? String(Number(month)) : '', day: day ? String(Number(day)) : '' };
}

/** Une día, mes y año en AAAA-MM-DD; vacío mientras falte alguno o la fecha no exista (31 de febrero). */
export function joinDate({ year, month, day }) {
  if (!year || !month || !day) return '';
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getMonth() !== Number(month) - 1) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
