import { useEffect, useState } from 'react';
import CapacityDots from '../components/CapacityDots';
import { createReservation } from '../api/reservations';
import { fetchSessions } from '../api/sessions';
import { joinWaitlist, leaveWaitlist } from '../api/waitlist';
import { GENERAL_CANCELLATION_HOURS, describeCancellation, useNow } from '../cancellation';

const ERROR_MESSAGES = {
  MEMBERSHIP_EXPIRED: 'No tienes una membresía vigente. Habla con recepción.',
  NO_CLASSES_REMAINING: 'No te quedan clases en tu paquete actual.',
  SESSION_FULL: 'Esta clase ya no tiene cupo.',
  ALREADY_RESERVED: 'Ya tienes una reservación para esta clase.',
};

function formatDayLabel(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function groupByDay(sessions) {
  const groups = {};
  for (const session of sessions) {
    const dayKey = session.start_datetime.slice(0, 10);
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(session);
  }
  return Object.entries(groups).sort(([a], [b]) => (a < b ? -1 : 1));
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionErrors, setActionErrors] = useState({});
  const [reservingId, setReservingId] = useState(null);
  const [waitlistBusyId, setWaitlistBusyId] = useState(null);
  const now = useNow();

  async function loadSessions() {
    setLoading(true);
    setLoadError(null);
    try {
      const today = new Date();
      const twoWeeksOut = new Date(today);
      twoWeeksOut.setDate(today.getDate() + 14);
      const data = await fetchSessions({
        date_from: today.toISOString().slice(0, 10),
        date_to: twoWeeksOut.toISOString().slice(0, 10),
      });
      setSessions(data.results || []);
    } catch (err) {
      setLoadError(err.message || 'No pudimos cargar el horario.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleReserve(sessionId) {
    setReservingId(sessionId);
    setActionErrors((prev) => ({ ...prev, [sessionId]: null }));
    try {
      await createReservation(sessionId);
      await loadSessions();
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [sessionId]: ERROR_MESSAGES[err.code] || err.message || 'No pudimos completar tu reservación.',
      }));
    } finally {
      setReservingId(null);
    }
  }

  async function handleWaitlist(sessionId, action) {
    setWaitlistBusyId(sessionId);
    setActionErrors((prev) => ({ ...prev, [sessionId]: null }));
    try {
      await (action === 'join' ? joinWaitlist(sessionId) : leaveWaitlist(sessionId));
      await loadSessions();
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [sessionId]: ERROR_MESSAGES[err.code] || err.message || 'No pudimos actualizar la lista de espera.',
      }));
    } finally {
      setWaitlistBusyId(null);
    }
  }

  if (loading) return <div className="page-loading">Cargando horario…</div>;

  const grouped = groupByDay(sessions);

  return (
    <div className="page">
      <div className="page-header">
        <p>Las próximas clases.</p>
      </div>

      {loadError && <div className="error-banner">{loadError}</div>}

      {grouped.length === 0 && !loadError && (
        <div className="empty-state">
          <h3>No hay clases programadas</h3>
          <p>Vuelve a revisar más tarde.</p>
        </div>
      )}

      {grouped.map(([day, daySessions]) => (
        <div className="schedule-day" key={day}>
          <div className="schedule-day-label">{formatDayLabel(day)}</div>
          {daySessions.map((session) => (
            <div className="card session-card" key={session.id}>
              <div className="session-time">{formatTime(session.start_datetime)}</div>
              <div className="session-info">
                <h3>{session.name}</h3>
                <div className="session-meta">
                  <span>{session.instructor_name}</span>
                  <CapacityDots capacity={session.capacity} spotsAvailable={session.spots_available} />
                  {(session.my_waitlist_position != null ||
                    (session.spots_available <= 0 && session.can_join_waitlist)) && (
                    <span className="badge badge-accent">Lista de espera</span>
                  )}
                  <CancellationHint session={session} now={now} />
                  {session.is_special_event && <span className="badge badge-accent">Evento especial</span>}
                </div>
                {session.my_waitlist_position != null && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    En lista de espera. Si alguien cancela con tiempo, tu lugar se reserva solo y te avisamos.
                  </div>
                )}
                {actionErrors[session.id] && <div className="error-banner">{actionErrors[session.id]}</div>}
              </div>
              <div className="session-actions">
                <ReserveButton
                  session={session}
                  reserving={reservingId === session.id}
                  onReserve={() => handleReserve(session.id)}
                  waitlistBusy={waitlistBusyId === session.id}
                  onJoinWaitlist={() => handleWaitlist(session.id, 'join')}
                  onLeaveWaitlist={() => handleWaitlist(session.id, 'leave')}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const RESERVED_STATUS_LABELS = {
  confirmed: 'Reservada',
  attended: 'Asististe',
  no_show: 'No show',
};

// Solo para clases con un límite distinto al general: hasta cuándo (o cuánto falta) para cancelar sin penalización.
function CancellationHint({ session, now }) {
  if (session.cancellation_window_hours == null || session.cancellation_window_hours === GENERAL_CANCELLATION_HOURS) {
    return null;
  }
  const { short } = describeCancellation(session.start_datetime, session.cancellation_window_hours, now);
  return short ? <span>{short}</span> : null;
}

function ReserveButton({ session, reserving, onReserve, waitlistBusy, onJoinWaitlist, onLeaveWaitlist }) {
  if (session.my_reservation_status && session.my_reservation_status !== 'cancelled') {
    return (
      <span className={`badge badge-status-${session.my_reservation_status}`}>
        {RESERVED_STATUS_LABELS[session.my_reservation_status]}
      </span>
    );
  }
  if (session.my_waitlist_position != null) {
    return (
      <button type="button" className="btn btn-ghost btn-small" onClick={onLeaveWaitlist} disabled={waitlistBusy}>
        {waitlistBusy ? 'Cancelando…' : 'Cancelar'}
      </button>
    );
  }
  if (session.spots_available <= 0) {
    if (session.can_join_waitlist) {
      // Igual que una reservación normal; la etiqueta "Lista de espera" va junto al cupo, en la info de la clase.
      return (
        <button type="button" className="btn btn-primary btn-small" onClick={onJoinWaitlist} disabled={waitlistBusy}>
          {waitlistBusy ? 'Reservando…' : 'Reservar'}
        </button>
      );
    }
    return (
      <button type="button" className="btn btn-ghost btn-small" disabled>
        Sin cupo
      </button>
    );
  }
  return (
    <button type="button" className="btn btn-primary btn-small" onClick={onReserve} disabled={reserving}>
      {reserving ? 'Reservando…' : 'Reservar'}
    </button>
  );
}
