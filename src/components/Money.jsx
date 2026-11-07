import { useLayoutEffect, useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { TRIP, VIBES, VIBE_ORDER, caixa } from '../data/trip'
import { useReveal } from '../lib/useReveal'
import { gsap, useGSAP, reduceMotion } from '../lib/gsap'
import Doodle from './Doodle'
import './Money.css'

const brl = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')
const range = (a, b) => (a === b ? brl(a) : `${brl(a)} a ${Math.round(b).toLocaleString('pt-BR')}`)

// Marcas de contagem (risquinhos de 5 em 5), uma por pessoa.
function Tally({ n }) {
  const marks = []
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5)
    const k = i % 5
    const gx = g * 70
    if (k < 4) marks.push(<path key={i} d={`M${gx + 8 + k * 13},6 L${gx + 6 + k * 13 + (k % 2)},50`} />)
    else marks.push(<path key={i} d={`M${gx + 1},40 L${gx + 52},14`} className="is-cross" />)
  }
  const groups = Math.ceil(n / 5)
  return (
    <svg className="tally" viewBox={`0 0 ${groups * 70} 56`} style={{ width: groups * 70 }} aria-hidden="true">
      {marks}
    </svg>
  )
}

// Itens do orçamento resolvidos pra N pessoas (ingresso por pessoa acompanha o N).
const resolve = (budget, n) =>
  budget.items.map((it) =>
    it.perPerson
      ? { ...it, label: `${it.label} (${n} × ${brl(it.perPerson)})`, min: n * it.perPerson, max: n * it.perPerson }
      : it,
  )

