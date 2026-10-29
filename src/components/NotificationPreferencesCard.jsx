import { useEffect, useState } from 'react';
import { fetchNotificationPreferences, saveNotificationPreferences } from '../api/notifications';

const GENERIC_ERROR = 'No pudimos guardar el cambio. Inténtalo de nuevo en un momento.';

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'push', label: 'Notificación' },
];

const mutedText = { margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)' };

// Los errores de la API traen `code` de texto y un mensaje para la persona.
function errorText(err) {
  return typeof err?.code === 'string' && err.message ? err.message : GENERIC_ERROR;
}

function Row({ item, saving, onToggle }) {
  return (
    <div style={{ padding: '0.6rem 0', borderTop: '1px solid var(--color-border, rgba(128, 128, 128, 0.25))' }}>
      <div style={{ fontWeight: 600 }}>{item.label}</div>
      <p style={mutedText}>{item.description}</p>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
        {CHANNELS.map(({ key, label }) => {
          const other = key === 'whatsapp' ? 'push' : 'whatsapp';
          // En los avisos importantes no se puede apagar el último canal encendido.
          const lastOne = item.required && item[key] && !item[other];
          return (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={item[key]}
                disabled={saving || lastOne}
                onChange={() => onToggle(item, key)}
              />
              {label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** Tarjeta del Perfil: qué avisos quiere recibir el cliente y por qué canal. Cada cambio se guarda al instante. */
export default function NotificationPreferencesCard() {
  const [items, setItems] = useState(null);
  const [savingType, setSavingType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchNotificationPreferences()
      .then((data) => active && setItems(data.results))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, []);

  // Sin datos todavía (o si no se pudieron cargar) la tarjeta no aparece.
  if (!items || items.length === 0) return null;

  async function handleToggle(item, channel) {
    const next = { ...item, [channel]: !item[channel] };
    setError(null);
    setSavingType(item.type);
    setItems((current) => current.map((row) => (row.type === item.type ? next : row))); // se ve de inmediato
    try {
      const data = await saveNotificationPreferences([{ type: next.type, whatsapp: next.whatsapp, push: next.push }]);
      setItems(data.results);
    } catch (err) {
      setItems((current) => current.map((row) => (row.type === item.type ? item : row)));
      setError(errorText(err));
    } finally {
      setSavingType(null);
    }
  }

  const important = items.filter((item) => item.required);
  const optional = items.filter((item) => !item.required);

  return (
    <div className="card">
      <h3 style={{ margin: '0 0 0.25rem' }}>Tus avisos</h3>
      <p style={{ ...mutedText, marginBottom: '0.5rem' }}>
        Elige cuáles quieres recibir y por dónde. Los importantes siempre te llegan por al menos un canal: si no tienes
        las notificaciones activas en tu dispositivo, te los mandamos por WhatsApp.
      </p>

      <h4 style={{ margin: '0.75rem 0 0', fontSize: '0.95rem' }}>Importantes</h4>
      {important.map((item) => (
        <Row key={item.type} item={item} saving={savingType === item.type} onToggle={handleToggle} />
      ))}

      <h4 style={{ margin: '0.75rem 0 0', fontSize: '0.95rem' }}>Opcionales</h4>
      {optional.map((item) => (
        <Row key={item.type} item={item} saving={savingType === item.type} onToggle={handleToggle} />
      ))}

      {error && (
        <div className="error-banner" style={{ marginTop: '0.75rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}
