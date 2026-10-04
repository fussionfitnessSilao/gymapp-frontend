// Límite general para cancelar sin perder la clase (en horas). Debe coincidir con CANCELLATION_WINDOW_HOURS del
// backend. Cada clase puede tener el suyo: la API lo manda ya resuelto como `cancellation_window_hours`.
export const GENERAL_CANCELLATION_HOURS = 2;

export function cancellationHours(item) {
  return item.cancellation_window_hours ?? GENERAL_CANCELLATION_HOURS;
}

export function hoursLabel(hours) {
  return hours === 1 ? '1 hora' : `${hours} horas`;
}

// Frase para los avisos de cancelación: "faltan más de 10 horas para la clase", etc.
export function timeLeftPhrase(hours, withinWindow) {
  if (hours === 0) {
    return withinWindow ? 'la clase aún no empieza' : 'la clase ya empezó';
  }
  return withinWindow
    ? `faltan más de ${hoursLabel(hours)} para la clase`
    : `faltan menos de ${hoursLabel(hours)} para la clase`;
}
