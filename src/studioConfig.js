// Datos del estudio que usan los botones de Ayuda, Reportar error y Paquetes.
// Se editan aquí y se vuelve a desplegar el frontend (igual que el aviso de privacidad).

// WhatsApp del estudio: solo dígitos, con la lada del país y sin "+" ni espacios (ej. México: 52 + 10 dígitos).
// Mientras esté vacío, los botones de WhatsApp no se muestran o quedan desactivados.
export const STUDIO_WHATSAPP = '525661077144';

// Página principal del estudio (con https://). Vacío = el enlace no se muestra.
export const STUDIO_WEBSITE_URL = 'https://fussion-fitness-studio.vercel.app/';

// Paquetes que se muestran en /paquetes. Cada botón "Contratar" abre WhatsApp con el mensaje
// "Quiero contratar el paquete <name>". Un paquete por renglón:
//   { name: 'Paquete 10 clases', detail: 'Vigencia de 30 días', price: '$1,200' },
// `detail` y `price` son opcionales (son texto libre: pon el precio como quieras que se vea).
export const PACKAGES = [{ name: 'Paquete 1 clase', detail: 'Vigencia de 1 día', price: '$100' },{ name: 'Paquete 4 clases', detail: 'Vigencia de 14 días naturales', price: '$340' },{ name: 'Paquete 8 clases', detail: 'Vigencia de 21 días naturales', price: '$640' },{ name: 'Paquete 10 clases', detail: 'Vigencia de 28 días naturales', price: '$750' }];
