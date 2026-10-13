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
