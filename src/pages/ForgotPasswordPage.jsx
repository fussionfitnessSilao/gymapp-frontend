import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'No pudimos procesar tu solicitud. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="page-centered">
        <div className="card auth-card">
          <h1>Revisa tu correo</h1>
          <p className="subtitle">
            Si <strong>{email}</strong> tiene una cuenta con nosotros, te va a llegar un link para elegir una nueva
            contraseña en los próximos minutos.
          </p>
          <p className="auth-switch">
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-centered">
      <div className="card auth-card">
        <h1>Recupera tu contraseña</h1>
        <p className="subtitle">Escribe tu correo y te mandamos un link para elegir una nueva contraseña.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Mandar link de recuperación'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
