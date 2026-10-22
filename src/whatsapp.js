import { isInstalledApp } from './pwa';
import { STUDIO_WHATSAPP } from './studioConfig';

const PHONE = STUDIO_WHATSAPP.replace(/\D/g, '');

export const whatsappConfigured = PHONE.length > 0;

/** Enlace de WhatsApp al estudio con el mensaje ya escrito. null si el número del estudio no está configurado. */
export function whatsappUrl(message) {
  if (!whatsappConfigured) return null;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

function fullName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(' ');
}

export function helpMessage(user) {
  const name = fullName(user);
  return `Hola${name ? `, soy ${name}` : ''}. Necesito ayuda con la app: `;
}

export function packageMessage(user, packageName) {
  const name = fullName(user);
  return `Hola${name ? `, soy ${name}` : ''}. Quiero contratar el paquete: ${packageName}.`;
}

export function packagesInquiryMessage(user) {
  const name = fullName(user);
  return `Hola${name ? `, soy ${name}` : ''}. Quiero información sobre los paquetes.`;
}

/**
 * Mensaje para reportar un error: deja espacio para que la persona cuente qué pasó y agrega los datos técnicos
 * que ayudan a encontrarlo (pantalla, cuenta, dispositivo).
 */
export function bugReportMessage(user, fromPath) {
  const lines = [
    'Hola, quiero reportar un error en la app.',
    '',
    '¿Qué estaba haciendo?',
    '',
    '¿Qué pasó?',
    '',
    '— Datos técnicos (no los borres) —',
  ];
  if (fromPath) lines.push(`Pantalla: ${fromPath}`);
  if (user?.email) lines.push(`Cuenta: ${user.email}`);
  lines.push(`Dispositivo: ${navigator.userAgent}`);
  lines.push(`App instalada: ${isInstalledApp() ? 'sí' : 'no'}`);
  lines.push(`Fecha: ${new Date().toLocaleString('es-MX')}`);
  return lines.join('\n');
}
