import { useRef, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { useReveal } from '../lib/useReveal'
import { scrollToEl } from '../lib/scroll'
import { TRIP } from '../data/trip'
import Icon from './Icons'
import Doodle from './Doodle'
import './Outro.css'

export default function Outro() {
  const { v } = useTrip()
  const scope = useRef(null)
  const [copied, setCopied] = useState(false)
  useReveal(scope)

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
            {copied ? 'Link copiado!' : 'Mandar pra galera'}
            <span className="btn__dot"><Icon name="share" size={18} /></span>
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => scrollToEl('#vibe', { offset: -60 })}>
            Trocar de vibe
            <span className="btn__dot"><Icon name="arrow" size={18} /></span>
          </button>
        </div>
        <p className="outro__sign hand" data-rise>— a galera de janeiro</p>
      </div>
      <footer className="outro__foot">
        <span>janeiro · 2027</span>
        <span>Novo Itacolomi → {v.short}</span>
      </footer>
    </section>
  )
}
