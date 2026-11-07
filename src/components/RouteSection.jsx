import { useEffect, useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { ROUTES, TRANSPORT, TRIP } from '../data/trip'
import { useReveal } from '../lib/useReveal'
import { gsap, ScrollTrigger, useGSAP, reduceMotion } from '../lib/gsap'
import Icon from './Icons'
import Doodle from './Doodle'
import './RouteSection.css'

// posições (estilizadas, mas respeitando a geografia: Itacolomi ao sul,
// Londrina/Cambé a nordeste, Iguaraçu a noroeste de Apucarana)
const LAYOUT = {
  londrina: {
    wide: { vb: [1000, 440], pts: [[150, 370], [360, 250], [850, 90]] },
    tall: { vb: [360, 560], pts: [[80, 500], [130, 330], [270, 80]] },
  },
  iguaracu: {
    wide: { vb: [1000, 440], pts: [[850, 370], [620, 250], [150, 90]], via: 1 },
    tall: { vb: [360, 560], pts: [[270, 500], [230, 340], [80, 80]], via: 1 },
  },
}

// curva suave com um "balanço" de estrada entre os pontos
function roadPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const dx = x1 - x0
    const dy = y1 - y0
    const s = i % 2 ? 1 : -1
    d += ` C${x0 + dx * 0.15 + dy * 0.35 * s},${y0 + dy * 0.45 - dx * 0.25 * s} ${x1 - dx * 0.5 - dy * 0.2 * s},${y1 - dy * 0.2 + dx * 0.15 * s} ${x1},${y1}`
  }
  return d
}

function useWide() {
  const q = '(min-width: 760px)'
  const [wide, setWide] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const m = matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

function RouteMap({ routeId, vehicle, destName }) {
  const wide = useWide()
  const route = ROUTES[routeId]
  const L = LAYOUT[routeId][wide ? 'wide' : 'tall']
  const [W, H] = L.vb
  const stops =
    routeId === 'iguaracu'
      ? [route.stops[0], { name: 'Apucarana', small: true, leg: null }, route.stops[1]]
      : route.stops
  const d = roadPath(L.pts)
  const ref = useRef(null)

  useGSAP(
    () => {
      const road = ref.current.querySelector('.map__road-top')
      const car = ref.current.querySelector('.map__car')
      const pinEl = ref.current.closest('.route__pin')
      const trackEl = ref.current.closest('.route__track')
      if (reduceMotion()) return
      // a tela trava no mapa enquanto o carro faz a viagem inteira
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        // o mapa fica grudado (sticky) enquanto o trilho passa; a rolagem dirige o carro
        scrollTrigger: { trigger: trackEl, start: 'top 64px', end: 'bottom bottom', scrub: 0.4 },
      })
      tl.fromTo(ref.current.querySelectorAll('.map__road-base, .map__road-top'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1 }, 0.05)
        .to(car, { motionPath: { path: road, align: road, alignOrigin: [0.5, 0.5] }, duration: 1, immediateRender: true }, 0.05)
        .to({}, { duration: 0.15 })
      gsap.from(ref.current.querySelectorAll('.map__stop'), {
        scale: 0,
        transformOrigin: '50% 50%',
        stagger: 0.2,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: pinEl, start: 'top 80%', once: true },
      })
      requestAnimationFrame(() => ScrollTrigger.refresh())
    },
    { scope: ref, dependencies: [d], revertOnUpdate: true },
  )

  // contornos de "mapa topográfico" ao fundo
  const contours = Array.from({ length: 6 }, (_, i) => {
    const y = (H / 7) * (i + 1)
    return `M-20,${y} C${W * 0.25},${y - 40 + i * 9} ${W * 0.55},${y + 50 - i * 6} ${W + 20},${y - 10}`
  })

  return (
    <div className={`map ${wide ? '' : 'map--tall'}`} ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} className="map__svg" role="img" aria-label={`Rota: ${route.stops.map((s) => s.name).join(' até ')}, ${route.total}`}>
        {contours.map((c, i) => (
          <path key={i} d={c} className="map__contour" />
        ))}
        <path d={d} className="map__road-base" />
        <path d={d} className="map__road-top" />
        {L.pts.map(([x, y], i) => {
          const s = stops[i]
          const right = wide ? x < W * 0.6 : x < W / 2
          return (
            <g key={s.name} className={`map__stop ${s.dest ? 'is-dest' : ''} ${s.small ? 'is-small' : ''}`}>
              <circle cx={x} cy={y} r={s.small ? 7 : 13} className="map__dot" />
              {!s.small && <circle cx={x} cy={y} r="24" className="map__halo" />}
              <text x={x + (right ? 26 : -26)} y={y - 4} textAnchor={right ? 'start' : 'end'} className={s.small ? 'map__label map__label--s' : 'map__label'}>
                {s.name}
              </text>
              {s.dest && (
                <text x={x + (right ? 26 : -26)} y={y + 24} textAnchor={right ? 'start' : 'end'} className="map__note">
                  {destName}
                </text>
              )}
              {s.note && (
                <text x={x + (right ? 26 : -26)} y={y + 24} textAnchor={right ? 'start' : 'end'} className="map__note">
                  {s.note}
                </text>
              )}
            </g>
          )
        })}
        {/* distâncias de cada trecho, no meio da estrada */}
        {stops.map((s, i) => {
          if (!s.leg || i === 0) return null
          const [x0, y0] = L.pts[i - 1]
          const [x1, y1] = L.pts[i]
          const mx = (x0 + x1) / 2
          const my = (y0 + y1) / 2
          const side = wide ? 1 : mx < W / 2 ? 1 : -1
          return (
            <text key={'leg' + i} x={mx + 34 * side} y={my + (wide ? 34 : 0)} textAnchor={side > 0 ? 'start' : 'end'} className="map__leg">
              {s.leg}
            </text>
          )
        })}
        <g className="map__compass" transform={`translate(${W - 40}, ${wide ? H - 50 : 40})`}>
          <path d="M0 -18 L6 6 L0 2 L-6 6 Z" />
          <text y="24" textAnchor="middle">N</text>
        </g>
      </svg>
      <div className="map__car" aria-hidden="true">
        <Icon name={vehicle} size={22} stroke={2} />
      </div>
    </div>
  )
}

