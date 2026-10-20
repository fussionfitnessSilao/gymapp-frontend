import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disablePush, enablePush, getPushState, sendPushTest } from '../push';

const GENERIC_ERROR = 'No pudimos completar la acción. Inténtalo de nuevo en un momento.';

// Los errores de la API traen `code` de texto; los del navegador (DOMException) traen un número, así que se ignoran.
function errorText(err) {
  return typeof err?.code === 'string' && err.message ? err.message : GENERIC_ERROR;
}

export default function PushCard({ isAdmin = false }) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getPushState()
      .then((result) => active && setState(result))
      .catch(() => active && setState('unavailable'));
    return () => {
      active = false;
    };
  }, []);

  // Sin estado todavía, sin push en el servidor o sin soporte del navegador: la tarjeta no aparece.
  if (state === null || state === 'unavailable' || state === 'unsupported') return null;

  async function run(action) {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  function handleEnable() {
    return run(async () => {
      const result = await enablePush();
      if (result === 'on') {
        setState('on');
        setMessage('Listo, te avisaremos en este dispositivo.');
      } else if (result === 'blocked') {
        setState('blocked');
      } else {
        setMessage('No se activaron. Puedes intentarlo de nuevo cuando quieras.');
      }
    });
  }

  function handleDisable() {
    return run(async () => {
      await disablePush();
      setState('off');
      setMessage('Notificaciones desactivadas en este dispositivo.');
    });
  }

  function handleTest() {
    return run(async () => {
      const sent = await sendPushTest();
      setMessage(
        sent > 0
          ? 'Te enviamos una notificación de prueba.'
          : 'No pudimos enviarla a este dispositivo. Prueba desactivar y activar de nuevo.'
      );
    });
  }

  const mutedText = { margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--color-muted)' };

  return (
    <div className="card">
      <h3 style={{ margin: '0 0 0.25rem' }}>Notificaciones</h3>

      {state === 'ios-install' && (
        <>
          <p style={mutedText}>
            En iPhone y iPad, primero agrega la app a tu pantalla de inicio y ábrela desde ahí para poder activarlas.
          </p>
          <Link className="btn btn-ghost btn-small" to="/instalar">
            Ver cómo instalarla
          </Link>
        </>
      )}

      {state === 'blocked' && (
        <p style={{ ...mutedText, marginBottom: 0 }}>
          Las notificaciones están bloqueadas en este dispositivo. Puedes permitirlas desde los ajustes del navegador o
          de la app y volver aquí.
        </p>
      )}

      {state === 'off' && (
        <>
          <p style={mutedText}>
            {isAdmin
              ? 'Te avisamos de nuevos registros en la app y de problemas del sistema.'
              : 'Te avisamos de tus reservaciones, recordatorios y cambios en tus clases.'}
          </p>
          <button type="button" className="btn btn-primary btn-small" onClick={handleEnable} disabled={busy}>
            {busy ? 'Activando…' : 'Activar notificaciones'}
          </button>
        </>
      )}

      {state === 'on' && (
        <>
          <p style={mutedText}>Las notificaciones están activadas en este dispositivo.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost btn-small" onClick={handleTest} disabled={busy}>
              Enviar prueba
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={handleDisable} disabled={busy}>
              Desactivar
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="error-banner" style={{ marginTop: '0.75rem' }}>
          {error}
        </div>
      )}
      {message && (
        <div className="error-banner notice-ok" style={{ marginTop: '0.75rem' }}>
          {message}
        </div>
      )}
    </div>
  );
}
