import Lenis from 'lenis'
import { gsap, ScrollTrigger, reduceMotion } from './gsap'
import { sky } from '../gl/sky-state'

let lenis = null

// Um único ouvinte de rolagem pro site todo. Não lê nada do DOM a cada evento:
// a altura máxima fica em cache e só é medida de novo quando o ScrollTrigger recalcula.
const subs = new Set()
let maxScroll = 1
let lastY = 0
export function onScrollY(cb) {
  subs.add(cb)
  cb(lastY)
  return () => subs.delete(cb)
}
const emit = (y) => {
  lastY = y
  sky.scroll = Math.min(1, y / maxScroll)
  subs.forEach((cb) => cb(y))
}

export function initScroll() {
  if (lenis) return lenis
  // a barra de endereço do celular aparece/some e muda a altura: não recalcula tudo por isso
  ScrollTrigger.config({ ignoreMobileResize: true })
  if (!reduceMotion()) {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      // no dedo a rolagem é a nativa do celular (a mais estável e responsiva);
      // a suavização fica pro mouse/trackpad
      syncTouch: false,
      // carrosséis horizontais (fotos, passagens) continuam rolando por conta própria
      allowNestedScroll: true,
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
  }
  const measure = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight)
  }
  measure()
  ScrollTrigger.addEventListener('refresh', measure)
  if (lenis) lenis.on('scroll', (l) => emit(l.scroll))
  else addEventListener('scroll', () => emit(scrollY), { passive: true })
  emit(scrollY)

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

// trava/destrava a rolagem da página (ex.: foto ampliada aberta)
export function lockScroll(on) {
  if (lenis) on ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = on ? 'hidden' : ''
}
