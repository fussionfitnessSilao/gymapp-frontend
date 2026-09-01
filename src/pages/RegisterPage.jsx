import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { email: '', password: '', first_name: '', last_name: '', phone: '' };

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      // El registro no devuelve tokens (Fase 7): iniciamos sesión aparte.
      await login(form.email, form.password);
      navigate('/schedule');
    } catch (err) {
      if (err.code === 'EMAIL_ALREADY_EXISTS') {
        setError('Ya existe una cuenta con ese correo. ¿Ya tienes cuenta? Inicia sesión.');
      } else {
        setError(err.message || 'No pudimos crear tu cuenta. Revisa los datos e intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-centered">
      <div className="card auth-card">
        <h1>Crea tu cuenta</h1>
        <p className="subtitle">Regístrate para ver el horario y reservar tus clases.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="first_name">Nombre</label>
              <input id="first_name" required value={form.first_name} onChange={handleChange('first_name')} />
            </div>
            <div className="form-field">
              <label htmlFor="last_name">Apellido</label>
              <input id="last_name" required value={form.last_name} onChange={handleChange('last_name')} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange('email')}
            />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Teléfono</label>
            <input id="phone" value={form.phone} onChange={handleChange('phone')} />
          </div>
          <div className="form-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange('password')}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
