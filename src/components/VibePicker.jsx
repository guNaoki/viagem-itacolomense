import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { VIBES, VIBE_ORDER } from '../data/trip'
import { gsap, useGSAP, reduceMotion, drawIn } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import Mural from './Mural'
import Sketch from './Sketch'
import Icon from './Icons'
import { srcSetOf } from '../lib/img'
import './VibePicker.css'

// origem da "inundação" de cor: o ponto do toque (ou o centro do botão, no teclado)
const originOf = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const kb = !e.clientX && !e.clientY
  return { x: kb ? r.left + r.width / 2 : e.clientX, y: kb ? r.top + r.height / 2 : e.clientY }
}

function Detail({ v }) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (reduceMotion()) return
      gsap.from('.vd__head > *', { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.9, delay: 0.2 })
      gsap.from('.mural__item', { y: 120, rotate: (i) => (i % 2 ? 14 : -14), autoAlpha: 0, stagger: 0.07, duration: 1.1, delay: 0.3, ease: 'back.out(1.3)' })
      gsap.from('.vd__reveal', { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.8, delay: 0.5 })
      // desenhos do "o que rola": a mancha de cor aparece e o traço se desenha
      const st = { trigger: '.rola', start: 'top 80%', once: true }
      gsap.from('.rola__item', { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: st })
      gsap.from('.sketch__fill > *', { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%', stagger: 0.05, duration: 0.9, delay: 0.3, ease: 'back.out(1.6)', scrollTrigger: st })
      drawIn('.sketch__ink > *', { duration: 1.3, stagger: 0.025, scrollTrigger: st })
    },
    { scope: ref },
  )
  return (
    <div className="vd" ref={ref}>
      <header className="vd__head">
        <p className="vd__now hand">vendo agora · opção {v.n.replace('0', '')} de 3</p>
        <h3 className="vd__name display">{v.name}</h3>
        <p className="vd__place">{v.place} — <span className="hand">{v.kicker}</span></p>
      </header>

      <Mural photos={v.photos} layout="feature" />
      <p className="vd__hint hand vd__reveal" aria-hidden="true">toca na foto pra ver grande</p>

      <div className="rola">
        <h4 className="vd__h hand">o que rola</h4>
        <ul className="rola__list">
          {v.doing.map((d) => (
            <li key={d.t} className="rola__item">
              <Sketch art={d.art} />
              <span className="rola__t hand">{d.t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="vd__grid">
        <p className="vd__pitch vd__reveal">{v.pitch}</p>

        <div className="vd__col vd__reveal">
          <h4 className="vd__h hand">{v.id === 'ody' ? 'e pra dormir?' : 'onde a gente dorme'}</h4>
          <p className="vd__stay">{v.stay}</p>
          <a className="btn vd__link" href={v.link} target="_blank" rel="noopener noreferrer">
            {v.linkLabel}
            <span className="btn__dot"><Icon name="out" size={18} /></span>
          </a>
        </div>
      </div>

    </div>
  )
}

export default function VibePicker() {
  const { vibe, chooseVibe } = useTrip()
  const scope = useRef(null)
  useReveal(scope)
  const v = VIBES[vibe]

  return (
    <section className="sec picker" id="vibe" ref={scope}>
      <div className="wrap">
        <p className="eyebrow">passo 1 — escolhe aí</p>
        <h2 className="display h2 picker__title" data-split>
          Qual é a <em>nossa vibe?</em>
        </h2>
        <p className="lede picker__lede" data-rise>
          Três opções na mesa, nenhuma decidida. Toca em cada uma: o site inteiro muda pra mostrar como seria o fim de semana lá.
        </p>

        <div className="cards" role="radiogroup" aria-label="Escolha a vibe" id="vibe-cards" data-rise>
          {VIBE_ORDER.map((id) => {
            const c = VIBES[id]
            const on = vibe === id
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                className={`vcard ${on ? 'is-on' : ''}`}
                data-v={id}
                onClick={(e) => chooseVibe(id, { ...originOf(e), scrollTo: '#vibe' })}
              >
                <span className="vcard__img">
                  <img src={c.photos[0].src} srcSet={srcSetOf(c.photos[0].src)} sizes="(min-width: 900px) 400px, 32vw" alt="" loading="lazy" decoding="async" />
                </span>
                <span className="vcard__shade" aria-hidden="true" />
                <span className="vcard__radio" aria-hidden="true" />
                <span className="vcard__tag">vendo agora</span>
                <span className="vcard__txt">
                  <span className="vcard__n hand">opção {c.n.replace('0', '')}</span>
                  <span className="vcard__name display">{c.short}</span>
                  <span className="vcard__kicker hand">{c.kicker}</span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="cards__hint hand" aria-hidden="true">toca nas outras pra comparar ↑</p>

        <Detail key={vibe} v={v} />
      </div>
    </section>
  )
}
