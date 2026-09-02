import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <span className="navbar-brand">{user.gym_name || 'Estudio'}</span>
      <div className="navbar-links">
        <NavLink to="/schedule" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          Horario
        </NavLink>
        <NavLink to="/reservations" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          Mis reservas
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          Perfil
        </NavLink>
      </div>
    </nav>
  );
}
