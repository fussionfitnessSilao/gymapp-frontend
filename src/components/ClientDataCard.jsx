import { useEffect, useState } from 'react';
import { fetchMe } from '../api/auth';
import { fetchClientProfile, fetchHealth, saveHealth, updateClientProfile } from '../api/clientProfile';
import { useAuth } from '../context/AuthContext';
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
  profileToForm,
} from '../clientForm';
import { BirthDateFields, ContactFields, HealthFields, PreferenceFields, PrivacyLabel } from './ClientFields';

/** Tarjeta de Perfil para ver y editar todos los datos del cliente (menos el correo). */
export default function ClientDataCard() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_PROFILE_FORM);
  const [health, setHealth] = useState(EMPTY_HEALTH);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [profile, healthInfo] = await Promise.all([fetchClientProfile(), fetchHealth()]);
        setForm(profileToForm(profile));
        setPrivacyAccepted(Boolean(profile.privacy_accepted));
        setHealth(healthInfo.answered ? { has_condition: healthInfo.has_condition, details: healthInfo.details } : EMPTY_HEALTH);
      } catch (err) {
        setError(err.message || 'No pudimos cargar tus datos.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const age = ageFromDate(form.birth_date);
  const tooYoung = age !== null && age < MIN_AGE;
  const needsGuardian = age !== null && age >= MIN_AGE && age < ADULT_AGE;

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (tooYoung) {
      setError(UNDER_AGE_MESSAGE);
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        ...pickPayload(form, [...ACCOUNT_STEP_PROFILE_KEYS, ...CONTACT_KEYS, ...PREFERENCE_KEYS]),
      };
      if (!needsGuardian) {
        delete payload.guardian_name;
        delete payload.guardian_phone;
        delete payload.guardian_consent;
      }
      if (!privacyAccepted && acceptPrivacy) payload.accept_privacy = true;
      const saved = await updateClientProfile(payload);
      setPrivacyAccepted(Boolean(saved.privacy_accepted));
      setAcceptPrivacy(false);
      if (health.has_condition !== null) await saveHealth(health);
      setUser(await fetchMe()); // refresca profile_complete
      setMessage('Tus datos se guardaron.');
    } catch (err) {
      setError(err.message || 'No pudimos guardar tus datos.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card">Cargando…</div>;

  return (
    <div className="card" id="mis-datos">
      <h3 style={{ marginBottom: '0.25rem' }}>Mis datos</h3>
      {user?.profile_complete === false ? (
        <p className="hint" style={{ marginBottom: '1rem' }}>
          Completa tu fecha de nacimiento, tu contacto de emergencia y la pregunta de salud para que podamos cuidarte mejor
          en clase.
        </p>
      ) : (
        <p className="hint" style={{ marginBottom: '1rem' }}>
          Puedes actualizarlos cuando quieras.
        </p>
      )}

      {error && <div className="error-banner">{error}</div>}
      {message && (
        <div className="error-banner" style={{ background: '#e8f0ec', color: 'var(--color-primary-dark)' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <BirthDateFields form={form} setField={setField} required={false} idPrefix="mis-" />
        <ContactFields form={form} setField={setField} idPrefix="mis-" />
        <HealthFields health={health} setHealth={(value) => { setHealth(value); setMessage(null); }} />
        <PreferenceFields form={form} setField={setField} idPrefix="mis-" />

        {!privacyAccepted && (
          <label className="choice" style={{ marginBottom: '1rem' }}>
            <input type="checkbox" checked={acceptPrivacy} onChange={(event) => setAcceptPrivacy(event.target.checked)} />
            <span>
              <PrivacyLabel />
            </span>
          </label>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving || tooYoung}>
          {saving ? 'Guardando…' : 'Guardar mis datos'}
        </button>
      </form>
    </div>
  );
}
