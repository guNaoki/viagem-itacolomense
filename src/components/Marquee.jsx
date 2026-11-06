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
      // a velocidade da rolagem empurra a faixa (e inverte quando sobe).
      // Um único ticker suaviza o valor; só roda enquanto a faixa está na tela.
      let target = 0
      let cur = 0
      let dir = 1
      const tick = () => {
        cur += (target - cur) * 0.1
        target *= 0.9
        tween.timeScale(dir * (1 + cur))
      }
      ScrollTrigger.create({
        trigger: scope.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (s) => {
          if (s.isActive) {
            tween.play()
            gsap.ticker.add(tick)
          } else {
            tween.pause()
            gsap.ticker.remove(tick)
          }
        },
        onUpdate: (s) => {
          dir = s.direction < 0 ? -1 : 1
          target = Math.min(Math.abs(s.getVelocity()) / 250, 6)
        },
      })
      return () => gsap.ticker.remove(tick)
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
