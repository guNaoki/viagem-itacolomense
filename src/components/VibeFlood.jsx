import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { VIBES } from '../data/trip'
import { gsap, SplitText, useGSAP } from '../lib/gsap'
import { scrollToEl } from '../lib/scroll'
import './VibeFlood.css'

const SAY = { chacara: 'bora de', cabanas: 'bora pro mato:', ody: 'bora pra água:' }

// Transição entre vibes: a cor "inunda" a tela a partir do toque, o nome aparece,
// o site troca por baixo e a cortina sobe.
export default function VibeFlood() {
  const { flood, setFlood, setVibe } = useTrip()
  const ref = useRef(null)
  const to = flood ? VIBES[flood.to] : null

  useGSAP(
    () => {
      if (!flood) return
      const el = ref.current
      const { x, y } = flood
      const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20
      const split = SplitText.create(el.querySelector('.flood__name'), { type: 'words,chars', charsClass: 'schar', mask: 'chars' })

      gsap
        .timeline({ onComplete: () => { split.revert(); setFlood(null) } })
        .set(el, { autoAlpha: 1, yPercent: 0, clipPath: `circle(0px at ${x}px ${y}px)` })
        .to(el, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.75, ease: 'power3.inOut' })
        .from(el.querySelector('.flood__say'), { y: 20, autoAlpha: 0, duration: 0.4 }, '-=.3')
        .from(split.chars, { yPercent: 105, stagger: 0.022, duration: 0.6, ease: 'expo.out' }, '-=.35')
        .add(() => {
          setVibe(flood.to)
          if (flood.scrollTo) setTimeout(() => scrollToEl(flood.scrollTo, { immediate: true, offset: -84 }), 60)
        })
        .to(el, { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, '+=.45')
        .set(el, { autoAlpha: 0 })
    },
    { dependencies: [flood?.key] },
  )

  return (
    <div className="flood" ref={ref} data-v={to?.id} aria-hidden="true">
      {to && (
        <div className="flood__in">
          <p className="flood__say hand">{SAY[to.id]}</p>
          <p className="flood__name display">{to.name}</p>
          <p className="flood__place">{to.place}</p>
        </div>
      )}
    </div>
  )
}
