import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Markdown from '../markdown';
import noticeSource from '../content/aviso-privacidad.md?raw';

/** El aviso de privacidad sobre la pantalla actual, para leerlo sin salir del registro. */
export default function PrivacyModal({ onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Se dibuja fuera del formulario (portal): así un clic dentro del aviso no marca la casilla de aceptación.
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Aviso de privacidad" onClick={(event) => event.stopPropagation()}>
        <div className="modal-body legal">
          <Markdown source={noticeSource} />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
