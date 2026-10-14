import { useState } from 'react';
import { getThemePreference, setThemePreference } from '../theme';

const OPTIONS = [
  { value: 'auto', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export default function ThemeCard() {
  const [preference, setPreference] = useState(getThemePreference);

  function choose(value) {
    setPreference(value);
    setThemePreference(value);
  }

  return (
    <div className="card">
      <h3 style={{ margin: '0 0 0.25rem' }}>Apariencia</h3>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
        Automático sigue el modo de tu dispositivo.
      </p>
      <div role="group" aria-label="Apariencia" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn btn-small ${preference === option.value ? 'btn-primary' : 'btn-ghost'}`}
            aria-pressed={preference === option.value}
            onClick={() => choose(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
