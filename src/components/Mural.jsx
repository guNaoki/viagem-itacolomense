import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { srcSetOf } from '../lib/img'
import { lockScroll } from '../lib/scroll'
import './Mural.css'

/*
  Mural de polaroids: todas as fotos à vista, sem faixa pra arrastar.
   - layout "feature": a primeira foto grande + as outras em volta (até 6 no mural);
     se sobrar foto, a última do mural mostra "+N" e abre o resto ampliado
   - layout "grid": 2 colunas; com número ímpar, a primeira ocupa a linha toda
   - layout "masonry": colunas com cada foto no formato original (memes não são cortados)
  Tocar numa foto abre ela grande (Lightbox), dá pra passar pro lado lá dentro.
*/
const TILT = [-1.8, 1.4, -1.1, 2, -1.6, 1.2, -0.9, 1.7]
const MAX_M = 5 // celular: 1 grande + 4
const MAX_D = 6 // computador: 1 grande + 5 (grade de 3 colunas)

export default function Mural({ photos, layout = 'grid', className = '' }) {
  const [open, setOpen] = useState(-1)
  const feature = layout === 'feature'
  const list = feature ? photos.slice(0, MAX_D) : photos
  const odd = layout === 'grid' && list.length % 2 === 1
  const N = photos.length

  return (
    <>
      <ul className={`mural mural--${layout} ${className}`}>
        {list.map((p, i) => {
          const big = feature ? i === 0 : odd && i === 0
          // quantas fotos ficaram de fora em cada tamanho de tela
          const moreM = feature && i === MAX_M - 1 && N > MAX_M ? N - MAX_M : 0
          const moreD = feature && i === MAX_D - 1 && N > MAX_D ? N - MAX_D : 0
          return (
            <li
              key={p.src}
              className={`mural__item ${big ? 'is-big' : ''} ${feature && i >= MAX_M ? 'is-desk' : ''}`}
              style={{ '--tilt': `${TILT[i % TILT.length]}deg` }}
            >
              <button type="button" className="polaroid mural__card" onClick={() => setOpen(i)} aria-label={`Ampliar foto: ${p.note}`}>
                {i % 3 === 0 && <span className="tape" style={{ top: -12, left: '50%', transform: 'translateX(-50%) rotate(-3deg)' }} />}
                <span className="mural__img">
                  <img
                    src={p.src}
                    srcSet={p.srcSet || srcSetOf(p.src)}
                    sizes={big ? '(min-width: 900px) 760px, 92vw' : '(min-width: 900px) 380px, 46vw'}
                    alt={p.note}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable="false"
                  />
                  {moreM > 0 && <span className="mural__more mural__more--m display">+{moreM}</span>}
                  {moreD > 0 && <span className="mural__more mural__more--d display">+{moreD}</span>}
                </span>
                <span className="mural__cap">{p.note}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {open >= 0 && <Lightbox photos={photos} start={open} onClose={() => setOpen(-1)} />}
    </>
  )
}

function Lightbox({ photos, start, onClose }) {
  const track = useRef(null)
  const timer = useRef(0)
  const [i, setI] = useState(start)

  const go = useCallback((k) => {
    const el = track.current
    const n = Math.max(0, Math.min(photos.length - 1, k))
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
  }, [photos.length])

  useEffect(() => {
    lockScroll(true)
    const el = track.current
    el.scrollLeft = start * el.clientWidth
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(Math.round(el.scrollLeft / el.clientWidth) + 1)
      if (e.key === 'ArrowLeft') go(Math.round(el.scrollLeft / el.clientWidth) - 1)
    }
    addEventListener('keydown', onKey)
    el.focus()
    return () => {
      lockScroll(false)
      removeEventListener('keydown', onKey)
    }
  }, [start, onClose, go])

  // qual foto está na tela: só lê quando a rolagem para
  const onScroll = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const el = track.current
      if (el) setI(Math.round(el.scrollLeft / el.clientWidth))
    }, 80)
  }

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label="Fotos ampliadas">
      <div className="lb__bg" aria-hidden="true" />
      <div className="lb__track" ref={track} tabIndex={-1} onScroll={onScroll}>
        {photos.map((p, k) => (
          <figure className="lb__slide" key={p.src} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="polaroid lb__card">
              <img src={p.src} srcSet={p.srcSet || srcSetOf(p.src)} sizes="92vw" alt={p.note} loading={Math.abs(k - start) < 2 ? 'eager' : 'lazy'} decoding="async" />
              <figcaption>{p.note}</figcaption>
            </div>
          </figure>
        ))}
      </div>
      <p className="lb__count hand" aria-live="polite">{i + 1} de {photos.length}</p>
      <button type="button" className="lb__close" onClick={onClose} aria-label="Fechar">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" className="lb__nav lb__nav--prev" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Foto anterior">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className="lb__nav lb__nav--next" onClick={() => go(i + 1)} disabled={i === photos.length - 1} aria-label="Próxima foto">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}
