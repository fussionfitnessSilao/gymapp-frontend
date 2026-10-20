import { NavLink } from 'react-router-dom';
import { ADMIN_URL } from '../adminLink';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-start">
        <span className="navbar-brand">{user.gym_name || 'Estudio'}</span>
        <NotificationBell />
      </div>
      <div className="navbar-links">
        <NavLink to="/schedule" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          Horario
        </NavLink>
        {user.role === 'client' && (
          <NavLink to="/reservations" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Mis reservaciones
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          Perfil
        </NavLink>
        {user.role !== 'client' && (
          // Personal del estudio: abre el panel de administración (inicia sesión allí la primera vez).
          <a className="navbar-link" href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
            Administración
          </a>
        )}
      </div>
    </nav>
  );
}
