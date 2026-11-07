import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { ITINERARIES, PLACEHOLDERS, scenePhotos } from '../data/trip'
import { useReveal } from '../lib/useReveal'
import { scrollToEl } from '../lib/scroll'
import { gsap, ScrollTrigger, useGSAP, reduceMotion } from '../lib/gsap'
import { sky } from '../gl/sky-state'
import Mural from './Mural'
import Icon from './Icons'
import './Journey.css'

/*
  O fim de semana contado parada por parada, com rolagem normal (nada trava a tela).
  Só o trajeto em miniatura fica grudado no topo (position: sticky) enquanto as paradas passam:
   - o carrinho anda junto com a rolagem e o nó da parada da vez acende
   - tocar num nó leva até a parada
   - o céu vira noite na parada do sarau e volta a ser dia de manhã
*/

// foto deitada (paisagem) ganha a polaroid larga, sem cortar
const wide = (fig) => {
  const img = fig?.querySelector('img')
  if (img?.naturalWidth > img?.naturalHeight) fig.classList.add('is-wide')
}

function Pics({ photos, scene }) {
  if (!photos.length) {
    return (
      <div className="chap__empty">
        <svg viewBox="0 0 24 24" className="chap__cam" aria-hidden="true">
          <path d="M4 8.5h3l1.6-2.2h6.8L17 8.5h3v10H4z" />
          <circle cx="12" cy="13.3" r="3.3" />
        </svg>
        <p className="hand">{PLACEHOLDERS[scene] || 'foto aqui'}</p>
        <span>em breve</span>
      </div>
    )
  }
  if (photos.length === 1) {
    const p = photos[0]
    return (
      <figure className="polaroid chap__one" data-pop ref={(el) => el && el.querySelector('img')?.complete && wide(el)}>
        <span className="tape" style={{ top: -12, left: '50%', transform: 'translateX(-50%) rotate(-3deg)' }} />
        <div className="chap__img">
          <img
            src={p.src}
            srcSet={p.srcSet}
            sizes="(min-width: 900px) 640px, 92vw"
            alt={p.note}
            loading="lazy"
            decoding="async"
            onLoad={(e) => wide(e.currentTarget.closest('figure'))}
          />
        </div>
        <figcaption>{p.note}</figcaption>
      </figure>
    )
  }
  return <Mural photos={photos} className="chap__mural" />
}

