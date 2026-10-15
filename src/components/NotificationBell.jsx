import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { fetchNotifications } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import '../notifications.css';

// Evento que lanza el centro de notificaciones al marcar todo como leído, para que la campana se quite al momento.
export const NOTIFICATIONS_CHANGED = 'notifications-changed';

/**
 * Campana de la barra: aparece SOLO cuando hay avisos por leer (con cuántos) y lleva al centro de notificaciones.
 * Se actualiza al cambiar de pantalla, al volver a la app y cada minuto.
 */
export default function NotificationBell() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);
  const isClient = user?.role === 'client';

  const refresh = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setUnread(data.unread_count || 0);
    } catch {
      // Sin red o sesión vencida: se deja lo que había; no es motivo para avisar.
    }
  }, []);

  useEffect(() => {
    if (!isClient) return undefined;
    refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    const timer = setInterval(onVisible, 60000);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
    };
  }, [isClient, refresh, pathname]);

  if (!isClient || unread === 0) return null;

  return (
    <NavLink to="/notificaciones" className="navbar-bell" aria-label={`${unread} notificaciones por leer`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      <span className="navbar-bell-count">{unread > 9 ? '9+' : unread}</span>
    </NavLink>
  );
}
