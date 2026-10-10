import { useEffect, useState } from 'react';
import { cancelReservation, fetchReservations } from '../api/reservations';
import { fetchMyWaitlist, leaveWaitlist } from '../api/waitlist';
import { cancellationHours, describeCancellation, useNow } from '../cancellation';

// Debe coincidir con HOLD_RELEASE_HOURS del backend (apps/reservations/fixed_classes.py): un lugar provisional se
// guarda hasta estas horas antes de la clase si la membresía no se renueva.
const HOLD_RELEASE_HOURS = 12;

const STATUS_LABELS = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  no_show: 'No show',
  attended: 'Asistió',
};

function renewalDeadlineText(classStart) {
  const deadline = new Date(new Date(classStart).getTime() - HOLD_RELEASE_HOURS * 60 * 60 * 1000);
  return deadline.toLocaleString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

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

export default function MyReservationsPage() {
  const [scope, setScope] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [leavingId, setLeavingId] = useState(null);
  const now = useNow();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);

  async function load(currentScope) {
    setLoading(true);
    setError(null);
    try {
      // La lista de espera solo aplica a lo próximo; si falla no debe tumbar las reservaciones.
      const [data, waitlistData] = await Promise.all([
        fetchReservations({ scope: currentScope }),
        currentScope === 'upcoming' ? fetchMyWaitlist().catch(() => ({ results: [] })) : Promise.resolve({ results: [] }),
      ]);
      setReservations(data.results || []);
      setWaitlist(waitlistData.results || []);
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
          : 'Se canceló fuera del límite para cancelar sin penalización, así que se registró como no-show.'
      );
      await load(scope);
    } catch (err) {
      setError(err.message || 'No pudimos cancelar tu reservación.');
    } finally {
      setCancellingId(null);
    }
  }

  async function handleLeaveWaitlist(entry) {
    setLeavingId(entry.id);
    setError(null);
    try {
      await leaveWaitlist(entry.class_session);
      setResultMessage('Saliste de la lista de espera.');
      await load(scope);
    } catch (err) {
      setError(err.message || 'No pudimos sacarte de la lista de espera.');
    } finally {
      setLeavingId(null);
    }
  }

  if (loading) return <div className="page-loading">Cargando…</div>;

  return (
    <div className="page">
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

      {reservations.length === 0 && waitlist.length === 0 && !error && (
        <div className="empty-state">
          <h3>{scope === 'upcoming' ? 'No tienes reservas próximas' : 'Aún no tienes historial'}</h3>
          <p>{scope === 'upcoming' ? 'Ve al horario para reservar tu próxima clase.' : 'Tus clases pasadas van a aparecer aquí.'}</p>
        </div>
      )}

      {scope === 'upcoming' && waitlist.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 0.5rem' }}>En lista de espera</h3>
          {waitlist.map((entry) => (
            <div className="card reservation-card" key={entry.id}>
              <div className="reservation-card-top">
                <div>
                  <h3>{entry.class_session_name}</h3>
                  <div className="reservation-date">{formatDateTime(entry.class_session_start)}</div>
                </div>
                <span className="badge badge-accent">En espera</span>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                Si alguien cancela con tiempo, tu lugar se reserva solo y te avisamos.
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => handleLeaveWaitlist(entry)}
                  disabled={leavingId === entry.id}
                >
                  {leavingId === entry.id ? 'Cancelando…' : 'Cancelar'}
                </button>
              </div>
            </div>
          ))}
          {reservations.length > 0 && <h3 style={{ margin: '1.25rem 0 0.5rem' }}>Reservaciones</h3>}
        </>
      )}

      {reservations.map((reservation) => {
        const cancellation = describeCancellation(
          reservation.class_session_start,
          cancellationHours(reservation),
          now
        );
        const withinWindow = cancellation.open;
        return (
          <div className="card reservation-card" key={reservation.id}>
            <div className="reservation-card-top">
              <div>
                <h3>{reservation.class_session_name}</h3>
                <div className="reservation-date">{formatDateTime(reservation.class_session_start)}</div>
              </div>
              <div className="badge-group">
                <span className={`badge badge-status-${reservation.status}`}>{STATUS_LABELS[reservation.status]}</span>
                {reservation.fixed_seat && (
                  <span className="badge badge-fixed">
                    {reservation.fixed_provisional ? 'Lugar fijo · por renovar' : 'Lugar fijo'}
                  </span>
                )}
              </div>
            </div>

            {scope === 'upcoming' && reservation.status === 'confirmed' && reservation.fixed_provisional && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                Te guardamos tu lugar. Renueva tu membresía antes del {renewalDeadlineText(reservation.class_session_start)} para
                conservarlo.
              </p>
            )}

            {scope === 'upcoming' && reservation.status === 'confirmed' && (
              <>
                {confirmingId !== reservation.id ? (
                  <div style={{ marginTop: '0.75rem' }}>
                    {withinWindow ? (
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                        {cancellation.text}.
                      </p>
                    ) : (
                      <p className="cancel-warning">
                        Ya pasó el límite para cancelar sin penalización ({cancellation.deadlineText}).
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
                        ? `${cancellation.text}.`
                        : 'Ya pasó el límite para cancelar sin penalización: cancelar ahora se registrará como no-show y no se reembolsará tu clase.'}
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
