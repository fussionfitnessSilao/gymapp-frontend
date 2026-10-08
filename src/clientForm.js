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

// Dirección pública del aviso de privacidad (se define al publicarlo; ver VITE_PRIVACY_NOTICE_URL).
export const PRIVACY_NOTICE_URL = import.meta.env.VITE_PRIVACY_NOTICE_URL || '';

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
  comments: '',
  marketing_opt_in: false,
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
  'comments',
  'marketing_opt_in',
];
