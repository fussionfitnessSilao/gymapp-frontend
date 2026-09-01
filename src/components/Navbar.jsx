import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">Estudio</span>
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
        <button type="button" className="btn btn-ghost btn-small" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
