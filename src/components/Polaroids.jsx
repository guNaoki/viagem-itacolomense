import { useRef } from 'react'
import { srcSetOf } from '../lib/img'

// Tira de polaroids com swipe nativo (scroll-snap) + arrastar com o mouse no desktop.
const TILT = [-2.6, 1.8, -1.2, 2.4, -2.1, 1.3, -1.6, 2.2]

export default function Polaroids({ photos, className = '' }) {
  const ref = useRef(null)
  const drag = useRef(null)

  const onDown = (e) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }
    ref.current.classList.add('is-drag')
  }
  const onMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 4) drag.current.moved = true
    ref.current.scrollLeft = drag.current.left - dx
  }
  const onUp = () => {
    drag.current = null
    ref.current?.classList.remove('is-drag')
  }

  return (
    <div
      className={`strip ${className}`}
      ref={ref}
      role="list"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      data-lenis-prevent-wheel=""
    >
      {photos.map((p, i) => (
        <figure className="polaroid strip__item" role="listitem" key={p.src} style={{ '--tilt': `${TILT[i % TILT.length]}deg` }}>
          {i % 3 === 0 && <span className="tape" style={{ top: -12, left: '50%', transform: 'translateX(-50%) rotate(-3deg)' }} />}
          <div className="strip__img">
            <img src={p.src} srcSet={p.srcSet || srcSetOf(p.src)} sizes="(min-width: 900px) 320px, 72vw" alt={p.note} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" draggable="false" />
          </div>
          <figcaption>{p.note}</figcaption>
        </figure>
      ))}
      <span className="strip__end" aria-hidden="true" />
    </div>
  )
}
