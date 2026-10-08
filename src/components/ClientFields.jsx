import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  HEARD_ABOUT_OPTIONS,
  PRIVACY_NOTICE_URL,
  UNDER_AGE_MESSAGE,
  ageFromDate,
  MIN_AGE,
  ADULT_AGE,
  todayISO,
} from '../clientForm';

/** Texto de la casilla del aviso de privacidad, con enlace cuando ya hay una dirección publicada. */
export function PrivacyLabel() {
  if (!PRIVACY_NOTICE_URL) return <>Acepto el aviso de privacidad</>;
  return (
    <>
      Acepto el{' '}
      <a href={PRIVACY_NOTICE_URL} target="_blank" rel="noreferrer">
        aviso de privacidad
      </a>
    </>
  );
}

/** Casillas para elegir varias opciones. `values` es la lista de claves elegidas. */
export function ChoiceGroup({ legend, options, values, onChange }) {
  function toggle(value) {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }
  return (
    <fieldset className="form-field choice-fieldset">
      <legend>{legend}</legend>
      <div className="choice-group">
        {options.map((option) => (
          <label key={option.value} className="choice">
            <input type="checkbox" checked={values.includes(option.value)} onChange={() => toggle(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Fecha de nacimiento y, si tiene 16 o 17 años, los datos y la autorización de madre, padre o tutor. */
export function BirthDateFields({ form, setField, required = true, idPrefix = '' }) {
  const age = ageFromDate(form.birth_date);
  const tooYoung = age !== null && age < MIN_AGE;
  const needsGuardian = age !== null && age >= MIN_AGE && age < ADULT_AGE;

  return (
    <>
      <div className="form-field">
        <label htmlFor={`${idPrefix}birth_date`}>Fecha de nacimiento</label>
        <input
          id={`${idPrefix}birth_date`}
          type="date"
          required={required}
          max={todayISO()}
          value={form.birth_date}
          onChange={(event) => setField('birth_date', event.target.value)}
        />
        {tooYoung && <p className="hint">{UNDER_AGE_MESSAGE}</p>}
      </div>

      {needsGuardian && (
        <div className="guardian-box">
          <p className="hint" style={{ marginBottom: '0.75rem' }}>
            Para tomar clases a tu edad necesitamos la autorización de tu madre, padre o tutor. La confirmaremos con
            ellos en el estudio.
          </p>
          <div className="form-field">
            <label htmlFor={`${idPrefix}guardian_name`}>Nombre de tu madre, padre o tutor</label>
            <input
              id={`${idPrefix}guardian_name`}
              required
              value={form.guardian_name}
              onChange={(event) => setField('guardian_name', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor={`${idPrefix}guardian_phone`}>Su teléfono</label>
            <input
              id={`${idPrefix}guardian_phone`}
              type="tel"
              required
              value={form.guardian_phone}
              onChange={(event) => setField('guardian_phone', event.target.value)}
            />
          </div>
          <label className="choice">
            <input
              type="checkbox"
              required
              checked={form.guardian_consent}
              onChange={(event) => setField('guardian_consent', event.target.checked)}
            />
            <span>Mi madre, padre o tutor autoriza que tome clases y acepta el aviso de privacidad en mi nombre.</span>
          </label>
        </div>
      )}
    </>
  );
}

/** Contacto de emergencia (obligatorio en el registro) y datos opcionales. */
export function ContactFields({ form, setField, requireEmergency = false, idPrefix = '' }) {
  return (
    <>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor={`${idPrefix}emergency_name`}>Contacto de emergencia</label>
          <input
            id={`${idPrefix}emergency_name`}
            required={requireEmergency}
            placeholder="Nombre"
            value={form.emergency_contact_name}
            onChange={(event) => setField('emergency_contact_name', event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}emergency_phone`}>Su teléfono</label>
          <input
            id={`${idPrefix}emergency_phone`}
            type="tel"
            required={requireEmergency}
            value={form.emergency_contact_phone}
            onChange={(event) => setField('emergency_contact_phone', event.target.value)}
          />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor={`${idPrefix}address`}>Dirección (opcional)</label>
        <input id={`${idPrefix}address`} value={form.address} onChange={(event) => setField('address', event.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor={`${idPrefix}social_handle`}>Tu usuario en redes (opcional)</label>
          <input
            id={`${idPrefix}social_handle`}
            placeholder="@usuario"
            value={form.social_handle}
            onChange={(event) => setField('social_handle', event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}shoe_size`}>Calzado (opcional)</label>
          <input
            id={`${idPrefix}shoe_size`}
            placeholder="Ej. 26.5"
            value={form.shoe_size}
            onChange={(event) => setField('shoe_size', event.target.value)}
          />
        </div>
      </div>
    </>
  );
}

/** Pregunta de salud: sí/no y, si es sí, el detalle. */
export function HealthFields({ health, setHealth }) {
  return (
    <fieldset className="form-field choice-fieldset">
      <legend>¿Tienes alguna lesión, cirugía o enfermedad que debamos conocer?</legend>
      <div className="choice-group">
        <label className="choice">
          <input
            type="radio"
            name="has_condition"
            checked={health.has_condition === false}
            onChange={() => setHealth({ has_condition: false, details: '' })}
          />
          <span>No</span>
        </label>
        <label className="choice">
          <input
            type="radio"
            name="has_condition"
            checked={health.has_condition === true}
            onChange={() => setHealth((prev) => ({ ...prev, has_condition: true }))}
          />
          <span>Sí</span>
        </label>
      </div>
      {health.has_condition === true && (
        <textarea
          rows={3}
          required
          maxLength={2000}
          placeholder="Cuéntanos cuál es, para cuidarte y adaptar tu entrenamiento."
          value={health.details}
          onChange={(event) => setHealth((prev) => ({ ...prev, details: event.target.value }))}
        />
      )}
    </fieldset>
  );
}

/** Preferencias: deportes previos, actividades, objetivos, cómo se enteró, comentarios y promociones. */
export function PreferenceFields({ form, setField, idPrefix = '' }) {
  return (
    <>
      <div className="form-field">
        <label htmlFor={`${idPrefix}previous_sports`}>¿Qué deportes has practicado? (opcional)</label>
        <input
          id={`${idPrefix}previous_sports`}
          value={form.previous_sports}
          onChange={(event) => setField('previous_sports', event.target.value)}
        />
      </div>

      <ChoiceGroup
        legend="¿Qué actividades te interesan?"
        options={ACTIVITY_OPTIONS}
        values={form.activities_of_interest}
        onChange={(values) => setField('activities_of_interest', values)}
      />
      <ChoiceGroup
        legend="¿Qué objetivo tienes?"
        options={GOAL_OPTIONS}
        values={form.training_goals}
        onChange={(values) => setField('training_goals', values)}
      />

      <div className="form-field">
        <label htmlFor={`${idPrefix}heard_about`}>¿Cómo te enteraste de nosotros?</label>
        <select
          id={`${idPrefix}heard_about`}
          value={form.heard_about}
          onChange={(event) => setField('heard_about', event.target.value)}
        >
          <option value="">Elige una opción</option>
          {HEARD_ABOUT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {form.heard_about === 'other' && (
          <input
            aria-label="Cuéntanos cómo"
            placeholder="Cuéntanos cómo"
            maxLength={100}
            value={form.heard_about_other}
            onChange={(event) => setField('heard_about_other', event.target.value)}
          />
        )}
      </div>

      <div className="form-field">
        <label htmlFor={`${idPrefix}comments`}>Comentarios (opcional)</label>
        <textarea
          id={`${idPrefix}comments`}
          rows={2}
          value={form.comments}
          onChange={(event) => setField('comments', event.target.value)}
        />
      </div>

      <label className="choice" style={{ marginBottom: '1rem' }}>
        <input
          type="checkbox"
          checked={form.marketing_opt_in}
          onChange={(event) => setField('marketing_opt_in', event.target.checked)}
        />
        <span>Quiero recibir promociones y novedades del estudio</span>
      </label>
    </>
  );
}
