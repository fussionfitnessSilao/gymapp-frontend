import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canPromptInstall, isAndroid, isInstalledApp, isIos, onInstallPromptChange, promptInstall } from '../pwa';

// Perfil e /instalar ya explican cómo instalarla; en las pantallas de acceso todavía no hay sesión.
const HIDDEN_ON = ['/profile', '/register', '/login', '/instalar', '/privacidad', '/forgot-password', '/reset-password'];

/**
 * Aviso fijo (sin cerrar) para quien usa la app desde el navegador del celular: la invita a instalarla. Con Chrome en
 * Android el botón lanza la instalación directa; en iPhone, o si el navegador no la ofrece, lleva a la guía /instalar.
 * Desaparece solo cuando la app se abre ya instalada.
 */
export default function InstallBanner() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [, refresh] = useState(0);

  // Chrome puede avisar que ya se puede instalar después de que se pintó la página.
  useEffect(() => onInstallPromptChange(() => refresh((count) => count + 1)), []);

  const onPhone = isIos() || isAndroid();
  if (!user || user.role !== 'client' || !onPhone || isInstalledApp() || HIDDEN_ON.includes(pathname)) return null;

  return (
    <div className="complete-banner">
      <span>Instala la app en tu celular para abrirla directo y recibir avisos de tus clases.</span>
      {canPromptInstall() ? (
        <button type="button" className="btn btn-primary btn-small" onClick={promptInstall}>
          Instalar
        </button>
      ) : (
        <Link className="btn btn-primary btn-small" to="/instalar">
          Instalar
        </Link>
      )}
    </div>
  );
}
