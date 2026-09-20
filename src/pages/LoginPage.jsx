import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/schedule');
    } catch (err) {
      setError(err.message || 'No pudimos iniciar tu sesión. Revisa tu correo y contraseña.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-centered">
      <div className="card auth-card">
        <h1>Te damos la bienvenida</h1>
        <p className="subtitle">Inicia sesión para reservar tu próxima clase.</p>

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
          <div className="form-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <p className="auth-switch" style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </p>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Primera vez aquí? <Link to="/register">Crea tu cuenta</Link>
        </p>
      </div>
    </div>
  );
}
