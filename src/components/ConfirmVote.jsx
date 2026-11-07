import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { lockScroll, scrollToEl } from '../lib/scroll'
import './ConfirmVote.css'

// "Deu uma olhada em todas, né?" — aparece quando alguém vai votar direto do topo do site.
export default function ConfirmVote({ onClose }) {
  const card = useRef(null)

  useEffect(() => {
    lockScroll(true)
    card.current?.focus() // foco dentro do aviso, sem acender o contorno do botão
    const onKey = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const go = (target) => {
    onClose()
    // espera destravar a rolagem antes de rolar
    requestAnimationFrame(() => scrollToEl(target, { offset: -60 }))
  }

  return createPortal(
    <div className="cv" role="dialog" aria-modal="true" aria-labelledby="cv-q">
      <div className="cv__bg" onClick={onClose} aria-hidden="true" />
      <div className="cv__card" ref={card} tabIndex={-1}>
        <span className="tape" style={{ top: -12, left: '50%', transform: 'translateX(-50%) rotate(-3deg)' }} />
        <p className="cv__q display" id="cv-q">
          Deu uma olhada em <em>todas</em>, né?
        </p>
        <p className="cv__t">São 3 opções e cada uma muda o fim de semana inteiro. Vale passar por elas antes de votar.</p>
        <div className="cv__actions">
          <button type="button" className="btn" onClick={() => go('#votacao')}>
            Já vi tudo, bora votar
            <span className="btn__dot" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
          </button>
          <button type="button" className="cv__no hand" onClick={() => go('#vibe')}>
            ainda não, me mostra
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
