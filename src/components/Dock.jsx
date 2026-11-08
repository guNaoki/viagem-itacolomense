import { useEffect, useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { VIBES, CHOSEN } from '../data/trip'
import { scrollToEl, onScrollY } from '../lib/scroll'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import './Dock.css'

const SECTIONS = [
  { id: 'topo', label: 'Início' },
  { id: 'vibe', label: 'A chácara' },
  { id: 'jornada', label: 'O fim de semana' },
  { id: 'rota', label: 'A estrada' },
  { id: 'caixa', label: 'O caixa' },
  { id: 'combinados', label: 'Combinados' },
  { id: 'votacao', label: 'Quem vai' },
]

// Navbar inferior: seletor das 3 vibes + menu de seções.
export default function Dock() {
  const { vibe, chooseVibe } = useTrip()
  const [shown, setShown] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('topo')
  const seg = useRef(null)
  const blob = useRef(null)

  useGSAP(() => {
    SECTIONS.forEach(({ id }) =>
      ScrollTrigger.create({
        trigger: '#' + id,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (s) => s.isActive && setActive(id),
      }),
    )
  }, [])

  useEffect(() => {
    const h = innerHeight * 0.55
    return onScrollY((y) => setShown(y > h))
  }, [])

  // a "gota" desliza até a vibe escolhida
  useEffect(() => {
    const btn = seg.current?.querySelector(`[data-v="${vibe}"]`)
    if (!btn) return
    gsap.to(blob.current, { x: btn.offsetLeft, width: btn.offsetWidth, duration: 0.7, ease: 'expo.out' })
  }, [vibe, shown])

  useEffect(() => {
    if (!open) return
    const close = (e) => !e.target.closest('.dock') && setOpen(false)
    addEventListener('pointerdown', close)
    return () => removeEventListener('pointerdown', close)
  }, [open])

  return (
    <nav className={`dock ${shown ? 'is-shown' : ''}`} aria-label="Vibe e seções">
      {open && (
        <ul className="dock__sheet">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={active === s.id ? 'is-active' : ''}
                onClick={() => {
                  setOpen(false)
                  scrollToEl('#' + s.id, { offset: s.id === 'topo' ? 0 : -40 })
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="dock__bar">
        <div className="dock__seg" role="radiogroup" aria-label="Trocar a vibe" ref={seg}>
          <span className="dock__blob" ref={blob} aria-hidden="true" />
          {[CHOSEN].map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={vibe === id}
              data-v={id}
              className="dock__vibe"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                chooseVibe(id, { x: r.left + r.width / 2, y: r.top + r.height / 2, scrollTo: '#vibe' })
              }}
            >
              <i className="dock__dot" aria-hidden="true" />
              {VIBES[id].short}
            </button>
          ))}
        </div>
        <button type="button" className="dock__menu" aria-expanded={open} aria-label="Seções" onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
