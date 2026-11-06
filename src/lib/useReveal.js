import { gsap, SplitText, useGSAP, reduceMotion, drawIn } from './gsap'

/*
  Animações de entrada reutilizáveis dentro de um escopo:
   [data-split]  -> título sobe linha a linha (máscara)
   [data-rise]   -> elemento sobe e aparece
   [data-draw]   -> rabisco se desenha
   [data-pop]    -> polaroid cai girando
*/
export function useReveal(scope, deps = []) {
  useGSAP(
    () => {
      if (reduceMotion()) return
      const root = scope.current
      if (!root) return

      root.querySelectorAll('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'split-line',
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              rotate: 2,
              duration: 1.1,
              stagger: 0.09,
              ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }),
        })
      })

      gsap.utils.toArray(root.querySelectorAll('[data-rise]')).forEach((el) => {
        gsap.from(el, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          delay: parseFloat(el.dataset.rise || 0),
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        })
      })

      root.querySelectorAll('[data-draw]').forEach((el) => {
        if (el.closest('[data-draw-manual]')) return
        drawIn(el, { scrollTrigger: { trigger: el.closest('svg') || el, start: 'top 85%', once: true } })
      })

      root.querySelectorAll('[data-pop]').forEach((el, i) => {
        gsap.from(el, {
          y: 80,
          rotate: (i % 2 ? 1 : -1) * 12,
          autoAlpha: 0,
          duration: 1.2,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        })
      })
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  )
}