/*
  Barra do orçamento com os nomes escritos em cima/embaixo de cada pedaço (sem legenda separada).
  A conta usa o valor mais alto de cada item: o que "sobra" é o mínimo garantido.
  As etiquetas são distribuídas em duas faixas (em cima e embaixo) pra não se encostarem;
  a medição roda só quando muda o tamanho ou os números, nunca na rolagem.
*/
function Bar({ budget, total, n, compact, name }) {
  const items = resolve(budget, n)
  const sumMax = items.reduce((s, it) => s + it.max, 0)
  const sumMin = items.reduce((s, it) => s + it.min, 0)
  const rest = total - sumMax // sobra garantida (pior caso)
  const restBest = total - sumMin
  const scale = Math.max(total, sumMax) // se faltar dinheiro, a barra passa do caixa

  // pedaços da barra: cada gasto no valor mínimo; a diferença (preço que ainda pode variar) fica
  // listrada logo antes da sobra — se a hospedagem vier mais barata, essa parte vira sobra
  const spread = sumMax - sumMin
  const bars = [
    ...items.map((it) => ({ key: it.key, w: it.min })),
    { key: 'range', w: spread },
    { key: 'rest', w: Math.max(0, rest) },
  ].filter((b) => b.w > 0)
  let acc = 0
  const at = {}
  bars.forEach((b) => {
    at[b.key] = [acc, acc + b.w]
    acc += b.w
  })
  // etiquetas: uma por gasto + a sobra (que cobre a parte listrada e a sobra garantida)
  const segs = items.map((it) => ({
    key: it.key,
    c: (at[it.key][0] + it.min / 2) / scale,
    name: it.label.charAt(0).toLowerCase() + it.label.slice(1),
    val: it.min === it.max ? brl(it.max) : range(it.min, it.max),
  }))
  if (restBest > 0) {
    segs.push({
      key: 'rest',
      c: (sumMin + restBest / 2) / scale, // meio do trecho entre os gastos mínimos e o fim do caixa
      name: 'sobra',
      val: rest > 0 && spread ? range(rest, restBest) : rest > 0 ? brl(rest) : `até ${brl(restBest)}`,
    })
  }

  const chart = useRef(null)
  const lbls = useRef([])
  const [W, setW] = useState(0)
  const [pos, setPos] = useState(null)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(chart.current)
    return () => ro.disconnect()
  }, [])
  const sig = segs.map((sg) => sg.key + sg.c + sg.val).join() + W
  useLayoutEffect(() => {
    if (!W) return
    // faixas: em cima, embaixo e, se precisar, uma segunda linha mais afastada de cada lado
    const LANES = ['up', 'down', 'up2', 'down2']
    const ends = Object.fromEntries(LANES.map((l) => [l, -Infinity]))
    const gap = 10
    setPos(
      segs.map((sg, i) => {
        const w = lbls.current[i]?.offsetWidth || 0
        const c = sg.c * W
        const want = Math.min(Math.max(c - w / 2, 0), W - w)
        const lane = LANES.find((l) => want >= ends[l] + gap) || LANES.reduce((a, l) => (ends[l] < ends[a] ? l : a))
        const x = Math.min(Math.max(want, ends[lane] + gap), W - w)
        ends[lane] = x + w
        return { lane, x, c }
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])

  let head
  if (rest >= 0)
    head = (
      <>
        sobra <b>{spread ? range(rest, restBest) : brl(rest)}</b> pra {budget.restLabel}
        <small> (~{spread ? `${brl(rest / n)} a ${Math.round(restBest / n)}` : brl(rest / n)} por pessoa)</small>
      </>
    )
  else if (restBest >= 0)
    head = (
      <>
        sobra até <b>{brl(restBest)}</b>, mas pode faltar <b className="is-short">{brl(-rest)}</b> se a hospedagem vier no valor mais alto
      </>
    )
  else
    head = (
      <>
        falta <b className="is-short">{spread ? range(-restBest, -rest) : brl(-rest)}</b> pra fechar a conta
      </>
    )

  const ranged = items.filter((it) => it.min !== it.max)

  return (
    <div className={`bar ${compact ? 'bar--compact' : ''}`}>
      {name && <p className="bar__name">{name}</p>}
      <p className={`bar__head ${rest < 0 ? 'is-short' : ''}`}>{head}</p>
      <div
        className={`bar__chart ${pos?.some((q) => q.lane === 'up2') ? 'has-up2' : ''} ${pos?.some((q) => q.lane === 'down2') ? 'has-down2' : ''}`}
        ref={chart}
      >
        <div className="bar__track">
          {bars.map((b) => (
            <span key={b.key} className={`seg seg--${b.key}`} style={{ width: `${(b.w / scale) * 100}%` }} />
          ))}
          {sumMax > total && <span className="bar__limit" style={{ left: `${(total / scale) * 100}%` }} title="até aqui é o caixa" />}
        </div>
        {segs.map((sg, i) => {
          const p = pos?.[i]
          return (
            <span key={sg.key} className={`lbl lbl--${p?.lane || 'up'} lbl--${sg.key}`} style={{ visibility: p ? 'visible' : 'hidden' }}>
              {p && <i className="lbl__tick" style={{ left: p.c }} />}
              <span className="lbl__box" ref={(el) => (lbls.current[i] = el)} style={{ left: p?.x || 0 }}>
                <span className="lbl__n hand">{sg.name}</span>
                <b className="lbl__v">{sg.val}</b>
              </span>
            </span>
          )
        })}
      </div>
      {ranged.length > 0 && (
        <p className="bar__fine">
          <i className="dot seg--range" /> a parte listrada é a diferença no preço {ranged.length > 1 ? 'desses itens' : `da ${ranged[0].label.toLowerCase()}`} ({ranged.map((it) => range(it.min, it.max)).join(', ')}): se vier mais barato, vira sobra.
        </p>
      )}
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

  const total = caixa(n)
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
          </div>
          <p className="money__total">
            <span className="money__total-l">no caixa</span>
            <strong className="display" ref={totalRef}>{brl(caixa(n))}</strong>
          </p>
        </div>

        <div className="money__split">
          <p className="hand money__base">pra onde vão os {brl(total)} (com {n} pessoas)</p>
          <p className="money__label">{v.budget.label}</p>
          <Bar budget={v.budget} total={total} n={n} />

          <details className="money__others">
            <summary>
              <span>ver como fica nas outras vibes</span>
            </summary>
            <div className="money__others-in">
              {others.map((id) => (
                <Bar key={id} budget={VIBES[id].budget} total={total} n={n} compact name={VIBES[id].budget.label} />
              ))}
            </div>
          </details>
          <p className="money__neutral">Hospedagem, transporte e diversão têm preço fechado; o que muda com o número de gente é quanto sobra pra mesa. Troca ali em cima entre 9, 12 e 15 pra ver.</p>
        </div>
      </div>
    </section>
  )
}
