import { useEffect, useRef } from 'react'
import { ANTES_PHOTOS } from '../data/photos'
import { srcSetOf } from '../lib/img'
import './Romance.css'

/*
  Dois blocos que deixam a vibe mais "nossa" (só aparecem se a vibe tiver os dados no trip.js):
   - Unique: o detalhe que só aquele lugar tem — desenho animado (fogo e vapor) + foto
   - AntesDepois: foto antiga da galera ao lado do lugar vazio, "a próxima foto é aqui"
*/

// liga a classe "is-on" só enquanto o desenho está na tela (as animações CSS dependem dela)
function useOnScreen() {
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => ref.current?.classList.toggle('is-on', e.isIntersecting))
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return ref
}

// fogão a lenha desenhado: o fogo tremula e a panela solta vapor
function Fogao() {
  const ref = useOnScreen()
  return (
    <svg className="fogao art" viewBox="0 0 240 200" ref={ref} aria-hidden="true">
      <g className="fogao__fill">
        <path className="f2" d="M34 94 H214 V182 H34Z" transform="translate(5 4)" />
        <path className="f1" d="M72 58 H122 L118 84 H76Z" transform="translate(4 3)" />
      </g>
      <g className="fogao__fire">
        <path className="fl fl--1" d="M70 178 Q64 160 76 150 Q76 160 82 160 Q80 146 92 136 Q96 152 102 150 Q110 162 104 178Z" />
        <path className="fl fl--2" d="M84 178 Q82 166 90 160 Q92 168 96 166 Q98 158 104 154 Q112 168 106 178Z" />
        <path className="fl fl--3" d="M92 178 Q90 170 96 166 Q100 172 102 178Z" />
      </g>
      <g className="fogao__ink">{/* pathLength=1 em cada traço: ver drawIn */}
        <path pathLength="1" d="M30 92 H210 V182 H30Z" />
        <path pathLength="1" d="M22 84 H218 V92 H22Z" />
        <path pathLength="1" d="M62 182 V150 Q92 122 122 150 V182" />
        <path pathLength="1" d="M142 124 H192 V162 H142Z M150 143 H184" />
        <path pathLength="1" d="M30 110 H58 M126 110 H210 M30 130 H52 M196 130 H210 M30 150 H52 M30 168 H54 M196 172 H210 M44 92 V110 M150 92 V110 M184 92 V110 M40 110 V130 M200 110 V124" />
        <path pathLength="1" d="M68 58 H126 M74 58 L78 84 H118 L122 58 M88 58 Q97 50 106 58" />
        <path pathLength="1" d="M170 84 V22 H192 V84" />
        <path pathLength="1" d="M196 188 H236 M200 180 H230" />
        <circle pathLength="1" cx="198" cy="188" r="4" /><circle pathLength="1" cx="234" cy="188" r="4" /><circle pathLength="1" cx="202" cy="180" r="3.5" /><circle pathLength="1" cx="230" cy="180" r="3.5" />
      </g>
      <g className="fogao__steam">
        <path className="st st--1" d="M90 44 q-6 -8 0 -14 t0 -14" />
        <path className="st st--2" d="M104 46 q-6 -8 0 -14 t0 -14" />
        <path className="st st--3" d="M180 16 q-7 -8 0 -15" />
      </g>
    </svg>
  )
}

