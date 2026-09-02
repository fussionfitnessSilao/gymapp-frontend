import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { fetchCheckinToken, fetchMe, updateMe } from '../api/auth';
import { fetchMyMembership } from '../api/membership';
import { useAuth } from '../context/AuthContext';

const MEMBERSHIP_STATUS_LABELS = {
  active: 'Activa',
  expired: 'Vencida',
  cancelled: 'Cancelada',
};

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [membershipMessage, setMembershipMessage] = useState(null);
  const [checkinToken, setCheckinToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await fetchMe();
        setProfile(me);
        setForm({ first_name: me.first_name, last_name: me.last_name, phone: me.phone });
      } catch (err) {
        setError(err.message || 'No pudimos cargar tu perfil.');
      }
      try {
        const myMembership = await fetchMyMembership();
        setMembership(myMembership);
      } catch (err) {
        setMembershipMessage(err.message || 'No tienes ninguna membresía registrada todavía.');
      }
      try {
        const { token } = await fetchCheckinToken();
        setCheckinToken(token);
      } catch {
        // No es crítico para el resto de la página si esto falla.
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const updated = await updateMe(form);
      setProfile(updated);
      setSaveMessage('Tus datos se guardaron.');
    } catch (err) {
      setError(err.message || 'No pudimos guardar tus cambios.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (loading) return <div className="page-loading">Cargando…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tu perfil</h1>
      </div>

      <div className="profile-grid">
        {checkinToken && (
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Tu código de check-in</h3>
            <QRCodeSVG value={checkinToken} size={180} />
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              Muéstralo en recepción al llegar a tu clase.
            </p>
          </div>
        )}

        <div className="card membership-card">
          <div className="membership-type">{membership ? membership.membership_type_name : 'Sin membresía'}</div>
          {membership ? (
            <>
              <div className="membership-detail-row">
                <span className="label">Estado</span>
                <span>{MEMBERSHIP_STATUS_LABELS[membership.status]}</span>
              </div>
              <div className="membership-detail-row">
                <span className="label">Vigencia</span>
                <span>
                  {membership.start_date} — {membership.end_date}
                </span>
              </div>
              {membership.classes_remaining !== null && (
                <div className="membership-detail-row">
                  <span className="label">Clases restantes</span>
                  <span>{membership.classes_remaining}</span>
                </div>
              )}
              <div className="membership-detail-row">
                <span className="label">Vigente ahora</span>
                <span>{membership.is_currently_valid ? 'Sí' : 'No'}</span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--color-muted)' }}>{membershipMessage}</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Datos de contacto</h3>
          {error && <div className="error-banner">{error}</div>}
          {saveMessage && (
            <div className="error-banner" style={{ background: '#e8f0ec', color: 'var(--color-primary-dark)' }}>
              {saveMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="first_name">Nombre</label>
                <input id="first_name" value={form.first_name} onChange={handleChange('first_name')} />
              </div>
              <div className="form-field">
                <label htmlFor="last_name">Apellido</label>
                <input id="last_name" value={form.last_name} onChange={handleChange('last_name')} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="email">Correo</label>
              <input id="email" value={profile.email} disabled />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Teléfono</label>
              <input id="phone" value={form.phone} onChange={handleChange('phone')} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
