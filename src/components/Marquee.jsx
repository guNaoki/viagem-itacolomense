import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { gsap, ScrollTrigger, useGSAP, reduceMotion } from '../lib/gsap'
import './Marquee.css'

export default function Marquee() {
  const { v } = useTrip()
  const scope = useRef(null)
  const words = [...v.marquee, ...v.marquee]

  useGSAP(
    () => {
      if (reduceMotion()) return
      const tween = gsap.to('.mq__track', { xPercent: -50, ease: 'none', duration: 40, repeat: -1 })
      // a velocidade da rolagem empurra a faixa (e inverte quando sobe)
      const boost = { t: 1 }
      ScrollTrigger.create({
        trigger: scope.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (s) => {
          const dir = s.direction < 0 ? -1 : 1
          const vel = Math.min(Math.abs(s.getVelocity()) / 250, 7)
          gsap.killTweensOf(boost)
          gsap
            .timeline({ onUpdate: () => tween.timeScale(boost.t * dir) })
            .to(boost, { t: 1 + vel, duration: 0.15 })
            .to(boost, { t: 1, duration: 1.4, ease: 'power2.out' })
        },
      })
    },
    { scope, dependencies: [v.id], revertOnUpdate: true },
  )

  return (
    <div className="mq" ref={scope} aria-hidden="true">
      <div className="mq__band">
        <div className="mq__track">
          {[0, 1].map((k) => (
            <div className="mq__set" key={k}>
              {words.map((w, i) => (
                <span key={i} className={i % 2 ? 'mq__w mq__w--it' : 'mq__w'}>
                  {w}
                  <svg viewBox="0 0 24 24" className="mq__sun">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4M4.6 4.6l2.8 2.8M16.6 16.6l2.8 2.8M4.6 19.4l2.8-2.8M16.6 7.4l2.8-2.8" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
