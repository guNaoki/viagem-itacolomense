import { useRef } from 'react'
import { useTrip } from '../lib/trip-context'
import { scrollToEl } from '../lib/scroll'
import { gsap, SplitText, useGSAP, reduceMotion, drawIn } from '../lib/gsap'
import { useFitText } from '../lib/useFitText'
import { TRIP } from '../data/trip'
import Countdown from './Countdown'
import Doodle from './Doodle'
import Icon from './Icons'
import './Hero.css'

export default function Hero() {
  const { v } = useTrip()
  const scope = useRef(null)
  const jan = useRef(null)
  useFitText(jan, { max: 330, ratio: 0.97 })

  // entrada cinematográfica (espera as fontes pra cortar as letras no lugar certo)
  useGSAP(
    (ctx, contextSafe) => {
      if (reduceMotion()) return
      gsap.set('.hero__title, .hero__below', { autoAlpha: 0 })
      let started = false
      const intro = contextSafe(() => {
        if (started) return
        started = true
        gsap.set('.hero__title, .hero__below', { autoAlpha: 1 })
        const split = SplitText.create(jan.current, { type: 'words,chars', charsClass: 'schar', mask: 'chars' })
        gsap
          // no fim da entrada desfaz o split: o texto volta a ser texto normal, sem máscara nenhuma
          .timeline({ delay: 0.1, onComplete: () => split.revert() })
          .from(split.chars, { yPercent: 115, rotate: 10, duration: 1.3, stagger: 0.05, ease: 'expo.out' })
          .from('.hero__kicker', { y: 20, autoAlpha: 0, rotate: -8, duration: 0.8 }, '-=1.1')
          .from('.hero__year', { xPercent: 20, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, '-=.9')
          .from('.hero__hand-text', { clipPath: 'inset(-20% 100% -20% 0)', duration: 1.1, ease: 'power2.inOut' }, '-=.9')
          .add(drawIn('.hero__hand [data-draw]', { duration: 0.9 }), '-=.4')
          .from('.hero__below > *', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9 }, '-=.9')
      })
      // a entrada começa quando a tela de carregamento sai
      const fallback = setTimeout(intro, 4500)
      ;(window.__appReady || document.fonts?.ready || Promise.resolve()).then(() => {
        clearTimeout(fallback)
        requestAnimationFrame(intro)
      })

      // parallax leve do título ao rolar
      gsap.to('.hero__title', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope },
  )

  // a frase muda conforme a vibe
  useGSAP(
    () => {
      if (reduceMotion()) return
      gsap.from('.hero__swap', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06 })
    },
    { scope, dependencies: [v.id] },
  )

  return (
    <section className="hero" id="topo" ref={scope}>
      <div className="wrap hero__wrap">
        <h1 className="hero__title">
          <span className="hero__kicker hand">a galera convoca:</span>
          <span className="hero__fit">
            <span className="display hero__jan" ref={jan}>Janeiro</span>
          </span>
          <span className="hero__row">
            <span className="hero__hand hand">
              <span className="hero__hand-text">o nosso fim de semana.</span>
              <Doodle type="underline" stroke={3.5} data-draw-manual="" />
            </span>
            <span className="display hero__year"><em>2027</em></span>
          </span>
        </h1>

        <div className="hero__below">
          <div className="hero__col">
            <p className="lede hero__lede hero__swap" key={'s' + v.id}>{v.heroSub}</p>
            <ul className="hero__notes">
              <li><Doodle type="star" stroke={2.2} draw={false} /> {TRIP.people.min} a {TRIP.people.max} amigos</li>
              <li><Doodle type="star" stroke={2.2} draw={false} /> janeiro de 2027</li>
              <li className="hero__swap" key={'l' + v.id}><Doodle type="star" stroke={2.2} draw={false} /> {v.heroLine}</li>
            </ul>
          </div>
          <div className="hero__col hero__col--right">
            <Countdown />
            <button type="button" className="btn hero__cta" onClick={() => scrollToEl('#vibe', { offset: -60 })}>
              Explorar os destinos e roteiros
              <span className="btn__dot"><Icon name="arrowDown" size={20} /></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
