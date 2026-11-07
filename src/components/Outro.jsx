import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { useReveal } from '../lib/useReveal'
import { VIBES, VIBE_ORDER } from '../data/trip'
import Icon from './Icons'
import { small } from '../lib/img'
import Doodle from './Doodle'
import './Outro.css'

export default function Outro() {
  const { v, vibe, chooseVibe } = useTrip()
  const scope = useRef(null)
  useReveal(scope)
  const others = VIBE_ORDER.filter((id) => id !== vibe)

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
        {/* comparar: só no final, pra não quebrar o fluxo */}
        <div className="other" data-rise>
          <p className="other__q hand">e se fosse outra vibe?</p>
          <div className="other__list">
            {others.map((id) => {
              const o = VIBES[id]
              return (
                <button
                  key={id}
                  type="button"
                  className="other__card"
                  data-v={id}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    chooseVibe(id, { x: r.left + r.width / 2, y: r.top + r.height / 2, scrollTo: '#vibe' })
                  }}
                >
                  <img src={small(o.photos[0].src)} alt="" loading="lazy" decoding="async" />
                  <span className="other__txt">
                    <span className="hand">opção {o.n.replace('0', '')}</span>
                    <span className="other__name display">{o.short}</span>
                    <span className="other__kicker">{o.kicker}</span>
                  </span>
                  <span className="other__go" aria-hidden="true"><Icon name="arrow" size={20} /></span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <footer className="outro__foot">
        <span>janeiro · 2027</span>
        <span>Novo Itacolomi → {v.short}</span>
      </footer>
    </section>
  )
}
