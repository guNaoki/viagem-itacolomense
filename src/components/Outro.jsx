import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { useReveal } from '../lib/useReveal'
import Votacao from './Votacao'
import Doodle from './Doodle'
import './Outro.css'

export default function Outro() {
  const { v } = useTrip()
  const scope = useRef(null)
  useReveal(scope)

  return (
    <section className="sec outro" ref={scope}>
      <div className="wrap">
        {/* o mascote do grupo do zap, boiando no fundo */}
        <figure className="mbapeso" aria-hidden="true">
          <img src="/img/mbapeso.webp" alt="" loading="lazy" decoding="async" width="640" height="640" />
          <figcaption className="hand">Kylian Mbapeso aprova</figcaption>
        </figure>
        <p className="eyebrow">e aí?</p>
        <h2 className="display outro__title">
          <span data-split>Bora?</span>
          <Doodle type="underline" stroke={4} />
        </h2>
        <Votacao />
      </div>
      <footer className="outro__foot">
        <span>janeiro · 2027</span>
        <span>Novo Itacolomi → {v.short}</span>
      </footer>
    </section>
  )
}
