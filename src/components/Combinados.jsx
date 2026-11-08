import { useEffect, useRef, useState } from 'react'
import { TRIP } from '../data/trip'
import { useReveal } from '../lib/useReveal'
import './Combinados.css'

/*
  Combinados da chácara: onde é, o que levar, compras do churrasco, pix.
  O que ainda não foi preenchido em TRIP.combinados aparece como "a gente confirma aqui".
  As marcações (levei / comprei) ficam só no aparelho de cada um.
*/
const C = TRIP.combinados

function useChecks(key) {
  const [on, setOn] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || {} } catch { return {} }
  })
  const toggle = (k) =>
    setOn((o) => {
      const n = { ...o, [k]: !o[k] }
      try { localStorage.setItem(key, JSON.stringify(n)) } catch { /* sem armazenamento: segue */ }
      return n
    })
  return [on, toggle]
}

const fmt = (x) => String(Math.round(x * 10) / 10).replace('.', ',')
const Soon = () => <span className="cmb__soon hand">a gente confirma aqui</span>

function Copy({ text }) {
  const [ok, setOk] = useState(false)
  const t = useRef(0)
  useEffect(() => () => clearTimeout(t.current), [])
  const go = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setOk(true)
      clearTimeout(t.current)
      t.current = setTimeout(() => setOk(false), 2200)
    } catch { /* sem permissão: a chave continua visível pra copiar na mão */ }
  }
  return <button type="button" className="cmb__copy hand" onClick={go}>{ok ? 'copiado!' : 'copiar'}</button>
}

export default function Combinados() {
  const scope = useRef(null)
  useReveal(scope)
  const [n, setN] = useState(TRIP.people.base)
  const [bag, toggleBag] = useChecks('cmb-levar')
  const [shop, toggleShop] = useChecks('cmb-compras')

  return (
    <section className="sec cmb" id="combinados" ref={scope}>
      <div className="wrap">
        <p className="eyebrow">antes de ir</p>
        <h2 className="display h2" data-split>
          Os <em>combinados</em>
        </h2>

        <div className="cmb__grid">
          <article className="cmb__card" data-rise>
            <h3 className="cmb__h hand">onde e quando</h3>
            <dl className="cmb__dl">
              <dt>Endereço</dt>
              <dd>
                {C.address || <Soon />}
                {C.mapUrl && <> · <a href={C.mapUrl} target="_blank" rel="noopener noreferrer">abrir no mapa</a></>}
              </dd>
              <dt>Chegada</dt>
              <dd>{C.arrival || <Soon />}</dd>
              <dt>Saída</dt>
              <dd>{C.leave || <Soon />}</dd>
              <dt>Carona</dt>
              <dd>{C.rides}</dd>
            </dl>
          </article>

          <article className="cmb__card" data-rise>
            <h3 className="cmb__h hand">o que levar</h3>
            <ul className="cmb__list">
              {C.levar.map((t) => (
                <li key={t}>
                  <label>
                    <input type="checkbox" checked={!!bag[t]} onChange={() => toggleBag(t)} />
                    <span>{t}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="cmb__fine">As marcações ficam só no teu celular.</p>
          </article>

          <article className="cmb__card cmb__card--wide" data-rise>
            <h3 className="cmb__h hand">compras do churrasco</h3>
            <div className="seg-pick" role="radiogroup" aria-label="Quantas pessoas">
              {TRIP.people.scenarios.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={n === k} onClick={() => setN(k)} className="seg-pick__b">
                  <span className="display">{k}</span>
                  <small>pessoas</small>
                </button>
              ))}
            </div>
            <ul className="cmb__list cmb__list--shop">
              {C.compras.map((c) => (
                <li key={c.t}>
                  <label>
                    <input type="checkbox" checked={!!shop[c.t]} onChange={() => toggleShop(c.t)} />
                    <span>{c.t}</span>
                    <b className="cmb__qty">{fmt(c.per * n)} {c.un}</b>
                  </label>
                </li>
              ))}
            </ul>
            <p className="cmb__fine">Contas por pessoa, de cabeça: ajusta no grupo conforme o apetite da galera. Tudo sai do caixa de R$ {TRIP.price}.</p>
          </article>

          <article className="cmb__card" data-rise>
            <h3 className="cmb__h hand">pix dos R$ {TRIP.price}</h3>
            {C.pix.key ? (
              <p className="cmb__pix">
                <b>{C.pix.key}</b> <Copy text={C.pix.key} />
                {C.pix.name && <small>no nome de {C.pix.name}</small>}
              </p>
            ) : (
              <p className="cmb__pix"><Soon /></p>
            )}
            <p className="cmb__fine">{TRIP.notes.details}</p>
          </article>
        </div>
      </div>
    </section>
  )
}
