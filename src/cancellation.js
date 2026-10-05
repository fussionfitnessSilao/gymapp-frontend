import { useEffect, useState } from 'react';

// Límite general para cancelar sin perder la clase (en horas). Debe coincidir con CANCELLATION_WINDOW_HOURS del
// backend. Cada clase puede tener el suyo: la API lo manda ya resuelto como `cancellation_window_hours`.
export const GENERAL_CANCELLATION_HOURS = 2;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function cancellationHours(item) {
  return item.cancellation_window_hours ?? GENERAL_CANCELLATION_HOURS;
}

// "Ahora" que se actualiza solo, para que las cuentas regresivas avancen sin recargar la página.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatDeadline(date) {
  return date.toLocaleString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatRemaining(ms) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

// Hasta cuándo se puede cancelar sin penalización una clase que empieza en `startDateStr`.
// - Si falta más de un día para ese límite: muestra la hora exacta del límite.
// - Si faltan menos de 24 h: cuenta regresiva.
// - Si el límite ya pasó: open=false (y `deadlineText` con la hora a la que venció).
export function describeCancellation(startDateStr, hours, now) {
  const deadline = new Date(new Date(startDateStr).getTime() - hours * HOUR_MS);
  const msLeft = deadline.getTime() - now;
  const deadlineText = formatDeadline(deadline);
  if (msLeft <= 0) {
    return { open: false, deadlineText, text: null, short: null };
  }
  if (msLeft < DAY_MS) {
    const remaining = formatRemaining(msLeft);
    return {
      open: true,
      deadlineText,
      text: `Te quedan ${remaining} para cancelar sin penalización`,
      short: `Quedan ${remaining} para cancelar`,
    };
  }
  return {
    open: true,
    deadlineText,
    text: `Puedes cancelar sin penalización hasta el ${deadlineText}`,
    short: `Cancela hasta ${deadlineText}`,
  };
}
