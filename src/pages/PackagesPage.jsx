import { useEffect, useState } from 'react';
import { fetchPackages } from '../api/packages';
import { useAuth } from '../context/AuthContext';
import { STUDIO_WEBSITE_URL } from '../studioConfig';
import { packageMessage, packagesInquiryMessage, whatsappConfigured, whatsappUrl } from '../whatsapp';
import '../help.css';

const priceFormat = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return null;
  const amount = Number(price);
  return Number.isFinite(amount) ? priceFormat.format(amount) : null;
}

export default function PackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState(null); // null = cargando
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPackages()
      .then((data) => {
        if (!cancelled) setPackages(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const inquiryButton = whatsappConfigured ? (
    <div className="help-links">
      <a className="btn btn-primary" href={whatsappUrl(packagesInquiryMessage(user))} target="_blank" rel="noopener noreferrer">
        Preguntar por WhatsApp
      </a>
    </div>
  ) : null;

  let body;
  if (failed) {
    body = (
      <div className="card help-card">
        <h2>No pudimos cargar los paquetes</h2>
        <p>Revisa tu conexión e intenta de nuevo en un momento.</p>
        {inquiryButton}
      </div>
    );
  } else if (packages === null) {
    body = <div className="card help-card"><p>Cargando paquetes…</p></div>;
  } else if (packages.length === 0) {
    body = (
      <div className="card help-card">
        <h2>Pronto publicaremos nuestros paquetes</h2>
        {whatsappConfigured ? <p>Mientras tanto, pregúntanos por WhatsApp y te contamos las opciones.</p> : <p>Mientras tanto, pregunta directamente en recepción.</p>}
        {inquiryButton}
      </div>
    );
  } else {
    body = (
      <div className="package-list">
        {packages.map((pack) => {
          const price = formatPrice(pack.price);
          return (
            <div className="card package-card" key={pack.id}>
              <div className="package-info">
                <div className="package-name">{pack.name}</div>
                {pack.description && <div className="package-detail">{pack.description}</div>}
                {price && <div className="package-price">{price}</div>}
              </div>
              {whatsappConfigured ? (
                <a
                  className="btn btn-primary"
                  href={whatsappUrl(packageMessage(user, pack.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contratar
                </a>
              ) : (
                <button type="button" className="btn btn-primary" disabled>
                  Contratar
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Paquetes</h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Elige el que más te acomode y te escribimos por WhatsApp para dejarlo listo.
        </p>
        {STUDIO_WEBSITE_URL && (
          <p style={{ marginTop: '0.5rem' }}>
            <a href={STUDIO_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
              Conoce más del estudio
            </a>
          </p>
        )}
      </div>
      {body}
    </div>
  );
}
