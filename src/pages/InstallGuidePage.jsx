import { useState } from 'react';

function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

// Cada paso puede llevar una captura de pantalla opcional: se guardan en public/capturas/ (se sirven desde
// /capturas/...). Si el archivo no existe, el paso se muestra solo con su texto.
const STEPS = {
  ios: [
    {
      text: 'Abre este sitio en Safari (no funciona igual en Chrome dentro de iPhone/iPad).',
      image: '/capturas/ios-1.png',
    },
    {
      text: 'Toca el ícono de compartir — el cuadrito con la flecha hacia arriba, abajo al centro de la pantalla.',
      image: '/capturas/ios-2.png',
    },
    {
      text: 'Desliza la lista de opciones y toca "Agregar a inicio".',
      image: '/capturas/ios-3.png',
    },
    {
      text: 'Toca "Agregar" arriba a la derecha. Listo — el ícono aparece en tu pantalla de inicio como una app.',
      image: '/capturas/ios-4.png',
    },
  ],
  android: [
    {
      text: 'Abre este sitio en Chrome.',
      image: '/capturas/android-1.png',
    },
    {
      text: 'Toca los tres puntos (⋮) arriba a la derecha, el menú de Chrome.',
      image: '/capturas/android-2.png',
    },
    {
      text: 'Toca "Agregar a pantalla de inicio" (o "Instalar app", según tu versión de Chrome).',
      image: '/capturas/android-3.png',
    },
    {
      text: 'Confirma tocando "Agregar" o "Instalar". Listo — el ícono aparece en tu pantalla de inicio.',
      image: '/capturas/android-4.png',
    },
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
              <li key={index} style={{ marginBottom: '1rem' }}>
                {step.text}
                <img
                  src={step.image}
                  alt={`Captura del paso ${index + 1}`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: 260,
                    marginTop: '0.5rem',
                    borderRadius: 12,
                    border: '1px solid var(--color-border, #ddd)',
                  }}
                />
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
