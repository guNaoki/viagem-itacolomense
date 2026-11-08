import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { VIBES } from '../data/trip'
import { gsap, useGSAP, reduceMotion, drawIn } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import Mural from './Mural'
import Sketch from './Sketch'
import { Unique, AntesDepois } from './Romance'
import Icon from './Icons'
import { srcSetOf } from '../lib/img'
import './VibePicker.css'

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
      // detalhe único e antes/depois: o texto sobe, as polaroids caem girando, o desenho se traça
      gsap.utils.toArray('.uq, .ad').forEach((el) => {
        const t = { trigger: el, start: 'top 78%', once: true }
        gsap.from(el.querySelectorAll('.uq__copy > *, .ad__kicker, .ad__title'), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9, scrollTrigger: t })
        gsap.from(el.querySelectorAll('.polaroid'), { y: 70, rotate: (i) => (i % 2 ? 12 : -12), autoAlpha: 0, stagger: 0.18, duration: 1.1, delay: 0.2, ease: 'back.out(1.4)', scrollTrigger: t })
      })
      drawIn('.fogao__ink > *, .art__ink > *, .ad__arrow path', { duration: 1.4, stagger: 0.04, scrollTrigger: { trigger: '.uq', start: 'top 75%', once: true } })
    },
    { scope: ref },
  )
  return (
    <div className="vd" ref={ref}>
      <header className="vd__head">
        <p className="vd__now hand">a escolhida</p>
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

      {v.unique && <Unique u={v.unique} />}

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


      {v.story && <AntesDepois s={v.story} />}
    </div>
  )
}

export default function VibePicker() {
  const { vibe } = useTrip()
  const scope = useRef(null)
  useReveal(scope)
  const v = VIBES[vibe]

  return (
    <section className="sec picker" id="vibe" ref={scope}>
      <div className="wrap">
        <p className="eyebrow">a nossa casa</p>
        <h2 className="display h2 picker__title" data-split>
          A <em>chácara</em> venceu.
        </h2>
        <p className="lede picker__lede" data-rise>
          Reserva feita no Airbnb. Aqui está o que a gente escolheu: o lugar, o que rola e como vai ser o fim de semana.
        </p>

        <Detail key={vibe} v={v} />
      </div>
    </section>
  )
}
