// Apariencia de la app: 'auto' (sigue el modo del dispositivo), 'light' o 'dark'.
// La preferencia se guarda en este dispositivo; lo que se aplica al <html> es siempre 'light' o 'dark'
// en el atributo data-theme (index.html lo pone antes del primer pintado para que no parpadee).

const STORAGE_KEY = 'fussion-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export const THEME_CHOICES = ['auto', 'light', 'dark'];

export function getThemePreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEME_CHOICES.includes(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

function resolveTheme(preference) {
  if (preference === 'light' || preference === 'dark') return preference;
  return window.matchMedia && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function applyTheme(preference = getThemePreference()) {
  document.documentElement.setAttribute('data-theme', resolveTheme(preference));
}

export function setThemePreference(preference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Sin almacenamiento disponible: el cambio vale mientras la app siga abierta.
  }
  applyTheme(preference);
}

/** Al arrancar: aplica la preferencia y, en 'auto', sigue los cambios del dispositivo (por ejemplo, al anochecer). */
export function initTheme() {
  applyTheme();
  if (!window.matchMedia) return;
  window.matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (getThemePreference() === 'auto') applyTheme('auto');
  });
}
