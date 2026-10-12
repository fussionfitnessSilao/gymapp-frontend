// Validación de formularios con aviso: en vez del globo del navegador, un toast que dice qué falta y el cursor
// en el campo que hay que llenar. Los formularios llevan `noValidate` y llaman a esta función al enviar.

function labelText(input) {
  if (input.dataset.error) return input.dataset.error;
  const name = input.dataset.label || input.closest('form')?.querySelector(`label[for="${input.id}"]`)?.textContent;
  return name ? `Falta completar: ${name.trim()}` : 'Falta completar este campo.';
}

/**
 * Si hay un campo obligatorio vacío o inválido, enfoca el primero, avisa con un toast y devuelve true.
 * `showToast` es el de `useToast()`.
 */
export function reportFirstInvalid(form, showToast) {
  const invalid = form.querySelector('input:invalid, select:invalid, textarea:invalid');
  if (!invalid) return false;
  invalid.focus({ preventScroll: true });
  invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast(labelText(invalid));
  return true;
}
