/**
 * 10 puntos representan el % de ocupación de la clase (no el número exacto
 * de lugares — más fácil de leer de un vistazo). Semáforo:
 *   verde  = disponible (≤25% ocupado)
 *   ámbar  = pocos lugares (25-75% ocupado)
 *   rojo   = últimos lugares (>75% ocupado)
 */
export default function CapacityDots({ capacity, spotsAvailable }) {
  const taken = Math.max(capacity - spotsAvailable, 0);
  const occupancyRatio = capacity > 0 ? taken / capacity : 0;
  const filledDots = Math.round(occupancyRatio * 10);

  let stateClass = 'state-available';
  if (occupancyRatio > 0.75) {
    stateClass = 'state-full';
  } else if (occupancyRatio > 0.25) {
    stateClass = 'state-limited';
  }

  const label = spotsAvailable > 0 ? `${spotsAvailable} de ${capacity} lugares disponibles` : 'Sin cupo';

  return (
    <span className={`dot-grid ${stateClass}`} aria-label={label} title={label}>
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} className={`dot${index < filledDots ? ' filled' : ''}`} />
      ))}
    </span>
  );
}
