import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { useReveal } from '../lib/useReveal'
import Votacao from './Votacao'
import Mbapeso from './Mbapeso'
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
        <Mbapeso caption="Kylian Mbapeso aprova" className="mbapeso--outro" />
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