// telão no meio do mato: o feixe do projetor pisca, a tela brilha e as luzinhas piscam
function Telao() {
  const ref = useOnScreen()
  return (
    <svg className="telao art" viewBox="0 0 240 200" ref={ref} aria-hidden="true">
      <g className="art__fill">
        <path className="f2 telao__glow" d="M72 42 H188 V118 H72Z" transform="translate(4 3)" />
        <path className="f1" d="M6 190 L32 112 L58 190Z M200 190 L222 120 L244 190Z" transform="translate(4 3)" />
      </g>
      <path className="telao__beam" d="M126 168 L72 118 H188 L138 168Z" />
      <g className="art__ink">
        <path pathLength="1" d="M70 40 H190 V120 H70Z" />
        <path pathLength="1" d="M70 40 V190 M190 40 V190 M70 40 L56 30 M190 40 L204 30" />
        <path pathLength="1" d="M82 110 L104 82 L120 98 L140 72 L178 110" />
        <circle pathLength="1" cx="164" cy="60" r="7" />
        <path pathLength="1" d="M6 190 L32 112 L58 190Z M32 190 V198 M20 160 H44 M14 176 H50" />
        <path pathLength="1" d="M200 190 L222 120 L244 190Z M222 190 V198 M210 160 H234 M206 176 H238" />
        <path pathLength="1" d="M118 168 H146 V184 H118Z" />
        <circle pathLength="1" cx="124" cy="162" r="6" />
        <circle pathLength="1" cx="140" cy="162" r="6" />
        <path pathLength="1" d="M84 196 Q84 182 96 182 Q108 182 108 196 M156 196 Q156 182 168 182 Q180 182 180 196" />
        <circle pathLength="1" cx="96" cy="174" r="7" />
        <circle pathLength="1" cx="168" cy="174" r="7" />
        <path pathLength="1" d="M10 22 Q40 40 70 30 M190 30 Q220 40 236 22" />
      </g>
      <g className="telao__lights">
        <circle className="tw" cx="22" cy="28" r="3" />
        <circle className="tw tw--2" cx="40" cy="34" r="3" />
        <circle className="tw tw--3" cx="56" cy="33" r="3" />
        <circle className="tw tw--2" cx="206" cy="33" r="3" />
        <circle className="tw" cx="222" cy="30" r="3" />
      </g>
      <g className="telao__stars">
        <path className="tw tw--3" d="M120 10 v8 M116 14 h8" />
        <path className="tw" d="M30 64 v6 M27 67 h6" />
        <path className="tw tw--2" d="M214 74 v6 M211 77 h6" />
      </g>
    </svg>
  )
}

const ART = { fogao: Fogao, telao: Telao }

export function Unique({ u }) {
  const Art = ART[u.art] || Fogao
  return (
    <section className="uq" aria-label={u.title}>
      <div className="uq__copy">
        <p className="uq__kicker hand">{u.kicker}</p>
        <h4 className="uq__title display">{u.title}</h4>
        <p className="uq__text">{u.text}</p>
      </div>
      <div className="uq__art">
        <Art />
        <figure className="polaroid uq__photo">
          <span className="tape" style={{ top: -12, left: '50%', transform: 'translateX(-50%) rotate(4deg)' }} />
          <img src={u.photo.src} srcSet={srcSetOf(u.photo.src)} sizes="(min-width: 900px) 280px, 44vw" alt={u.photo.note} loading="lazy" decoding="async" />
          <figcaption>{u.photo.note}</figcaption>
        </figure>
      </div>
    </section>
  )
}

export function AntesDepois({ s }) {
  const old = ANTES_PHOTOS[0]
  return (
    <section className="ad" aria-label={s.title}>
      <p className="ad__kicker hand">{s.kicker}</p>
      <h4 className="ad__title display">{s.title}</h4>
      <div className="ad__pair">
        <figure className="polaroid ad__pic ad__pic--before">
          <span className="ad__tag hand">antes</span>
          {old ? (
            <img src={old.src} alt={old.note} loading="lazy" decoding="async" />
          ) : (
            <span className="ad__empty">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h3l1.6-2.2h6.8L17 8.5h3v10H4z" /><circle cx="12" cy="13.3" r="3.3" /></svg>
              {s.before}
            </span>
          )}
          <figcaption>{old?.note || 'a galera de sempre'}</figcaption>
        </figure>
        <svg className="ad__arrow" viewBox="0 0 80 40" aria-hidden="true">
          <path pathLength="1" d="M4 26 Q30 2 66 18" />
          <path pathLength="1" d="M56 8 L68 18 L54 26" />
        </svg>
        <figure className="polaroid ad__pic ad__pic--after">
          <span className="ad__tag hand">jan/27</span>
          <img src={s.after.src} srcSet={srcSetOf(s.after.src)} sizes="(min-width: 900px) 360px, 44vw" alt={s.after.note} loading="lazy" decoding="async" />
          <figcaption>{s.after.note}</figcaption>
        </figure>
      </div>
    </section>
  )
}