function Ticket({ t, i, solo }) {
  return (
    <article className={`ticket ${solo ? 'ticket--solo' : ''}`} style={{ '--r': `${[-1.2, 0.8, -0.5][i % 3]}deg` }} data-rise={i * 0.08}>
      <div className="ticket__main">
        <span className="ticket__icon"><Icon name={t.icon} size={26} /></span>
        <h3 className="ticket__name display">{t.name}</h3>
        <p className="ticket__text">{t.text}</p>
      </div>
      <div className="ticket__stub">
        <strong className="ticket__price display">{t.price}</strong>
        <span className="ticket__note">{t.priceNote}</span>
      </div>
    </article>
  )
}

export default function RouteSection() {
  const { v, vibe } = useTrip()
  const scope = useRef(null)
  useReveal(scope, [vibe])
  const route = ROUTES[v.route]
  const destName = v.id === 'chacara' ? 'a chácara (Warta)' : v.id === 'cabanas' ? 'as cabanas (Bratislava)' : 'Ody Park'
  const solo = v.transport.length === 1

  return (
    <section className="sec route" id="rota" ref={scope}>
      <div className="wrap" key={vibe}>
        <p className="eyebrow">passo 3 — a estrada</p>
        <h2 className="display h2" data-split>
          Como a gente <em>chega lá?</em>
        </h2>

        <div className="route__track">
        <div className="route__pin">
        <div className="route__total">
          <span className="display">{route.total}</span>
          <span className="hand">{solo ? 'de van, só a galera' : 'no total, Itacolomi → destino'}</span>
          <Doodle type="underline" stroke={3} />
        </div>
        {route.back && <p className="route__back hand">{route.back}</p>}

        <RouteMap routeId={v.route} vehicle={solo ? 'van' : 'car'} destName={destName} />
        </div>
        {/* comprimento da "viagem" na rolagem */}
        <div className="route__runway" aria-hidden="true" />
        </div>

        <h3 className="route__h display" data-split>
          {solo ? 'O jeito de ir' : <>{v.transport.length} jeitos de <em>resolver as caronas</em></>}
        </h3>
        <div className={`tickets ${solo ? 'tickets--solo' : ''}`} data-lenis-prevent-wheel="">
          {v.transport.map((id, i) => (
            <Ticket key={id} t={TRANSPORT[id]} i={i} solo={solo} />
          ))}
        </div>
        <p className="route__note hand">{TRIP.notes.transport}</p>
      </div>
    </section>
  )
}
