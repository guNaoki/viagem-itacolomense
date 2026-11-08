import { useEffect, useRef, useState } from 'react'
import { TRIP, VIBES, VIBE_ORDER } from '../data/trip'
import { useVotes, PRESENCE, CHOICES, PREVIEW } from '../lib/votes'
import './Votacao.css'

/*
  Votação dentro do "Bora?":
   (votação das vibes encerrada: a chácara venceu; sobrou só o quem vai)
   1) Quem vai: contador até 12 (meta), com o mínimo (9) e o teto (15) marcados
   2) Cédula: nome, se vai, e uma nota pra cada vibe (topo / pode ser / não curto)
   3) Como tá: placar das vibes (topo = 1 ponto, pode ser = meio, não curto = 0)
*/
const { min: MIN, base: GOAL, max: MAX } = TRIP.people

// "talvez" entra na conta total, mas aparece hachurado (ainda não é certeza)
function QuemVai({ people }) {
  const ins = people.filter((p) => p.presence === 'in')
  const maybe = people.filter((p) => p.presence === 'maybe')
  const sure = ins.length
  const n = sure + maybe.length
  let msg
  if (n < MIN) msg = <>faltam <b>{MIN - n}</b> pro mínimo ({MIN}) e <b>{GOAL - n}</b> pra fechar em {GOAL}</>
  else if (n < GOAL) msg = <>já dá pra ir! faltam <b>{GOAL - n}</b> pra fechar em {GOAL}</>
  else if (n <= MAX) msg = <>fechou {GOAL}! {n < MAX ? <>ainda cabe{MAX - n > 1 ? 'm' : ''} <b>{MAX - n}</b></> : 'lotou'}</>
  else msg = <>passou de {MAX}: a gente vai ter que conversar</>

  return (
    <div className={`qv ${n >= GOAL ? 'is-done' : ''}`}>
      <p className="qv__h hand">quem vai</p>
      <p className="qv__count">
        <strong className="display">{n}</strong>
        <span className="qv__of">de <b>{GOAL}</b></span>
      </p>
      {maybe.length > 0 && (
        <p className="qv__split">
          <i className="qv__key is-in" /> {sure} {sure === 1 ? 'confirmado' : 'confirmados'}
          <i className="qv__key is-maybe" /> {maybe.length} talvez
        </p>
      )}
      <ol className="qv__slots" aria-label={`${sure} confirmados e ${maybe.length} talvez, de ${GOAL}`}>
        {Array.from({ length: Math.max(MAX, n) }, (_, i) => (
          <li
            key={i}
            className={`qv__slot ${i < sure ? 'is-in' : i < n ? 'is-maybe' : ''} ${i >= GOAL ? 'is-extra' : ''} ${i === MIN - 1 ? 'is-min' : ''} ${i === GOAL - 1 ? 'is-goal' : ''}`}
            title={i < sure ? ins[i]?.name : maybe[i - sure]?.name}
          >
            {i === MIN - 1 && <span className="qv__mark hand">mínimo</span>}
            {i === GOAL - 1 && <span className="qv__mark hand">meta</span>}
          </li>
        ))}
      </ol>
      <p className="qv__msg">{msg}</p>
      {n > 0 && (
        <p className="qv__names hand">
          {ins.map((p) => p.name).join(' · ')}
          {maybe.length > 0 && <span className="qv__maybe">{sure ? ' — ' : ''}talvez: {maybe.map((p) => p.name).join(' · ')}</span>}
        </p>
      )}
    </div>
  )
}

