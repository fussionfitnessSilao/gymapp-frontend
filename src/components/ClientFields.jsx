import { useEffect, useState } from 'react';
import {
  ACTIVITY_OPTIONS,
  ADULT_AGE,
  GOAL_OPTIONS,
  HEARD_ABOUT_OPTIONS,
  MIN_AGE,
  MONTHS,
  PRIVACY_NOTICE_URL,
  SHOE_SIZES,
  SPORT_OPTIONS,
  UNDER_AGE_MESSAGE,
  ageFromDate,
  birthYearOptions,
  buildShoeSize,
  joinDate,
  joinSports,
  parseShoeSize,
  splitDate,
  splitSports,
} from '../clientForm';
import PrivacyModal from './PrivacyModal';

// Si el aviso se publica en otro sitio (VITE_PRIVACY_NOTICE_URL), se abre ahí; si no, se lee aquí mismo, sobre el formulario.
const EXTERNAL_NOTICE = PRIVACY_NOTICE_URL && PRIVACY_NOTICE_URL !== '/privacidad';

/** Texto de la casilla del aviso de privacidad; el aviso se abre sin salir del formulario. */
export function PrivacyLabel() {
  const [open, setOpen] = useState(false);
  if (EXTERNAL_NOTICE) {
    return (
      <>
        Acepto el{' '}
        <a href={PRIVACY_NOTICE_URL} target="_blank" rel="noreferrer">
          aviso de privacidad
        </a>
      </>
    );
  }
  return (
    <>
      Acepto el{' '}
      <button type="button" className="link-button" onClick={() => setOpen(true)}>
        aviso de privacidad
      </button>
      {open && <PrivacyModal onClose={() => setOpen(false)} />}
    </>
  );
}

