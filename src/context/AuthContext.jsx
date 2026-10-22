import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest } from '../api/auth';
import { getTokens, SESSION_EXPIRED_EVENT } from '../api/client';
import { detachPushDevice } from '../push';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Si la sesión caduca (por ejemplo, la app estuvo en segundo plano), se sale del estado "con sesión" y
  // ProtectedRoute manda al login; ahí se explica por qué.
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setSessionExpired(true);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  useEffect(() => {
    const { access } = getTokens();
    if (!access) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const userData = await loginRequest(email, password);
    setSessionExpired(false);
    setUser(userData);
  }

  async function logout() {
    try {
      await detachPushDevice(); // antes de cerrar sesión, mientras todavía hay token
      await logoutRequest();
    } finally {
      setSessionExpired(false);
      setUser(null); // cerrar sesión nunca debe quedarse a medias
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, sessionExpired, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
