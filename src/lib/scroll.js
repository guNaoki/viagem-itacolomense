import Lenis from 'lenis'
import { gsap, ScrollTrigger, reduceMotion } from './gsap'
import { sky } from '../gl/sky-state'

let lenis = null

export function initScroll() {
  if (lenis) return lenis
  if (!reduceMotion()) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.9 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
  }
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight
    sky.scroll = max > 0 ? Math.min(1, scrollY / max) : 0
  }
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // fontes mudam a altura dos títulos
  document.fonts?.ready.then(() => ScrollTrigger.refresh())

  // imagens carregando mudam a altura da página -> recalcula os gatilhos
  let t
  document.addEventListener(
    'load',
    (e) => {
      if (e.target.tagName === 'IMG') {
        clearTimeout(t)
        t = setTimeout(() => ScrollTrigger.refresh(), 150)
      }
    },
    true,
  )
  return lenis
}

export function scrollToEl(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  const offset = opts.offset ?? -70
  if (lenis) lenis.scrollTo(el, { offset, duration: opts.immediate ? 0 : 1.4, immediate: !!opts.immediate, force: true })
  else {
    const y = el.getBoundingClientRect().top + scrollY + offset
    scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' })
  }
}