function Trip({ steps, v, setMode }) {
  const root = useRef(null)
  const routeBox = useRef(null)
  const N = steps.length
  const [active, setActive] = useState(0)
  const [W, setW] = useState(0)
  const photos = steps.map((s) => scenePhotos(v, s.scene))

  // geometria do trajeto em miniatura (onda passando pelas paradas)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(routeBox.current)
    return () => ro.disconnect()
  }, [])
  // trajeto compacto: cabe na mesma linha da marca "jan/27"
  const H = 36
  const pad = 14
  const nodes = steps.map((_, i) => [pad + (i * (W - pad * 2)) / Math.max(1, N - 1), i % 2 ? H - 10 : 10])
  let d = ''
  if (W) {
    d = `M${nodes[0][0]},${nodes[0][1]}`
    for (let i = 1; i < N; i++) {
      const [x0, y0] = nodes[i - 1]
      const [x1, y1] = nodes[i]
      const k = (x1 - x0) * 0.5
      d += ` C${x0 + k},${y0} ${x1 - k},${y1} ${x1},${y1}`
    }
  }

  useGSAP(
    () => {
      if (!d) return
      const el = root.current
      const path = el.querySelector('.mr__ghost')
      const fill = el.querySelector('.mr__fill')
      const car = el.querySelector('.mr__car')
      const carTween = gsap.to(car, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, ease: 'none', paused: true })
      const prog = { p: 0 }
      const apply = () => {
        carTween.progress(prog.p)
        fill.style.strokeDasharray = `${prog.p} 1` // pathLength=1: sem medir o caminho a cada quadro
      }
      apply()
      const toP = gsap.quickTo(prog, 'p', { duration: reduceMotion() ? 0.01 : 0.45, ease: 'power2.out', onUpdate: apply })

      // cada parada empurra o carro do meio do caminho anterior até o meio do próximo
      el.querySelectorAll('.chap').forEach((chap, i) => {
        ScrollTrigger.create({
          trigger: chap,
          start: 'top 60%',
          end: 'bottom 60%',
          onUpdate: (self) => {
            const t = self.progress
            const P = i === 0 ? 0.5 * t : i === N - 1 ? N - 1.5 + 0.5 * t : i - 0.5 + t
            toP(Math.min(N - 1, Math.max(0, P)) / (N - 1))
          },
          onToggle: (self) => {
            if (!self.isActive) return
            setActive(i)
            setMode(steps[i].time)
          },
        })
      })

      // antes da primeira parada é dia; a lua some enquanto o trajeto está na tela
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onLeaveBack: () => setMode('day'),
        onToggle: (self) => gsap.to(sky, { moon: self.isActive ? 0 : 1, duration: 0.6, overwrite: 'auto' }),
      })
      requestAnimationFrame(() => ScrollTrigger.refresh())
    },
    { scope: root, dependencies: [d], revertOnUpdate: true },
  )

  return (
    <div className="trip" ref={root}>
      {/* só isto fica grudado no topo */}
      <div className="trip__bar">
        <div className="mr" ref={routeBox}>
          <svg className="mr__svg" width={W} height={H} viewBox={`0 0 ${W || 1} ${H}`} aria-hidden="true">
            {/* contorno da cor do fundo: separa o traço do conteúdo que passa por baixo, sem precisar de faixa */}
            <path d={d} className="mr__halo" />
            <path d={d} className="mr__ghost" />
            <path d={d} className="mr__fill" pathLength="1" />
            {W > 0 &&
              nodes.map(([x, y], i) => (
                <g key={i} className={`mr__node ${i < active ? 'is-past' : ''} ${i === active ? 'is-now' : ''}`}>
                  <circle cx={x} cy={y} r="11.5" className="mr__ring" />
                  <circle cx={x} cy={y} r="8.5" />
                  <text x={x} y={y + 4} textAnchor="middle">{i + 1}</text>
                </g>
              ))}
          </svg>
          <div className="mr__car" aria-hidden="true">
            <Icon name={v.id === 'ody' ? 'van' : 'car'} size={14} stroke={2.2} />
          </div>
          {W > 0 && (
            <span className="mr__now hand" style={{ left: nodes[active][0] }} aria-hidden="true">
              {steps[active].short}
            </span>
          )}
          <ol className="mr__hits" aria-label="Ir pra parada">
            {steps.map((st, i) => (
              <li key={i} style={{ left: W ? nodes[i][0] : 0, top: W ? nodes[i][1] : 0 }}>
                <button
                  type="button"
                  aria-label={`Parada ${i + 1}: ${st.short}`}
                  aria-current={i === active ? 'step' : undefined}
                  onClick={() => scrollToEl(root.current.querySelectorAll('.chap')[i], { offset: -80 })}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ol className="trip__list">
        {steps.map((s, i) => (
          <li key={i} className={`chap chap--${i % 2 ? 'r' : 'l'} ${i === active ? 'is-now' : ''}`}>
            <span className="chap__big display" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div className="chap__copy">
              <p className="chap__count hand" data-rise>
                parada {i + 1} <span>de {N}</span>
              </p>
              <p className="chap__when hand" data-rise>
                <Icon name={s.icon} size={20} /> {s.when}
              </p>
              <h3 className="chap__title display" data-split>{s.title}</h3>
              <p className="chap__text" data-rise>{s.text}</p>
            </div>
            <div className="chap__pics" data-rise>
              <Pics photos={photos[i]} scene={s.scene} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Journey() {
  const { v, vibe, setMode } = useTrip()
  const ids = v.itineraries
  const [itId, setItId] = useState(ids[0])
  const scope = useRef(null)

  useEffect(() => setItId(v.itineraries[0]), [vibe])
  const it = ITINERARIES[ids.includes(itId) ? itId : ids[0]]
  const steps = it.steps(v)
  useReveal(scope, [vibe, it.id])

  // trocar de roteiro muda a altura da página
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [it.id])

  return (
    <section className="jr" id="jornada" ref={scope}>
      <div className="sec jr__intro">
        <div className="wrap" key={vibe}>
          <p className="eyebrow">passo 2 — o fim de semana</p>
          <h2 className="display h2" data-split>
            Como funciona o nosso <em>fim de semana?</em>
          </h2>
          <p className="lede jr__lede" data-rise>
            Parada por parada, de Itacolomi até a volta pra casa. O trajeto lá em cima vai mostrando onde a gente está.
          </p>
          {ids.length > 1 ? (
            <div className="jr__tabs" role="tablist" aria-label="Formatos de roteiro" data-rise>
              {ids.map((id) => (
                <button key={id} role="tab" type="button" aria-selected={it.id === id} className="jr__tab" onClick={() => setItId(id)}>
                  <span className="jr__tab-name display">{ITINERARIES[id].tab}</span>
                  <span className="jr__tab-note hand">{ITINERARIES[id].tabNote}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="jr__single hand" data-rise>{it.tabNote}</p>
          )}
        </div>
      </div>
      <Trip key={vibe + it.id} steps={steps} v={v} setMode={setMode} />
    </section>
  )
}
