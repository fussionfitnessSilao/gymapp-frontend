import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markAllNotificationsRead } from '../api/notifications';
import { NOTIFICATIONS_CHANGED } from '../components/NotificationBell';
import '../notifications.css';

// Título y pantalla a la que lleva cada tipo de aviso.
const KINDS = {
  reservation_confirmation: { title: 'Reservación confirmada', to: '/reservations', action: 'Ver mis reservaciones' },
  class_reminder: { title: 'Recordatorio de clase', to: '/reservations', action: 'Ver mis reservaciones' },
  waitlist_promoted: { title: 'Lugar disponible', to: '/reservations', action: 'Ver mis reservaciones' },
  session_cancelled: { title: 'Clase cancelada', to: '/schedule', action: 'Ver el horario' },
  membership_expiring: { title: 'Tu membresía', to: '/profile', action: 'Ver mi perfil' },
  // Avisos para Admin: no llevan a otra pantalla de la app (el detalle está en el panel de administración).
  admin_system_alert: { title: 'Alerta del sistema' },
  admin_new_client: { title: 'Nuevo registro' },
};

function formatWhen(iso) {
  return new Date(iso).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchNotifications();
        setItems(data.results || []);
        setUnread(data.unread_count || 0);
      } catch (err) {
        setError(err.message || 'No pudimos cargar tus notificaciones.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleMarkAll() {
    setMarking(true);
    setError(null);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnread(0);
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED)); // la campana de la barra se quita
    } catch (err) {
      setError(err.message || 'No pudimos marcarlas como leídas.');
    } finally {
      setMarking(false);
    }
  }

  if (loading) return <div className="page-loading">Cargando notificaciones…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notificaciones</h1>
        {unread > 0 && (
          <button type="button" className="btn btn-ghost btn-small" onClick={handleMarkAll} disabled={marking}>
            {marking ? 'Marcando…' : 'Marcar todas como leídas'}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {items.length === 0 && !error ? (
        <p className="hint">Todavía no tienes notificaciones.</p>
      ) : (
        <ul className="notification-list">
          {items.map((item) => {
            const kind = KINDS[item.type];
            return (
              <li key={item.id} className={`notification ${item.read ? 'read' : 'unread'}`}>
                <div className="notification-head">
                  <strong>{kind?.title || item.title}</strong>
                  <time className="notification-time" dateTime={item.sent_at}>
                    {formatWhen(item.sent_at)}
                  </time>
                </div>
                <p className="notification-message">{item.message}</p>
                {kind?.to && (
                  <Link className="btn btn-ghost btn-small" to={kind.to}>
                    {kind.action}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
