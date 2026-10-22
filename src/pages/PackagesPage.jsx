import { useAuth } from '../context/AuthContext';
import { PACKAGES, STUDIO_WEBSITE_URL } from '../studioConfig';
import { packageMessage, packagesInquiryMessage, whatsappConfigured, whatsappUrl } from '../whatsapp';
import '../help.css';

export default function PackagesPage() {
  const { user } = useAuth();

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

      {PACKAGES.length > 0 ? (
        <div className="package-list">
          {PACKAGES.map((pack) => (
            <div className="card package-card" key={pack.name}>
              <div className="package-info">
                <div className="package-name">{pack.name}</div>
                {pack.detail && <div className="package-detail">{pack.detail}</div>}
                {pack.price && <div className="package-price">{pack.price}</div>}
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
          ))}
        </div>
      ) : (
        <div className="card help-card">
          <h2>Pronto publicaremos nuestros paquetes</h2>
          {whatsappConfigured ? (
            <>
              <p>Mientras tanto, pregúntanos por WhatsApp y te contamos las opciones.</p>
              <div className="help-links">
                <a
                  className="btn btn-primary"
                  href={whatsappUrl(packagesInquiryMessage(user))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preguntar por WhatsApp
                </a>
              </div>
            </>
          ) : (
            <p>Mientras tanto, pregunta directamente en recepción.</p>
          )}
        </div>
      )}
    </div>
  );
}
