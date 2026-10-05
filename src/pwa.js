// ¿La página está corriendo como app instalada (pantalla de inicio) y no dentro del navegador?
// `display-mode: standalone` cubre Android/escritorio; `navigator.standalone` es el equivalente de iOS Safari.
export function isInstalledApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
