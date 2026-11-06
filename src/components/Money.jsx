import { useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { TRIP, VIBES, VIBE_ORDER, caixa } from '../data/trip'
import { useReveal } from '../lib/useReveal'
import { gsap, useGSAP, reduceMotion } from '../lib/gsap'
import Doodle from './Doodle'
import './Money.css'

const brl = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')
const range = (a, b) => (a === b ? brl(a) : `${brl(a)} a ${Math.round(b).toLocaleString('pt-BR')}`)

// Marcas de contagem (risquinhos de 5 em 5), os 2 organizadores em destaque.
function Tally({ n }) {
  const marks = []
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5)
    const k = i % 5
    const gx = g * 70
    const org = i < TRIP.organizers
    if (k < 4) marks.push(<path key={i} d={`M${gx + 8 + k * 13},6 L${gx + 6 + k * 13 + (k % 2)},50`} className={org ? 'is-org' : ''} />)
    else marks.push(<path key={i} d={`M${gx + 1},40 L${gx + 52},14`} className="is-cross" />)
  }
  const groups = Math.ceil(n / 5)
  return (
    <svg className="tally" viewBox={`0 0 ${groups * 70} 56`} style={{ width: groups * 70 }} aria-hidden="true">
      {marks}
    </svg>
  )
}

function Bar({ budget, total, compact, name }) {
  const items = budget.items
  const sumMax = items.reduce((s, it) => s + it.max, 0)
  const sumMin = items.reduce((s, it) => s + it.min, 0)
  const restMin = total - sumMax
  const restMax = total - sumMin
  const pct = (x) => `${(x / total) * 100}%`
  const segs = []
  items.forEach((it) => {
    segs.push({ key: it.key, w: it.min, cls: `seg--${it.key}` })
    if (it.max > it.min) segs.push({ key: it.key + '-r', w: it.max - it.min, cls: 'seg--range' })
  })
  segs.push({ key: 'rest', w: restMin, cls: 'seg--rest' })

  return (
    <div className={`bar ${compact ? 'bar--compact' : ''}`}>
      {name && <p className="bar__name">{name}</p>}
      <div className="bar__track">
        {segs.map((s) => (
          <span key={s.key} className={`seg ${s.cls}`} style={{ width: pct(s.w) }} />
        ))}
      </div>
      <ul className="bar__legend">
        {items.map((it) => (
          <li key={it.key}>
            <i className={`dot seg--${it.key}`} /> {it.label} <b>{range(it.min, it.max)}</b>
          </li>
        ))}
        <li className="bar__rest">
          <i className="dot seg--rest" /> sobra pra {budget.restLabel} <b>{range(restMin, restMax)}</b>
        </li>
      </ul>
    </div>
  )
}

export default function Money() {
  const { v, vibe } = useTrip()
  const [n, setN] = useState(TRIP.people.base)
  const scope = useRef(null)
  const totalRef = useRef(null)
  const shown = useRef({ v: caixa(TRIP.people.base) })
  useReveal(scope, [vibe])

  // número do caixa rola até o novo valor
  useGSAP(
    () => {
      const target = caixa(n)
      gsap.to(shown.current, {
        v: target,
        duration: reduceMotion() ? 0 : 0.9,
        ease: 'expo.out',
        onUpdate: () => totalRef.current && (totalRef.current.textContent = brl(shown.current.v)),
      })
      if (!reduceMotion()) gsap.from('.tally path', { drawSVG: '0%', duration: 0.35, stagger: 0.03, ease: 'power1.in' })
    },
    { scope, dependencies: [n] },
  )

  // barras crescem quando entram na tela
  useGSAP(
    () => {
      if (reduceMotion()) return
      gsap.from('.bar__track .seg', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.9,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.money__split', start: 'top 80%', once: true },
      })
    },
    { scope, dependencies: [vibe], revertOnUpdate: true },
  )

  const base = caixa(TRIP.people.base)
  const others = VIBE_ORDER.filter((id) => id !== vibe)

  return (
    <section className="sec money" id="caixa" ref={scope}>
      <div className="wrap">
        <p className="eyebrow">a parte do dinheiro (rapidinho)</p>
        <h2 className="display h2" data-split>
          Quanto fica e pra onde <em>vai o dinheiro?</em>
        </h2>

        <div className="money__rule">
          <div className="money__big" data-rise>
            <span className="display money__300">
              {brl(TRIP.price)}
              <Doodle type="circle" stroke={3} />
            </span>
            <span className="hand money__pp">por pessoa. só isso.</span>
          </div>
          <p className="money__org" data-rise>
            Quem organiza entra com {brl(TRIP.organizerPrice)} (são {TRIP.organizers} organizadores).
          </p>
        </div>

        <div className="money__sim" data-rise>
          <p className="hand money__if">se a gente for…</p>
          <div className="seg-pick" role="radiogroup" aria-label="Quantas pessoas">
            {TRIP.people.scenarios.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={n === k} onClick={() => setN(k)} className="seg-pick__b">
                <span className="display">{k}</span>
                <small>{k === TRIP.people.base ? 'base' : 'pessoas'}</small>
              </button>
            ))}
          </div>
          <div className="money__tally">
            <Tally n={n} />
            <span className="hand money__tally-note">os 2 risquinhos coloridos são os organizadores</span>
          </div>
          <p className="money__total">
            <span className="money__total-l">no caixa</span>
            <strong className="display" ref={totalRef}>{brl(caixa(n))}</strong>
          </p>
          <p className="money__math">
            {n - TRIP.organizers} × {brl(TRIP.price)} + {TRIP.organizers} × {brl(TRIP.organizerPrice)}
          </p>
        </div>

        <div className="money__split">
          <p className="hand money__base">pra onde vai — na conta base de {TRIP.people.base} pessoas ({brl(base)})</p>
          <p className="money__label">{v.budget.label}</p>
          <Bar budget={v.budget} total={base} />

          <details className="money__others">
            <summary>
              <span>ver como fica nas outras vibes</span>
            </summary>
            <div className="money__others-in">
              {others.map((id) => (
                <Bar key={id} budget={VIBES[id].budget} total={base} compact name={VIBES[id].budget.label} />
              ))}
            </div>
          </details>
          <p className="money__neutral">Todas as opções cabem no mesmo valor por pessoa — a diferença é só quanto sobra pra mesa.</p>
        </div>
      </div>
    </section>
  )
}
