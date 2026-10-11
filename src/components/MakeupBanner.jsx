import { useEffect, useState } from 'react';
import { fetchMakeups } from '../api/makeups';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

/**
 * Aviso de reposiciones disponibles. Una reposición permite reservar una clase fuera del horario fijo de la
 * membresía; se otorga cuando el estudio cancela una de sus clases. `refreshKey` vuelve a consultarlas (por
 * ejemplo después de reservar con una).
 */
export default function MakeupBanner({ refreshKey = 0 }) {
  const { user } = useAuth();
  const [makeups, setMakeups] = useState([]);

  useEffect(() => {
    if (user?.role !== 'client') return undefined;
    let active = true;
    fetchMakeups()
      .then((data) => {
        if (active) setMakeups(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => {
        if (active) setMakeups([]); // el aviso es un extra: si falla la consulta, simplemente no se muestra
      });
    return () => {
      active = false;
    };
  }, [user?.role, refreshKey]);

  if (makeups.length === 0) return null;

  const nextExpiry = formatDate(makeups[0].expires_on);
  return (
    <div className="info-banner" role="status">
      {makeups.length === 1
        ? `Tienes 1 reposición disponible: puedes reservar otra clase en cualquier horario hasta el ${nextExpiry}.`
        : `Tienes ${makeups.length} reposiciones disponibles: puedes reservar otras clases en cualquier horario. La próxima vence el ${nextExpiry}.`}
    </div>
  );
}
