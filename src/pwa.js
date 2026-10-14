// ¿La página está corriendo como app instalada (pantalla de inicio) y no dentro del navegador?
// `display-mode: standalone` cubre Android/escritorio; `navigator.standalone` es el equivalente de iOS Safari.
export function isInstalledApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// ¿iPhone o iPad? (los iPad recientes se identifican como Mac, de ahí la comprobación de pantalla táctil).
export function isIos() {
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isAndroid() {
  return /Android/.test(navigator.userAgent || '');
}

// ---- Instalación desde la propia app (Chrome en Android) ----
// Chrome avisa con `beforeinstallprompt` cuando la app se puede instalar. El evento llega muy temprano, por eso este
// módulo se carga al arrancar (main.jsx): se guarda para poder mostrar un botón "Instalar" y lanzar el aviso
// nativo cuando la persona lo toque. En iPhone y en otros navegadores no existe: ahí se manda a la guía /instalar.
let deferredPrompt = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // evita la mini barra de Chrome; la invitación la hace nuestro aviso
    deferredPrompt = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function canPromptInstall() {
  return deferredPrompt !== null;
}

/** Lanza el aviso nativo de instalación. Devuelve true si la persona aceptó. */
export async function promptInstall() {
  if (!deferredPrompt) return false;
  const prompt = deferredPrompt;
  deferredPrompt = null; // un evento solo se puede usar una vez
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  notify();
  return outcome === 'accepted';
}

/** Para que un componente se entere cuando cambia `canPromptInstall()`. Devuelve la función para dejar de escuchar. */
export function onInstallPromptChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
