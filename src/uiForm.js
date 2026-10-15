// Validación de formularios con aviso: en vez del globo del navegador, un toast que dice qué falta, el cursor en el
// primer campo pendiente y TODOS los campos pendientes resaltados en rojo hasta que se llenan (estilos en forms.css).
// Los formularios llevan `noValidate` y llaman a `reportFirstInvalid` al enviar.

const INVALID_CLASS = 'field-invalid';
const ERROR_CLASS = 'has-error';

function labelText(input) {
  if (input.dataset.error) return input.dataset.error;
  const name = input.dataset.label || input.closest('form')?.querySelector(`label[for="${input.id}"]`)?.textContent;
  return name ? `Falta completar: ${name.trim()}` : 'Falta completar este campo.';
}

// Contenedor cuya etiqueta se pinta en rojo: el campo con su etiqueta, o la casilla con su texto.
function containerOf(input) {
  return input.closest('.form-field') || input.closest('.choice');
}

// Cada campo marcado guarda su función de limpieza, para no acumular escuchas en envíos repetidos.
const refreshers = new WeakMap();

function unmark(input) {
  input.classList.remove(INVALID_CLASS);
  input.removeAttribute('aria-invalid');
  const container = containerOf(input);
  if (container && !container.querySelector(`.${INVALID_CLASS}`)) container.classList.remove(ERROR_CLASS);
  const refresh = refreshers.get(input);
  if (refresh) {
    input.removeEventListener('input', refresh);
    input.removeEventListener('change', refresh);
    refreshers.delete(input);
  }
}

function mark(input) {
  input.classList.add(INVALID_CLASS);
  input.setAttribute('aria-invalid', 'true');
  containerOf(input)?.classList.add(ERROR_CLASS);

  const previous = refreshers.get(input);
  if (previous) {
    input.removeEventListener('input', previous);
    input.removeEventListener('change', previous);
  }
  // En cuanto el campo queda bien (o se elige una opción del grupo), deja de verse en rojo.
  const refresh = () => {
    if (!input.checkValidity()) return;
    if (input.type === 'radio' && input.name) {
      const group = input.form ? input.form.querySelectorAll(`input[type="radio"][name="${input.name}"]`) : [input];
      group.forEach(unmark);
      return;
    }
    unmark(input);
  };
  refreshers.set(input, refresh);
  input.addEventListener('input', refresh);
  input.addEventListener('change', refresh);
}

/**
 * Si hay campos obligatorios vacíos o inválidos: los resalta todos en rojo, enfoca el primero, avisa con un toast
 * (con cuántos más faltan) y devuelve true. `showToast` es el de `useToast()`.
 */
export function reportFirstInvalid(form, showToast) {
  form.querySelectorAll(`.${INVALID_CLASS}`).forEach(unmark);
  const invalid = Array.from(form.querySelectorAll('input:invalid, select:invalid, textarea:invalid'));
  if (invalid.length === 0) return false;

  invalid.forEach(mark);
  const first = invalid[0];
  first.focus({ preventScroll: true });
  first.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const others = new Set(invalid.slice(1).map((input) => (input.type === 'radio' && input.name ? input.name : input))).size;
  const extra = others > 0 ? ` (y ${others} más)` : '';
  showToast(`${labelText(first)}${extra}`);
  return true;
}

/** Resalta en rojo todos los campos pendientes sin avisar ni mover el cursor (muestra de entrada lo que falta). */
export function highlightInvalid(form) {
  form.querySelectorAll('input:invalid, select:invalid, textarea:invalid').forEach(mark);
}
