import { useEffect, useState } from 'react';
import CapacityDots from '../components/CapacityDots';
import { createReservation } from '../api/reservations';
import { fetchSessions } from '../api/sessions';

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

  if (loading) return <div className="page-loading">Cargando horario…</div>;

  const grouped = groupByDay(sessions);

  return (
    <div className="page">
      <div className="page-header">
        <p>Las próximas dos semanas de clases.</p>
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
                  {session.is_special_event && <span className="badge badge-accent">Evento especial</span>}
                </div>
                {actionErrors[session.id] && <div className="error-banner">{actionErrors[session.id]}</div>}
              </div>
              <div className="session-actions">
                <ReserveButton
                  session={session}
                  reserving={reservingId === session.id}
                  onReserve={() => handleReserve(session.id)}
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

function ReserveButton({ session, reserving, onReserve }) {
  if (session.my_reservation_status && session.my_reservation_status !== 'cancelled') {
    return (
      <span className={`badge badge-status-${session.my_reservation_status}`}>
        {RESERVED_STATUS_LABELS[session.my_reservation_status]}
      </span>
    );
  }
  if (session.spots_available <= 0) {
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
