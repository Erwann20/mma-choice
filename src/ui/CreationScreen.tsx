import { useMemo, useState } from 'react'
import type { Sex, Style } from '../engine'
import { divisionsForSex, loadDivisions, loadStartingCriteria } from '../schema'
import type { CreationChoices } from '../store/session'

const STYLES: { id: Style; label: string }[] = [
  { id: 'striker', label: 'Puncheur' },
  { id: 'wrestler', label: 'Lutteur' },
  { id: 'grappler', label: 'Grappler' },
  { id: 'allrounder', label: 'Polyvalent' },
]
const COUNTRIES: { name: string; flag: string }[] = [
  { name: 'France', flag: '🇫🇷' },
  { name: 'États-Unis', flag: '🇺🇸' },
  { name: 'Brésil', flag: '🇧🇷' },
  { name: 'Russie', flag: '🇷🇺' },
  { name: 'Nigéria', flag: '🇳🇬' },
  { name: 'Irlande', flag: '🇮🇪' },
  { name: 'Japon', flag: '🇯🇵' },
  { name: 'Mexique', flag: '🇲🇽' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Royaume-Uni', flag: '🇬🇧' },
  { name: 'Pologne', flag: '🇵🇱' },
  { name: 'Thaïlande', flag: '🇹🇭' },
]
const MIN_AGE = 16
const MAX_AGE = 22
const STEPS = ['Sexe', 'Origine géo.', 'Origine', 'Style', 'Entourage', 'Division']

export function CreationScreen({
  onCreate,
  onCancel,
}: {
  onCreate: (c: CreationChoices) => void
  onCancel: () => void
}) {
  const criteria = useMemo(() => loadStartingCriteria(), [])
  const divisions = useMemo(() => loadDivisions(), [])

  const [step, setStep] = useState(0)
  const [sex, setSex] = useState<Sex | null>(null)
  const [country, setCountry] = useState(COUNTRIES[0].name)
  const [age, setAge] = useState(18)
  const [originId, setOriginId] = useState<string | null>(null)
  const [style, setStyle] = useState<Style | null>(null)
  const [entourageId, setEntourageId] = useState<string | null>(null)
  const [divisionId, setDivisionId] = useState<string | null>(null)

  const canNext =
    (step === 0 && sex !== null) ||
    step === 1 ||
    (step === 2 && originId !== null) ||
    (step === 3 && style !== null) ||
    (step === 4 && entourageId !== null) ||
    (step === 5 && divisionId !== null)

  const last = step === STEPS.length - 1

  function next() {
    if (!last) {
      setStep(step + 1)
      return
    }
    if (sex && style && divisionId) {
      onCreate({
        sex,
        country,
        startAge: age,
        style,
        division: divisionId,
        originId: originId ?? undefined,
        entourageId: entourageId ?? undefined,
      })
    }
  }

  function back() {
    if (step === 0) onCancel()
    else setStep(step - 1)
  }

  return (
    <main className="screen">
      <div className="progress">
        {STEPS.map((s, i) => (
          <span key={s} className={`progress-step ${i <= step ? 'done' : ''}`} />
        ))}
      </div>
      <h2 className="step-title">{STEPS[step]}</h2>

      {step === 0 && (
        <div className="option-grid">
          {(['M', 'F'] as Sex[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`option ${sex === s ? 'selected' : ''}`}
              onClick={() => setSex(s)}
            >
              <span className="option-label">{s === 'M' ? 'Homme' : 'Femme'}</span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <>
          <div className="field">
            <label>Pays d’origine</label>
            <div className="flag-grid" role="group" aria-label="Pays d’origine">
              {COUNTRIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`flag-option ${country === c.name ? 'selected' : ''}`}
                  onClick={() => setCountry(c.name)}
                  aria-pressed={country === c.name}
                >
                  <span className="flag-emoji" aria-hidden="true">
                    {c.flag}
                  </span>
                  <span className="flag-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="age-value">Âge de départ</label>
            <div className="stepper" role="group" aria-label="Âge de départ">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setAge((a) => Math.max(MIN_AGE, a - 1))}
                disabled={age <= MIN_AGE}
                aria-label="Diminuer l’âge"
              >
                −
              </button>
              <div className="stepper-value" id="age-value" aria-live="polite">
                <span className="stepper-num">{age}</span>
                <span className="stepper-unit">ans</span>
              </div>
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setAge((a) => Math.min(MAX_AGE, a + 1))}
                disabled={age >= MAX_AGE}
                aria-label="Augmenter l’âge"
              >
                +
              </button>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="option-grid">
          {criteria.origins.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`option ${originId === o.id ? 'selected' : ''}`}
              onClick={() => setOriginId(o.id)}
            >
              <span className="option-label">{o.label}</span>
              {o.description ? <span className="option-desc">{o.description}</span> : null}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="option-grid">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`option ${style === s.id ? 'selected' : ''}`}
              onClick={() => setStyle(s.id)}
            >
              <span className="option-label">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="option-grid">
          {criteria.entourages.map((en) => (
            <button
              key={en.id}
              type="button"
              className={`option ${entourageId === en.id ? 'selected' : ''}`}
              onClick={() => setEntourageId(en.id)}
            >
              <span className="option-label">{en.label}</span>
              {en.description ? <span className="option-desc">{en.description}</span> : null}
            </button>
          ))}
        </div>
      )}

      {step === 5 && sex && (
        <div className="option-grid">
          {divisionsForSex(divisions, sex).map((d) => (
            <button
              key={d.id}
              type="button"
              className={`option ${divisionId === d.id ? 'selected' : ''}`}
              onClick={() => setDivisionId(d.id)}
            >
              <span className="option-label">{d.label}</span>
              <span className="option-desc">{d.weight}</span>
            </button>
          ))}
        </div>
      )}

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={back}>
          {step === 0 ? 'Annuler' : 'Retour'}
        </button>
        <button type="button" className="btn-primary" onClick={next} disabled={!canNext}>
          {last ? 'Commencer la carrière' : 'Suivant'}
        </button>
      </div>
    </main>
  )
}
