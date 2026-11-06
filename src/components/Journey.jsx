import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { ITINERARIES, PLACEHOLDERS, scenePhotos } from '../data/trip'
import { useReveal } from '../lib/useReveal'
import { gsap, ScrollTrigger, useGSAP, reduceMotion } from '../lib/gsap'
import { sky } from '../gl/sky-state'
import Icon from './Icons'
import './Journey.css'

/*
  O fim de semana contado parada por parada.
  A tela trava (pin) e a rolagem vira o "play":
   - o trajeto em miniatura fica fixo no topo e o carrinho anda até a próxima parada
   - as fotos de cada parada vão passando como polaroids
   - o céu vira noite nas paradas de sarau e volta a ser dia de manhã
*/

const TILT = [-3, 2.4, -1.6, 3, -2.4, 1.6]

function Stack({ photos, idx, scene }) {
  if (!photos.length) {
    return (
      <div className="ph ph--empty">
        <svg viewBox="0 0 24 24" className="ph__cam" aria-hidden="true">
          <path d="M4 8.5h3l1.6-2.2h6.8L17 8.5h3v10H4z" />
          <circle cx="12" cy="13.3" r="3.3" />
        </svg>
        <p className="hand">{PLACEHOLDERS[scene] || 'foto aqui'}</p>
        <span className="ph__soon">em breve</span>
      </div>
    )
  }
  return photos.map((p, i) => {
    const d = i - idx
    const style =
      d < 0
        ? { transform: `translate(-120%, -6%) rotate(-22deg)`, opacity: 0, zIndex: 50 }
        : { transform: `translate(${d * 12}px, ${d * 10}px) rotate(${TILT[i % TILT.length] + d * 2}deg) scale(${1 - d * 0.05})`, opacity: d > 3 ? 0 : 1, zIndex: 40 - d }
    return (
      <figure className="polaroid ph" key={p.src + i} style={style} aria-hidden={d !== 0}>
        {i === 0 && <span className="tape" style={{ top: -12, left: '50%', transform: 'translateX(-50%) rotate(-3deg)' }} />}
        <div className="ph__img">
          <img src={p.src} alt={p.note} loading="lazy" draggable="false" />
        </div>
        <figcaption>{p.note}</figcaption>
      </figure>
    )
  })
}

