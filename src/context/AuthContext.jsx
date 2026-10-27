import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest } from '../api/auth';
import { getTokens, SESSION_EXPIRED_EVENT } from '../api/client';
import {
  clearOfflineData,
  isNetworkError,
  loadOfflineUser,
  OFFLINE_FALLBACK_MS,
  saveOfflineSnapshot,
} from '../offline';
import { detachPushDevice } from '../push';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  // true cuando la app abrió con los datos guardados en el teléfono porque el servidor no respondió.
  const [offline, setOffline] = useState(false);

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
    // Sin conexión (o con internet "a medias") la app abre con los datos guardados en el teléfono para poder
    // ver, por ejemplo, la clave de la puerta. Si el servidor responde después, se usan sus datos.
    const cached = loadOfflineUser();
    const timer = setTimeout(() => {
      if (!cached) return;
      setUser((current) => current || cached);
      setOffline(true);
      setLoading(false);
    }, OFFLINE_FALLBACK_MS);
    fetchMe()
      .then((me) => {
        saveOfflineSnapshot(me);
        setUser(me);
        setOffline(false);
      })
      .catch((err) => {
        if (isNetworkError(err) && cached) {
          setUser((current) => current || cached);
          setOffline(true);
        } else {
          setUser(null);
        }
      })
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
      });
    return () => clearTimeout(timer);
  }, []);

  // Al volver la conexión, se actualiza con los datos reales del servidor.
  useEffect(() => {
    if (!offline) return undefined;
    function retry() {
      fetchMe()
        .then((me) => {
          saveOfflineSnapshot(me);
          setUser(me);
          setOffline(false);
        })
        .catch(() => {});
    }
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [offline]);

  async function login(email, password) {
    const userData = await loginRequest(email, password);
    saveOfflineSnapshot(userData); // reemplaza la copia de quien haya usado antes este teléfono
    setSessionExpired(false);
    setOffline(false);
    setUser(userData);
  }

  async function logout() {
    try {
      await detachPushDevice(); // antes de cerrar sesión, mientras todavía hay token
      await logoutRequest();
    } finally {
      clearOfflineData();
      setSessionExpired(false);
      setOffline(false);
      setUser(null); // cerrar sesión nunca debe quedarse a medias
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, sessionExpired, offline, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
