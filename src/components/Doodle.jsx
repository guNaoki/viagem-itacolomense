import { useLayoutEffect, useRef, useState } from 'react'

// Rabiscos feitos "à mão". O caminho é recalculado no tamanho real do elemento,
// então o traço nunca distorce nem quebra quando se desenha (pathLength = 1).
const PATHS = {
  circle:
    'M18 58 C 8 22, 92 4, 160 10 C 228 16, 252 40, 240 70 C 226 102, 126 112, 62 102 C 18 94, 2 70, 22 46 C 38 28, 78 18, 108 17',
  underline: 'M3 9 C 40 2, 78 15, 118 7 S 196 3, 236 10',
  arrow: 'M6 44 C 26 14, 64 4, 94 22',
  arrowHead: 'M80 12 L96 23 L80 33',
  arrowDown: 'M20 4 C 4 30, 36 46, 18 80',
  arrowDownHead: 'M8 68 L18 82 L30 70',
  star: 'M20 4 L20 36 M4 20 L36 20 M8 8 L32 32 M32 8 L8 32',
}
const VIEW = {
  circle: [256, 116],
  underline: [240, 18],
  arrow: [100, 50],
  arrowDown: [40, 86],
  star: [40, 40],
}

// escala cada par x,y do caminho (só usamos comandos absolutos M/L/C/S)
const scalePath = (d, sx, sy) => {
  let i = 0
  return d.replace(/-?\d*\.?\d+/g, (n) => (i++ % 2 ? +n * sy : +n * sx).toFixed(1))
}

export default function Doodle({ type = 'circle', className = '', stroke = 3, draw = true, style, ...rest }) {
  const ref = useRef(null)
  const [box, setBox] = useState(null)
  const [vw, vh] = VIEW[type]

  useLayoutEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect
      if (!w || !h) return
      setBox((b) => (b && Math.abs(b.w - w) < 0.5 && Math.abs(b.h - h) < 0.5 ? b : { w, h }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pad = stroke
  const w = box ? box.w : vw
  const h = box ? box.h : vh
  const sx = (w - pad * 2) / vw
  const sy = (h - pad * 2) / vh
  const fit = (d) => scalePath(d, sx, sy)
  const extra = type === 'arrow' ? PATHS.arrowHead : type === 'arrowDown' ? PATHS.arrowDownHead : null
  const drawAttr = draw ? { 'data-draw': '' } : {}

  return (
    <svg
      ref={ref}
      className={`doodle doodle--${type} ${className}`}
      viewBox={`${-pad} ${-pad} ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={style}
      {...rest}
    >
      <path d={fit(PATHS[type])} strokeWidth={stroke} pathLength="1" {...drawAttr} />
      {extra && <path d={fit(extra)} strokeWidth={stroke} pathLength="1" {...drawAttr} />}
    </svg>
  )
}
