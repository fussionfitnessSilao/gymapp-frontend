/** Tarjeta con la clave de la puerta (la usan el Perfil con conexión y la copia guardada sin conexión). */
export default function DoorCodeCard({ code, note }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3 style={{ marginBottom: '0.75rem' }}>Código de la puerta</h3>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'var(--color-primary-dark)',
          userSelect: 'all',
        }}
      >
        {code}
      </div>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
        Márcalo en el teclado de la puerta para entrar.
      </p>
      {note && <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{note}</p>}
    </div>
  );
}
