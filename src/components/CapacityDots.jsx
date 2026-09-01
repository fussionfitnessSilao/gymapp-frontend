/**
 * Cada punto representa un lugar en la sesión: lleno (ocupado) o hueco
 * (disponible). Con más de 12 lugares se resume con un contador de texto en
 * vez de dibujar decenas de puntos.
 */
export default function CapacityDots({ capacity, spotsAvailable }) {
  const taken = Math.max(capacity - spotsAvailable, 0);

  if (capacity > 12) {
    return (
      <span className="dot-grid" aria-label={`${spotsAvailable} de ${capacity} lugares disponibles`}>
        <span className="dot filled" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          {spotsAvailable}/{capacity}
        </span>
      </span>
    );
  }

  return (
    <span className="dot-grid" aria-label={`${spotsAvailable} de ${capacity} lugares disponibles`}>
      {Array.from({ length: capacity }, (_, index) => (
        <span key={index} className={`dot${index < taken ? ' filled' : ''}`} />
      ))}
    </span>
  );
}