function Cedula({ myName, mine, vote }) {
  const [name, setName] = useState(myName)
  const [presence, setPresence] = useState(mine?.presence || '')
  const [state, setState] = useState('') // '' | saving | saved | error

  // quando a planilha responde com o meu voto antigo, preenche a cédula
  useEffect(() => {
    if (!mine) return
    setPresence((p) => p || mine.presence || '')
  }, [mine])

  const ready = name.trim() && presence
  const send = async (e) => {
    e.preventDefault()
    if (!ready) return
    setState('saving')
    const ok = await vote({ name: name.trim().slice(0, 40), presence, votes: mine?.votes || {} })
    setState(ok ? 'saved' : 'error')
  }
  const touch = (fn) => (...a) => {
    fn(...a)
    if (state === 'saved' || state === 'error') setState('')
  }

  return (
    <form className="ced" onSubmit={send}>
      <span className="tape" style={{ top: -12, left: 40, transform: 'rotate(-4deg)' }} />
      <p className="ced__h hand">{mine ? 'tua resposta (dá pra mudar)' : 'tua resposta'}</p>

      <label className="ced__row">
        <span className="ced__lbl">1. teu nome</span>
        <input
          className="ced__name"
          value={name}
          onChange={touch((e) => setName(e.target.value))}
          placeholder="como a galera te chama"
          maxLength={40}
          autoComplete="given-name"
          enterKeyHint="done"
        />
      </label>

      <fieldset className="ced__row">
        <legend className="ced__lbl">2. vai?</legend>
        <div className="pills">
          {Object.entries(PRESENCE).map(([id, label]) => (
            <button key={id} type="button" className={`pill pill--${id}`} aria-pressed={presence === id} onClick={touch(() => setPresence(id))}>
              {label}
            </button>
          ))}
        </div>
        <p className="ced__hint">{TRIP.notes.confirm}</p>
      </fieldset>

      <div className="ced__send">
        <button type="submit" className="btn" disabled={!ready || state === 'saving'}>
          {state === 'saving' ? 'mandando…' : mine ? 'atualizar' : 'confirmar'}
          <span className="btn__dot" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
        </button>
        <p className={`ced__state hand is-${state || 'idle'}`} aria-live="polite">
          {state === 'saved' && 'salvo! valeu'}
          {state === 'error' && 'não foi… tenta de novo?'}
          {!state && !ready && (name.trim() ? 'falta dizer se vai' : 'começa pelo nome')}
        </p>
      </div>
    </form>
  )
}

function ComoTa({ people }) {
  const rows = VIBE_ORDER.map((id) => {
    const got = people.map((p) => p.votes?.[id]).filter(Boolean)
    const count = Object.fromEntries(CHOICES.map((c) => [c.id, got.filter((x) => x === c.id).length]))
    const score = CHOICES.reduce((s, c) => s + count[c.id] * c.score, 0)
    return { id, v: VIBES[id], count, score, n: got.length }
  })
  const best = Math.max(...rows.map((r) => r.score))
  const most = Math.max(1, ...rows.map((r) => r.n))
  const sorted = [...rows].sort((a, b) => b.score - a.score)

  return (
    <div className="ct">
      <p className="ct__h hand">resultado final</p>
      <p className="ct__win display">A <em>chácara</em> venceu!</p>
      <ol className="ct__list">
        {sorted.map((r) => (
          <li key={r.id} className={`ct__row ${r.score === best && best > 0 ? 'is-lead' : ''}`} data-v={r.id}>
            <span className="ct__name display">
              {r.v.short}
              {r.score === best && best > 0 && <span className="ct__lead hand">na frente</span>}
            </span>
            <span className="ct__pts">
              {String(r.score).replace('.', ',')} <small>pts</small>
            </span>
            <span className="ct__track">
              <span className="ct__fill" style={{ width: `${(r.score / most) * 100}%` }} />
            </span>
            <span className="ct__detail">
              {CHOICES.map((c) => `${r.count[c.id]} ${c.label}`).join(' · ')}
            </span>
          </li>
        ))}
      </ol>
      <p className="ct__how">votação encerrada. Valeu por votar, galera!</p>
    </div>
  )
}

export default function Votacao() {
  const ref = useRef(null)
  const { people, status, vote, myName, mine } = useVotes(ref)

  return (
    <div className="vot" id="votacao" ref={ref}>
      {PREVIEW && (
        <p className="vot__preview">
          <b>prévia:</b> a planilha ainda não está ligada. Os votos de "Exemplo" são de mentira e o teu fica só neste aparelho.
        </p>
      )}
      {status === 'error' && <p className="vot__preview">não deu pra carregar os votos agora. Tenta de novo daqui a pouco.</p>}
      <QuemVai people={people} />
      <div className="vot__grid">
        <Cedula myName={myName} mine={mine} vote={vote} />
        <ComoTa people={people} />
      </div>
    </div>
  )
}
