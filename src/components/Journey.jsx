import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { ITINERARIES, PLACEHOLDERS, scenePhotos } from '../data/trip'
import { useReveal } from '../lib/useReveal'
import { useStableVh } from '../lib/useStableVh'
import { gsap, ScrollTrigger, useGSAP, reduceMotion } from '../lib/gsap'
import { sky } from '../gl/sky-state'
import Icon from './Icons'
import './Journey.css'

/*
  O fim de semana contado parada por parada.
  O palco fica "grudado" na tela (position: sticky — quem segura é o navegador,
  não o JavaScript, então não treme) e a rolagem vira o "play":
   - o carrinho anda o tempo todo enquanto você rola (resposta imediata)
   - as fotos de cada parada vão passando como polaroids
   - o céu vira noite nas paradas de sarau e volta a ser dia de manhã
*/

const TILT = [-3, 2.4, -1.6, 3, -2.4, 1.6]
// quanto de rolagem (em alturas de tela) cada parada usa: curto, e um pouco mais por foto
const STEP_BASE = 0.42
const STEP_PER_PHOTO = 0.2

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
          <img
            src={p.src}
            srcSet={p.srcSet}
            sizes="(min-width: 900px) 460px, 80vw"
            alt={p.note}
            loading={Math.abs(d) < 2 ? 'eager' : 'lazy'}
            decoding="async"
            draggable="false"
          />
        </div>
        <figcaption>{p.note}</figcaption>
      </figure>
    )
  })
}

function Stage({ steps, v, setMode }) {
  const track = useRef(null)
  const root = useRef(null)
  const routeBox = useRef(null)
  const N = steps.length
  const [pos, setPos] = useState({ i: 0, ph: 0 })
  const [W, setW] = useState(0)
  const vh = useStableVh()

  const photos = steps.map((s) => scenePhotos(v, s.scene))
  const counts = photos.map((p) => Math.max(1, p.length))
  const weights = counts.map((k) => STEP_BASE + STEP_PER_PHOTO * k)
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
        fill.style.strokeDasharray = `${prog.p} 1` // pathLength=1: sem medir o caminho a cada quadro
      }
      apply()
      const toP = gsap.quickTo(prog, 'p', { duration: reduceMotion() ? 0.01 : 0.35, ease: 'power2.out', onUpdate: apply })
      const cur = { i: -1, ph: -1 }

      ScrollTrigger.create({
        trigger: track.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const f = self.progress * total
          let acc = 0
          let i = 0
          while (i < N - 1 && f > acc + weights[i]) acc += weights[i++]
          const t = Math.min(1, Math.max(0, (f - acc) / weights[i]))
          // o carro anda sem parar: dentro da parada i ele vai de (i - ½) até (i + ½);
          // na primeira sai do nó 1 já no primeiro toque, na última chega no nó final
          const P = i === 0 ? 0.5 * t : i === N - 1 ? N - 1.5 + 0.5 * t : i - 0.5 + t
          toP(Math.min(N - 1, Math.max(0, P)) / (N - 1))
          el.style.setProperty('--t', t.toFixed(3))
          const ph = Math.min(counts[i] - 1, Math.floor(t * counts[i]))
          if (i !== cur.i || ph !== cur.ph) {
            if (i !== cur.i && self.isActive) setMode(steps[i].time)
            cur.i = i
            cur.ph = ph
            setPos({ i, ph })
          }
        },
        onEnter: () => setMode(steps[Math.max(0, cur.i)].time),
        onLeaveBack: () => setMode('day'),
        // a lua sairia em cima do trajeto: some enquanto o palco está na tela
        onToggle: (self) => gsap.to(sky, { moon: self.isActive ? 0 : 1, duration: 0.6, overwrite: 'auto' }),
      })
      // a altura do trilho entra no cálculo de tudo que vem depois
      requestAnimationFrame(() => ScrollTrigger.refresh())
    },
    { scope: root, dependencies: [d, vh], revertOnUpdate: true },
  )

  // troca de parada em camadas: a anterior sai com fade enquanto a nova entra
  const [layers, setLayers] = useState([{ i: 0, id: 0 }])
  const lastPh = useRef({})
  lastPh.current[pos.i] = pos.ph
  useEffect(() => {
    setLayers((ls) => (ls[ls.length - 1].i === pos.i ? ls : [...ls.map((l) => ({ ...l, out: true })), { i: pos.i, id: Date.now() }]))
    const tm = setTimeout(() => setLayers((ls) => ls.filter((l) => !l.out)), 650)
    return () => clearTimeout(tm)
  }, [pos.i])

  return (
    <div className="stage-track" ref={track} style={{ height: Math.round(vh * (1 + total)) }}>
      <div className="stage" ref={root}>
        <div className="stage__route">
          <div className="mr" ref={routeBox}>
            <svg className="mr__svg" width={W} height={H} viewBox={`0 0 ${W || 1} ${H}`} aria-hidden="true">
              <path d={d} className="mr__ghost" />
              <path d={d} className="mr__fill" pathLength="1" />
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
          <div className="stage__stacks">
            {layers.map((l) => (
              <div className={`stage__stack ${l.out ? 'is-out' : 'is-in'}`} key={l.id} aria-hidden={l.out || undefined}>
                <div className="stage__float">
                  <Stack photos={photos[l.i]} idx={l.out ? lastPh.current[l.i] ?? 0 : pos.ph} scene={steps[l.i].scene} />
                </div>
              </div>
            ))}
          </div>
          <div className="st__copies">
            {layers.map((l) => {
              const s = steps[l.i]
              const ph = l.out ? lastPh.current[l.i] ?? 0 : pos.ph
              return (
                <div className={`st__copy ${l.out ? 'is-out' : 'is-in'}`} key={l.id} aria-hidden={l.out || undefined}>
                  <p className="st__count hand">
                    parada {l.i + 1} <span>de {N}</span>
                  </p>
                  <p className="st__when hand">
                    <Icon name={s.icon} size={20} /> {s.when}
                  </p>
                  <h3 className="st__title display">{s.title}</h3>
                  <p className="st__text">{s.text}</p>
                  {l.i === 0 && <p className="st__hint hand" aria-hidden="true">rola pra seguir viagem ↓</p>}
                  {photos[l.i].length > 1 && (
                    <div className="st__dots" aria-hidden="true">
                      {photos[l.i].map((_, k) => (
                        <i key={k} className={k === ph ? 'is-on' : ''} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
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
            Rola a tela: a gente vai parada por parada, de Itacolomi até a volta pra casa.
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
