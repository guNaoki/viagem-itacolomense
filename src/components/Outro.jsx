import { useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { useReveal } from '../lib/useReveal'
import { TRIP, VIBES, VIBE_ORDER } from '../data/trip'
import Icon from './Icons'
import Doodle from './Doodle'
import './Outro.css'

export default function Outro() {
  const { v, vibe, chooseVibe } = useTrip()
  const scope = useRef(null)
  const [copied, setCopied] = useState(false)
  useReveal(scope)
  const others = VIBE_ORDER.filter((id) => id !== vibe)

  const share = async () => {
    const url = location.href
    const text = `Janeiro 2027 — minha vibe: ${v.name}. Bora?`
    try {
      if (navigator.share) return await navigator.share({ title: 'Janeiro 2027', text, url })
      await navigator.clipboard.writeText(`${text} ${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      /* usuário cancelou */
    }
  }

  return (
    <section className="sec outro" ref={scope}>
      <div className="wrap">
        <p className="eyebrow">e aí?</p>
        <h2 className="display outro__title">
          <span data-split>Bora?</span>
          <Doodle type="underline" stroke={4} />
        </h2>
        <p className="lede" data-rise>
          Manda a tua vibe no grupo. Com {TRIP.people.min} a {TRIP.people.max} confirmados, a gente fecha o lugar e o resto é só aparecer.
        </p>
        <div className="outro__actions" data-rise>
          <button type="button" className="btn" onClick={share}>
            {copied ? 'Link copiado!' : `Mandar "${v.short}" pra galera`}
            <span className="btn__dot"><Icon name="share" size={18} /></span>
          </button>
        </div>

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
                  <img src={o.photos[0].src} alt="" loading="lazy" />
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
