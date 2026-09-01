import { useEffect, useState } from 'react';
import { cancelReservation, fetchReservations } from '../api/reservations';

const STATUS_LABELS = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  no_show: 'No show',
  attended: 'Asistió',
};

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function hoursUntil(dateStr) {
  return (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60);
}

export default function MyReservationsPage() {
  const [scope, setScope] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);

  async function load(currentScope) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReservations({ scope: currentScope });
      setReservations(data.results || []);
    } catch (err) {
      setError(err.message || 'No pudimos cargar tus reservaciones.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(scope);
    setConfirmingId(null);
    setResultMessage(null);
  }, [scope]);

  async function handleConfirmCancel(id) {
    setCancellingId(id);
    try {
      const updated = await cancelReservation(id);
      setConfirmingId(null);
      setResultMessage(
        updated.status === 'cancelled'
          ? 'Tu reservación se canceló sin penalización.'
          : 'Se canceló fuera de la ventana de 2 horas, así que se registró como no-show.'
      );
      await load(scope);
    } catch (err) {
      setError(err.message || 'No pudimos cancelar tu reservación.');
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) return <div className="page-loading">Cargando…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mis reservas</h1>
      </div>

      <div className="tabs">
        <button type="button" className={`tab${scope === 'upcoming' ? ' active' : ''}`} onClick={() => setScope('upcoming')}>
          Próximas
        </button>
        <button type="button" className={`tab${scope === 'past' ? ' active' : ''}`} onClick={() => setScope('past')}>
          Pasadas
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {resultMessage && (
        <div className="error-banner" style={{ background: '#e8f0ec', color: 'var(--color-primary-dark)' }}>
          {resultMessage}
        </div>
      )}

      {reservations.length === 0 && !error && (
        <div className="empty-state">
          <h3>{scope === 'upcoming' ? 'No tienes reservas próximas' : 'Aún no tienes historial'}</h3>
          <p>{scope === 'upcoming' ? 'Ve al horario para reservar tu próxima clase.' : 'Tus clases pasadas van a aparecer aquí.'}</p>
        </div>
      )}

      {reservations.map((reservation) => {
        const withinWindow = hoursUntil(reservation.class_session_start) >= 2;
        return (
          <div className="card reservation-card" key={reservation.id}>
            <div className="reservation-card-top">
              <div>
                <h3>{reservation.class_session_name}</h3>
                <div className="reservation-date">{formatDateTime(reservation.class_session_start)}</div>
              </div>
              <span className={`badge badge-status-${reservation.status}`}>{STATUS_LABELS[reservation.status]}</span>
            </div>

            {scope === 'upcoming' && reservation.status === 'confirmed' && (
              <>
                {confirmingId !== reservation.id ? (
                  <div style={{ marginTop: '0.75rem' }}>
                    {!withinWindow && (
                      <p className="cancel-warning">
                        Ya no se puede cancelar sin penalización — faltan menos de 2 horas para la clase.
                      </p>
                    )}
                    <button type="button" className="btn btn-danger btn-small" onClick={() => setConfirmingId(reservation.id)}>
                      {withinWindow ? 'Cancelar' : 'Cancelar de todas formas'}
                    </button>
                  </div>
                ) : (
                  <div className={`cancel-confirm ${withinWindow ? 'within-window' : 'outside-window'}`}>
                    <p>
                      {withinWindow
                        ? 'Puedes cancelar sin penalización — faltan más de 2 horas para la clase.'
                        : 'Faltan menos de 2 horas para la clase: cancelar ahora se registrará como no-show y no se reembolsará tu clase.'}
                    </p>
                    <div className="cancel-confirm-actions">
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => handleConfirmCancel(reservation.id)}
                        disabled={cancellingId === reservation.id}
                      >
                        {cancellingId === reservation.id ? 'Cancelando…' : 'Confirmar cancelación'}
                      </button>
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmingId(null)}>
                        Mantener reserva
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
