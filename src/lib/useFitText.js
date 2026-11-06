import { useLayoutEffect } from 'react'

// Ajusta o font-size pra palavra ocupar exatamente a largura do pai (sem quebrar).
export function useFitText(ref, { max = 400, min = 32, ratio = 1 } = {}) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const parent = el.parentElement
    let last = 0
    const fit = () => {
      const avail = parent.clientWidth * ratio
      if (!avail || Math.abs(avail - last) < 1) return
      last = avail
      el.style.fontSize = '100px'
      const w = el.scrollWidth || 1
      el.style.fontSize = Math.max(min, Math.min(max, (avail / w) * 100)) + 'px'
    }
    fit()
    document.fonts?.ready.then(() => {
      last = 0
      fit()
    })
    const ro = new ResizeObserver(fit)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])
}
