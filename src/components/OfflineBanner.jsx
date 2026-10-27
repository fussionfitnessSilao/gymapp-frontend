import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadOfflineDoor } from '../offline';

/** Aviso cuando la app se abrió sin poder hablar con el servidor (sin internet o servidor lento): lleva a la clave guardada. */
export default function OfflineBanner() {
  const { user, offline } = useAuth();
  const { pathname } = useLocation();

  if (!user || !offline || pathname === '/profile') return null;

  const door = loadOfflineDoor();
  const hasDoorCode = door && !door.expired;

  return (
    <div className="complete-banner">
      <span>Sin conexión con el servidor.{hasDoorCode ? ' Tu clave de la puerta está guardada en tu perfil.' : ''}</span>
      {hasDoorCode && (
        <Link className="btn btn-primary btn-small" to="/profile">
          Ver clave
        </Link>
      )}
    </div>
  );
}