/** Campo con el título dentro del recuadro: sube y se hace pequeño cuando hay algo escrito. */
export function FloatingField({ id, label, dataLabel, value, onChange, type = 'text', required = false, ...rest }) {
  return (
    <div className="float-field">
      <input
        id={id}
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        required={required}
        data-label={dataLabel || label}
        {...rest}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

/** Casillas para elegir varias opciones; al elegir "Otra/Otros" se abre un campo para escribir cuál. */
export function ChoiceGroup({ legend, options, values, onChange, otherId, otherLabel, otherValue, onOtherChange }) {
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
      {onOtherChange && values.includes('other') && (
        <FloatingField
          id={otherId}
          label={otherLabel}
          value={otherValue}
          onChange={(event) => onOtherChange(event.target.value)}
          maxLength={100}
        />
      )}
    </fieldset>
  );
}

/** Fecha de nacimiento en tres listas (día, mes, año): cabe en cualquier pantalla y nunca arranca con una fecha puesta. */
function BirthDateSelects({ value, onChange, required, idPrefix }) {
  const [parts, setParts] = useState(() => splitDate(value));

  useEffect(() => {
    // Si el valor cambia desde afuera (por ejemplo, cuando termina de cargar el perfil), se refleja en las listas.
    if (value !== joinDate(parts)) setParts(splitDate(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function update(field, newValue) {
    const next = { ...parts, [field]: newValue };
    if (next.year && next.month && next.day) {
      const lastDay = new Date(Number(next.year), Number(next.month), 0).getDate();
      if (Number(next.day) > lastDay) next.day = String(lastDay);
    }
    setParts(next);
    onChange(joinDate(next));
  }

  const days = Array.from({ length: 31 }, (_, index) => String(index + 1));
  const years = birthYearOptions(parts.year);
  const selectProps = { required, 'data-label': 'Fecha de nacimiento' };

  return (
    <div className="date-row">
      <select
        id={`${idPrefix}birth_day`}
        aria-label="Día"
        value={parts.day}
        onChange={(event) => update('day', event.target.value)}
        {...selectProps}
      >
        <option value="">Día</option>
        {days.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
      <select aria-label="Mes" value={parts.month} onChange={(event) => update('month', event.target.value)} {...selectProps}>
        <option value="">Mes</option>
        {MONTHS.map((name, index) => (
          <option key={name} value={String(index + 1)}>
            {name}
          </option>
        ))}
      </select>
      <select aria-label="Año" value={parts.year} onChange={(event) => update('year', event.target.value)} {...selectProps}>
        <option value="">Año</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Fecha de nacimiento y, si tiene 16 o 17 años, los datos y la autorización de madre, padre o tutor. */
export function BirthDateFields({ form, setField, required = true, idPrefix = '' }) {
  const age = ageFromDate(form.birth_date);
  const tooYoung = age !== null && age < MIN_AGE;
  const needsGuardian = age !== null && age >= MIN_AGE && age < ADULT_AGE;

  return (
    <>
      <fieldset className="form-field choice-fieldset">
        <legend>Fecha de nacimiento</legend>
        <BirthDateSelects
          value={form.birth_date}
          onChange={(value) => setField('birth_date', value)}
          required={required}
          idPrefix={idPrefix}
        />
        {tooYoung && <p className="hint">{UNDER_AGE_MESSAGE}</p>}
      </fieldset>

      {needsGuardian && (
        <div className="guardian-box">
          <p className="hint" style={{ marginBottom: '0.75rem' }}>
            Para tomar clases a tu edad necesitamos la autorización de tu madre, padre o tutor. La confirmaremos con
            ellos en el estudio.
          </p>
          <div className="stack">
            <FloatingField
              id={`${idPrefix}guardian_name`}
              label="Nombre de tu madre, padre o tutor"
              required
              value={form.guardian_name}
              onChange={(event) => setField('guardian_name', event.target.value)}
            />
            <FloatingField
              id={`${idPrefix}guardian_phone`}
              label="Teléfono de tu madre, padre o tutor"
              type="tel"
              required
              value={form.guardian_phone}
              onChange={(event) => setField('guardian_phone', event.target.value)}
            />
          </div>
          <label className="choice" style={{ marginTop: '0.75rem' }}>
            <input
              type="checkbox"
              required
              data-error="Falta la autorización de tu madre, padre o tutor."
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

/** Calzado: una lista del 21 al 32 con media talla (casilla) y la opción "Otro" por si no aparece. */
function ShoeSizeField({ value, onChange, id }) {
  const parsed = parseShoeSize(value);
  const [otherMode, setOtherMode] = useState(parsed.mode === 'other');

  useEffect(() => {
    if (parsed.mode === 'other') setOtherMode(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleSelect(event) {
    const chosen = event.target.value;
    if (chosen === 'other') {
      setOtherMode(true);
      onChange('');
    } else {
      setOtherMode(false);
      onChange(buildShoeSize({ size: chosen, half: parsed.half }));
    }
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>Calzado (opcional)</label>
      <select id={id} value={otherMode ? 'other' : parsed.size} onChange={handleSelect}>
        <option value="">Elige tu número</option>
        {SHOE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
        <option value="other">Otro</option>
      </select>
      {otherMode ? (
        <input
          aria-label="Tu número de calzado"
          placeholder="Escribe tu número"
          maxLength={10}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <label className="choice">
          <input
            type="checkbox"
            disabled={!parsed.size}
            checked={parsed.half}
            onChange={(event) => onChange(buildShoeSize({ size: parsed.size, half: event.target.checked }))}
          />
          <span>Media talla (.5)</span>
        </label>
      )}
    </div>
  );
}

/** Contacto de emergencia agrupado (obligatorio en el registro) y datos opcionales. */
export function ContactFields({ form, setField, requireEmergency = false, idPrefix = '' }) {
  return (
    <>
      <fieldset className="field-group">
        <legend>Contacto de emergencia</legend>
        <FloatingField
          id={`${idPrefix}emergency_name`}
          label="Nombre"
          dataLabel="Contacto de emergencia: nombre"
          required={requireEmergency}
          value={form.emergency_contact_name}
          onChange={(event) => setField('emergency_contact_name', event.target.value)}
        />
        <FloatingField
          id={`${idPrefix}emergency_phone`}
          label="Teléfono de tu contacto"
          dataLabel="Contacto de emergencia: teléfono"
          type="tel"
          required={requireEmergency}
          value={form.emergency_contact_phone}
          onChange={(event) => setField('emergency_contact_phone', event.target.value)}
        />
      </fieldset>

      <div className="form-field">
        <FloatingField
          id={`${idPrefix}address`}
          label="Dirección (opcional)"
          value={form.address}
          onChange={(event) => setField('address', event.target.value)}
        />
      </div>
      <div className="form-field">
        <FloatingField
          id={`${idPrefix}social_handle`}
          label="Redes sociales (opcional)"
          value={form.social_handle}
          maxLength={100}
          onChange={(event) => setField('social_handle', event.target.value)}
        />
        <p className="hint">Cuáles usas y tu usuario. Ej. Instagram @usuario, TikTok @usuario.</p>
      </div>
      <ShoeSizeField id={`${idPrefix}shoe_size`} value={form.shoe_size} onChange={(value) => setField('shoe_size', value)} />
    </>
  );
}

/** Pregunta de salud: sí/no y, si es sí, el detalle. `required`: se exige elegir una respuesta. */
export function HealthFields({ health, setHealth, required = false }) {
  return (
    <fieldset className="form-field choice-fieldset">
      <legend>¿Tienes alguna lesión, cirugía o enfermedad que debamos conocer?</legend>
      <div className="choice-group">
        <label className="choice">
          <input
            type="radio"
            name="has_condition"
            required={required}
            checked={health.has_condition === false}
            onChange={() => setHealth({ has_condition: false, details: '' })}
          />
          <span>No</span>
        </label>
        <label className="choice">
          <input
            type="radio"
            name="has_condition"
            required={required}
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
          data-label="Cuéntanos tu lesión, cirugía o enfermedad"
          placeholder="Cuéntanos cuál es, para cuidarte y adaptar tu entrenamiento."
          value={health.details}
          onChange={(event) => setHealth((prev) => ({ ...prev, details: event.target.value }))}
        />
      )}
    </fieldset>
  );
}

/** Deportes practicados: se eligen de una lista (en orden alfabético), varios, o se agrega uno propio. */
function SportsPicker({ value, onChange, id }) {
  const sports = splitSports(value);
  const [showOther, setShowOther] = useState(false);
  const [otherText, setOtherText] = useState('');
  const available = SPORT_OPTIONS.filter((option) => !sports.some((sport) => sport.toLowerCase() === option.toLowerCase()));

  function add(name) {
    const clean = name.replace(/,/g, ' ').trim();
    if (!clean || sports.some((sport) => sport.toLowerCase() === clean.toLowerCase())) return;
    onChange(joinSports([...sports, clean]));
  }

  function handleSelect(event) {
    const chosen = event.target.value;
    if (chosen === '__other') {
      setShowOther(true);
    } else if (chosen) {
      add(chosen);
    }
  }

  function addOther() {
    add(otherText);
    setOtherText('');
    setShowOther(false);
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>¿Qué deportes has practicado? (opcional)</label>
      <select id={id} value="" onChange={handleSelect}>
        <option value="">{sports.length ? 'Agregar otro deporte…' : 'Elige un deporte…'}</option>
        {available.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="__other">Otro…</option>
      </select>
      {showOther && (
        <div className="inline-add">
          <input
            aria-label="Otro deporte"
            placeholder="¿Cuál?"
            maxLength={40}
            value={otherText}
            onChange={(event) => setOtherText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addOther();
              }
            }}
          />
          <button type="button" className="btn btn-ghost btn-small" onClick={addOther}>
            Agregar
          </button>
        </div>
      )}
      {sports.length > 0 && (
        <div className="chips">
          {sports.map((sport) => (
            <span key={sport} className="chip">
              {sport}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Quitar ${sport}`}
                onClick={() => onChange(joinSports(sports.filter((item) => item !== sport)))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Preferencias: deportes previos, actividades, objetivos, cómo se enteró, comentarios y promociones. */
export function PreferenceFields({ form, setField, idPrefix = '' }) {
  return (
    <>
      <SportsPicker
        id={`${idPrefix}previous_sports`}
        value={form.previous_sports}
        onChange={(value) => setField('previous_sports', value)}
      />

      <ChoiceGroup
        legend="¿Qué actividades te interesan?"
        options={ACTIVITY_OPTIONS}
        values={form.activities_of_interest}
        onChange={(values) => setField('activities_of_interest', values)}
        otherId={`${idPrefix}activities_other`}
        otherLabel="¿Qué otra actividad?"
        otherValue={form.activities_other}
        onOtherChange={(value) => setField('activities_other', value)}
      />
      <ChoiceGroup
        legend="¿Qué objetivo tienes?"
        options={GOAL_OPTIONS}
        values={form.training_goals}
        onChange={(values) => setField('training_goals', values)}
        otherId={`${idPrefix}goals_other`}
        otherLabel="¿Qué otro objetivo?"
        otherValue={form.goals_other}
        onOtherChange={(value) => setField('goals_other', value)}
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
          <FloatingField
            id={`${idPrefix}heard_about_other`}
            label="Cuéntanos cómo"
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