function Stage({ steps, v, setMode }) {
  const root = useRef(null)
  const routeBox = useRef(null)
  const N = steps.length
  const [pos, setPos] = useState({ i: 0, ph: 0 })
  const [W, setW] = useState(0)

  const photos = steps.map((s) => scenePhotos(v, s.scene))
  const counts = photos.map((p) => Math.max(1, p.length))
  const weights = counts.map((k) => 0.8 + 0.32 * k) // mais fotos = parada mais longa
  const total = weights.reduce((a, b) => a + b, 0)

  // geometria do trajeto em miniatura (onda passando pelas paradas)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(routeBox.current)
    return () => ro.disconnect()
  }, [])
  const H = 60
  const pad = 26
  const nodes = steps.map((_, i) => [pad + (i * (W - pad * 2)) / Math.max(1, N - 1), i % 2 ? H - 16 : 16])
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
        gsap.set(fill, { drawSVG: `0% ${prog.p * 100}%` })
      }
      apply()
      const cur = { i: -1, ph: -1 }
      const ease = gsap.parseEase('power2.inOut')

      ScrollTrigger.create({
        trigger: el,
        pin: true,
        start: 'top top',
        end: () => '+=' + Math.round(total * innerHeight * 0.8),
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const f = self.progress * total
          let acc = 0
          let i = 0
          while (i < N - 1 && f > acc + weights[i]) acc += weights[i++]
          const t = Math.min(1, Math.max(0, (f - acc) / weights[i]))
          const ph = Math.min(counts[i] - 1, Math.floor(t * 0.86 * counts[i]))
          if (i !== cur.i || ph !== cur.ph) {
            if (i !== cur.i && self.isActive) setMode(steps[i].time)
            cur.i = i
            cur.ph = ph
            setPos({ i, ph })
          }
          // o carro fica parado na parada e só anda no fim dela
          const move = i < N - 1 ? ease(Math.max(0, (t - 0.86) / 0.14)) : 0
          gsap.to(prog, { p: (i + move) / (N - 1), duration: reduceMotion() ? 0 : 0.7, ease: 'power3.out', overwrite: true, onUpdate: apply })
        },
        onEnter: () => setMode(steps[Math.max(0, cur.i)].time),
        // a lua sairia em cima do trajeto: some enquanto a tela está travada
        onToggle: (self) => gsap.to(sky, { moon: self.isActive ? 0 : 1, duration: 0.6, overwrite: 'auto' }),
        onLeaveBack: () => setMode('day'),
      })
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [d], revertOnUpdate: true },
  )

  // troca de parada: texto e fotos entram
  useGSAP(
    () => {
      if (reduceMotion()) return
      gsap.from('.st__copy > *', { y: 34, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: 'expo.out' })
      gsap.from('.stage__stack', { y: 90, rotate: 8, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.3)' })
    },
    { scope: root, dependencies: [pos.i] },
  )

  const s = steps[pos.i]
  return (
    <div className="stage-wrap">
    <div className="stage" ref={root}>
      <div className="stage__route">
        <div className="mr" ref={routeBox}>
          <svg className="mr__svg" width={W} height={H} viewBox={`0 0 ${W || 1} ${H}`} aria-hidden="true">
            <path d={d} className="mr__ghost" />
            <path d={d} className="mr__fill" />
            {W > 0 &&
              nodes.map(([x, y], i) => (
                <g key={i} className={`mr__node ${i < pos.i ? 'is-past' : ''} ${i === pos.i ? 'is-now' : ''}`}>
                  <circle cx={x} cy={y} r="13" />
                  <text x={x} y={y + 5} textAnchor="middle">{i + 1}</text>
                </g>
              ))}
          </svg>
          <div className="mr__car" aria-hidden="true">
            <Icon name={v.id === 'ody' ? 'van' : 'car'} size={18} stroke={2} />
          </div>
          <ol className="mr__labels" aria-label="Paradas">
            {steps.map((st, i) => (
              <li key={i} style={{ left: W ? nodes[i][0] : 0 }} className={i === pos.i ? 'is-now' : ''} aria-current={i === pos.i ? 'step' : undefined}>
                {st.short}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="stage__body">
        <div className="stage__stack" key={'k' + pos.i}>
          <Stack photos={photos[pos.i]} idx={pos.ph} scene={s.scene} />
        </div>
        <div className="st__copy" key={'c' + pos.i}>
          <p className="st__count hand">
            parada {pos.i + 1} <span>de {N}</span>
          </p>
          <p className="st__when hand">
            <Icon name={s.icon} size={20} /> {s.when}
          </p>
          <h3 className="st__title display">{s.title}</h3>
          <p className="st__text">{s.text}</p>
          {pos.i === 0 && <p className="st__hint hand" aria-hidden="true">rola pra seguir viagem ↓</p>}
          {photos[pos.i].length > 1 && (
            <div className="st__dots" aria-hidden="true">
              {photos[pos.i].map((_, k) => (
                <i key={k} className={k === pos.ph ? 'is-on' : ''} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default function Journey() {
  const { v, vibe, setMode } = useTrip()
  const ids = v.itineraries
  const [itId, setItId] = useState(ids[0])
  const scope = useRef(null)
  useReveal(scope, [vibe])

  useEffect(() => setItId(v.itineraries[0]), [vibe])
  const it = ITINERARIES[ids.includes(itId) ? itId : ids[0]]
  const steps = it.steps(v)

  return (
    <section className="jr" id="jornada" ref={scope}>
      <div className="sec jr__intro">
        <div className="wrap" key={vibe}>
          <p className="eyebrow">passo 2 — o fim de semana</p>
          <h2 className="display h2" data-split>
            Como funciona o nosso <em>fim de semana?</em>
          </h2>
          <p className="lede jr__lede" data-rise>
            Rola devagar: a gente vai parada por parada, de Itacolomi até a volta pra casa.
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
      <Stage key={vibe + it.id} steps={steps} v={v} setMode={setMode} />
    </section>
  )
}
