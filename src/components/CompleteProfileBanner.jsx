import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HIDDEN_ON = ['/profile', '/register', '/login', '/instalar', '/forgot-password', '/reset-password'];

/** Invita a completar los datos del perfil mientras /me/ diga que faltan (profile_complete === false). */
export default function CompleteProfileBanner() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user || user.profile_complete !== false || HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className="complete-banner">
      <span>Completa tus datos para que podamos cuidarte mejor en clase.</span>
      <Link className="btn btn-primary btn-small" to="/profile#mis-datos">
        Completar
      </Link>
    </div>
  );
}
