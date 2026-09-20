import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from '../api/auth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const linkIsIncomplete = !uid || !token;

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset({ uid, token, new_password: newPassword });
      setDone(true);
    } catch (err) {
      if (err.code === 'INVALID_PASSWORD_RESET_TOKEN') {
        setError('Este link ya no es válido — puede que haya expirado o que ya se haya usado. Pide uno nuevo.');
      } else if (err.details?.new_password?.length) {
        // Errores de validación de contraseña de Django (ej. "muy corta", "muy común").
        setError(err.details.new_password[0]);
      } else {
        setError(err.message || 'No pudimos cambiar tu contraseña. Intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (linkIsIncomplete) {
    return (
      <div className="page-centered">
        <div className="card auth-card">
          <h1>Link incompleto</h1>
          <p className="subtitle">
            Este link no trae toda la información necesaria. Pide uno nuevo desde la pantalla de recuperación.
          </p>
          <p className="auth-switch">
            <Link to="/forgot-password">Pedir un nuevo link</Link>
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page-centered">
        <div className="card auth-card">
          <h1>Contraseña actualizada</h1>
          <p className="subtitle">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-centered">
      <div className="card auth-card">
        <h1>Elige una nueva contraseña</h1>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="new_password">Contraseña nueva</label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="confirm_password">Confirma la contraseña</label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
