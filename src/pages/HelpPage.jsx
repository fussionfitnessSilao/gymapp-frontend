import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { STUDIO_WEBSITE_URL } from '../studioConfig';
import { bugReportMessage, helpMessage, whatsappConfigured, whatsappUrl } from '../whatsapp';
import '../help.css';

export default function HelpPage() {
  const { user } = useAuth();
  const { state } = useLocation();
  // La barra pasa la pantalla desde la que se tocó "?", para incluirla en el reporte de error.
  const fromPath = state?.from || null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ayuda</h1>
      </div>

      <div className="help-stack">
        <div className="card help-card">
          <h2>Escríbenos</h2>
          {whatsappConfigured ? (
            <>
              <p>¿Dudas con tu cuenta, una reservación o tu membresía? Te respondemos por WhatsApp.</p>
              <div className="help-links">
                <a className="btn btn-primary" href={whatsappUrl(helpMessage(user))} target="_blank" rel="noopener noreferrer">
                  Escribir por WhatsApp
                </a>
              </div>
            </>
          ) : (
            <p>Por ahora, pregunta directamente en recepción.</p>
          )}
        </div>

        <div className="card help-card">
          <h2>Reportar un error</h2>
          {whatsappConfigured ? (
            <>
              <p>
                Si algo no funciona como esperabas, cuéntanos qué pasó. El mensaje ya lleva los datos técnicos que nos
                ayudan a encontrar el problema; solo agrega qué estabas haciendo.
              </p>
              <div className="help-links">
                <a
                  className="btn btn-ghost"
                  href={whatsappUrl(bugReportMessage(user, fromPath))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reportar un error
                </a>
              </div>
            </>
          ) : (
            <p>Por ahora, avísanos directamente en recepción.</p>
          )}
        </div>

        <div className="card help-card">
          <h2>El estudio</h2>
          <div className="help-links">
            {STUDIO_WEBSITE_URL && (
              <a className="btn btn-ghost" href={STUDIO_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
                Página del estudio
              </a>
            )}
            <Link className="btn btn-ghost" to="/paquetes">
              Ver paquetes
            </Link>
          </div>
        </div>

        <div className="card help-card faq">
          <h2>Preguntas frecuentes</h2>
          <details>
            <summary>¿Cómo reservo una clase?</summary>
            <p>En Horario elige la clase que quieres y reserva tu lugar. Tus reservaciones las ves en «Mis reservaciones».</p>
          </details>
          <details>
            <summary>¿Cómo funcionan las reposiciones?</summary>
            <p>
              Son para membresías de horario fijo. Si el estudio cancela una de tus clases fijas, recibes 1 reposición
              válida 30 días para reservar cualquier clase regular con cupo.
            </p>
          </details>
          <details>
            <summary>¿Cómo instalo la app en mi teléfono?</summary>
            <p>
              Sigue la <Link to="/instalar">guía de instalación</Link>: toma menos de un minuto.
            </p>
          </details>
          <details>
            <summary>Olvidé mi contraseña</summary>
            <p>
              Puedes <Link to="/forgot-password">recuperarla con tu correo</Link>.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
