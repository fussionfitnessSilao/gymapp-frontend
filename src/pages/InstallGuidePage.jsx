import { useState } from 'react';

function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

const STEPS = {
  ios: [
    'Abre este sitio en Safari (no funciona igual en Chrome dentro de iPhone/iPad).',
    'Toca el ícono de compartir — el cuadrito con la flecha hacia arriba, abajo al centro de la pantalla.',
    'Desliza la lista de opciones y toca "Agregar a inicio".',
    'Toca "Agregar" arriba a la derecha. Listo — el ícono aparece en tu pantalla de inicio como una app.',
  ],
  android: [
    'Abre este sitio en Chrome.',
    'Toca los tres puntos (⋮) arriba a la derecha, el menú de Chrome.',
    'Toca "Agregar a pantalla de inicio" (o "Instalar app", según tu versión de Chrome).',
    'Confirma tocando "Agregar" o "Instalar". Listo — el ícono aparece en tu pantalla de inicio.',
  ],
};

const LABELS = { ios: 'iPhone / iPad', android: 'Android' };

export default function InstallGuidePage() {
  const [platform, setPlatform] = useState(detectPlatform);
  const steps = platform === 'other' ? null : STEPS[platform];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Agrega la app a tu pantalla de inicio</h1>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <p className="subtitle" style={{ marginBottom: '1.25rem' }}>
          Así puedes abrir la app directo desde tu celular, como cualquier otra — sin escribir la dirección cada vez.
        </p>

        {platform !== 'other' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {Object.keys(LABELS).map((key) => (
              <button
                key={key}
                type="button"
                className={`btn btn-small ${platform === key ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPlatform(key)}
              >
                {LABELS[key]}
              </button>
            ))}
          </div>
        )}

        {steps ? (
          <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.7 }}>
            {steps.map((step, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <div>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>
              No detectamos si usas iPhone o Android — elige tu tipo de celular para ver los pasos:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {Object.keys(LABELS).map((key) => (
                <button key={key} type="button" className="btn btn-primary" onClick={() => setPlatform(key)}>
                  {LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
