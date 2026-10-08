import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMe, register } from '../api/auth';
import { saveHealth, updateClientProfile } from '../api/clientProfile';
import { BirthDateFields, ContactFields, HealthFields, PreferenceFields, PrivacyLabel } from '../components/ClientFields';
import {
  ACCOUNT_STEP_PROFILE_KEYS,
  ADULT_AGE,
  CONTACT_KEYS,
  EMPTY_HEALTH,
  EMPTY_PROFILE_FORM,
  MIN_AGE,
  PREFERENCE_KEYS,
  UNDER_AGE_MESSAGE,
  ageFromDate,
  pickPayload,
} from '../clientForm';
import { useAuth } from '../context/AuthContext';

const EMPTY_ACCOUNT = { email: '', password: '', first_name: '', last_name: '', phone: '' };

const STEP_TITLES = {
  1: { title: 'Crea tu cuenta', subtitle: 'Regístrate para ver el horario y reservar tus clases.' },
  2: { title: 'Tus datos', subtitle: 'Solo lo necesario, y un contacto por si alguna vez lo necesitamos.' },
  3: { title: 'Salud y preferencias', subtitle: 'Nos ayuda a cuidarte y a recomendarte mejores clases.' },
};

export default function RegisterPage() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [form, setForm] = useState(EMPTY_PROFILE_FORM);
  const [health, setHealth] = useState(EMPTY_HEALTH);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // 'save' o 'skip' cuando falta la respuesta de salud y se está avisando antes de continuar.
  const [healthWarning, setHealthWarning] = useState(null);

  const age = ageFromDate(form.birth_date);
  const tooYoung = age !== null && age < MIN_AGE;
  const needsGuardian = age !== null && age >= MIN_AGE && age < ADULT_AGE;

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAccountChange(field) {
    return (event) => setAccount((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleStep1(event) {
    event.preventDefault();
    if (tooYoung) {
      setError(UNDER_AGE_MESSAGE);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...account,
        accept_privacy: acceptPrivacy,
        ...pickPayload(form, needsGuardian ? ACCOUNT_STEP_PROFILE_KEYS : ['birth_date']),
      };
      await register(payload);
      // El registro no devuelve tokens (Fase 7): iniciamos sesión aparte.
      await login(account.email, account.password);
      setStep(2);
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

  async function handleStep2(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateClientProfile(pickPayload(form, CONTACT_KEYS));
      setStep(3);
    } catch (err) {
      setError(err.message || 'No pudimos guardar tus datos. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Cierra el registro. Con `save` guarda lo que se haya llenado en este paso; sin él, solo continúa.
   * Si la pregunta de salud sigue sin responder, antes avisa que omitirla puede poner en riesgo la salud.
   */
  async function complete(save, confirmed = false) {
    if (health.has_condition === null && !confirmed) {
      setHealthWarning(save ? 'save' : 'skip');
      return;
    }
    setHealthWarning(null);
    setError(null);
    setSubmitting(true);
    try {
      if (save) {
        await updateClientProfile(pickPayload(form, PREFERENCE_KEYS));
        if (health.has_condition !== null) await saveHealth(health);
      }
      setUser(await fetchMe()); // actualiza profile_complete para la invitación a completar datos
      navigate('/schedule');
    } catch (err) {
      setError(err.message || 'No pudimos guardar tus datos. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleStep3(event) {
    event.preventDefault();
    complete(true);
  }

  const { title, subtitle } = STEP_TITLES[step];

  return (
    <div className="page-centered">
      <div className="card auth-card">
        <div className="steps" aria-label={`Paso ${step} de 3`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`step-bar${n <= step ? ' done' : ''}`} />
          ))}
        </div>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>

        {error && <div className="error-banner">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="first_name">Nombre</label>
                <input id="first_name" required value={account.first_name} onChange={handleAccountChange('first_name')} />
              </div>
              <div className="form-field">
                <label htmlFor="last_name">Apellido</label>
                <input id="last_name" required value={account.last_name} onChange={handleAccountChange('last_name')} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={account.email}
                onChange={handleAccountChange('email')}
              />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Teléfono</label>
              <input id="phone" type="tel" value={account.phone} onChange={handleAccountChange('phone')} />
            </div>
            <div className="form-field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={account.password}
                onChange={handleAccountChange('password')}
              />
            </div>

            <BirthDateFields form={form} setField={setField} />

            <label className="choice" style={{ margin: '0.25rem 0 1rem' }}>
              <input type="checkbox" required checked={acceptPrivacy} onChange={(event) => setAcceptPrivacy(event.target.checked)} />
              <span>
                <PrivacyLabel />
              </span>
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || tooYoung}>
              {submitting ? 'Creando cuenta…' : 'Continuar'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2}>
            <ContactFields form={form} setField={setField} requireEmergency />
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Continuar'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3}>
            <HealthFields health={health} setHealth={setHealth} />
            <PreferenceFields form={form} setField={setField} />

            {healthWarning && (
              <div className="info-banner" role="alert">
                <p>
                  Sin esta información no podemos cuidarte mejor en clase, y omitirla podría poner en riesgo tu salud.
                  Puedes responderla ahora o cuando quieras desde tu Perfil.
                </p>
                <div className="info-banner-actions">
                  <button type="button" className="btn btn-primary btn-small" onClick={() => setHealthWarning(null)}>
                    Responder ahora
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    disabled={submitting}
                    onClick={() => complete(healthWarning === 'save', true)}
                  >
                    Continuar sin responder
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Terminar'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ marginTop: '0.5rem' }}
              disabled={submitting}
              onClick={() => complete(false)}
            >
              Omitir por ahora
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        )}
      </div>
    </div>
  );
}
