import { NavLink } from 'react-router-dom';
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
        <NavLink to="/reservations" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          Mis reservaciones
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          Perfil
        </NavLink>
      </div>
    </nav>
  );
}
