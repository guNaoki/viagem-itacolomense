import { useCallback, useEffect, useRef, useState } from 'react'
import { TRIP } from '../data/trip'

/*
  Votos da galera, guardados numa planilha do Google (Apps Script, ver scripts/votacao.gs).
  - ler: GET no web app -> { people: [{ name, presence, votes: { chacara, cabanas, ody }, at }] }
  - votar: POST com o corpo em text/plain (JSON dentro) — assim o navegador não faz a checagem de CORS
    que o Apps Script não sabe responder
  - "tempo real": pergunta de novo a cada 12 s, só com a aba aberta e a seção perto da tela
  Sem TRIP.voteUrl, roda em modo prévia: votos de exemplo guardados só no aparelho.
*/
export const PRESENCE = { in: 'tô dentro', maybe: 'talvez', out: 'não dá' }
export const CHOICES = [
  { id: 'top', label: 'topo', score: 1 },
  { id: 'ok', label: 'pode ser', score: 0.5 },
  { id: 'no', label: 'não curto', score: 0 },
]

const URL = TRIP.voteUrl
export const PREVIEW = !URL
const ME = 'voto-meu-nome'
const PREVIEW_KEY = 'voto-previa'
const POLL = 12000

export const keyOf = (name) => name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const store = {
  get: (k, fb) => {
    try {
      const v = localStorage.getItem(k)
      return v ? JSON.parse(v) : fb
    } catch {
      return fb
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      /* navegação privada: segue sem guardar */
    }
  },
}

// exemplo pro modo prévia (some quando a planilha for ligada)
const SAMPLE = [
  ['Exemplo 1', 'in', 'top', 'ok', 'no'],
  ['Exemplo 2', 'in', 'top', 'top', 'ok'],
  ['Exemplo 3', 'in', 'ok', 'top', 'no'],
  ['Exemplo 4', 'in', 'top', 'ok', 'ok'],
  ['Exemplo 5', 'in', 'ok', 'top', 'no'],
  ['Exemplo 6', 'maybe', 'top', 'no', 'top'],
  ['Exemplo 7', 'in', 'top', 'ok', 'no'],
  ['Exemplo 8', 'maybe', 'ok', 'ok', 'ok'],
].map(([name, presence, chacara, cabanas, ody]) => ({ name, presence, votes: { chacara, cabanas, ody } }))

async function fetchPeople() {
  if (PREVIEW) return store.get(PREVIEW_KEY, SAMPLE)
  const r = await fetch(URL, { cache: 'no-store' })
  if (!r.ok) throw new Error(r.status)
  return (await r.json()).people || []
}

async function sendVote(entry) {
  if (PREVIEW) {
    const list = store.get(PREVIEW_KEY, SAMPLE).filter((p) => keyOf(p.name) !== keyOf(entry.name))
    const next = [...list, entry]
    store.set(PREVIEW_KEY, next)
    return next
  }
  const r = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(entry),
  })
  if (!r.ok) throw new Error(r.status)
  const d = await r.json()
  if (d.error) throw new Error(d.error)
  return d.people || []
}

export function useVotes(watchRef) {
  const [people, setPeople] = useState([])
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [myName, setMyName] = useState(() => store.get(ME, ''))
  const near = useRef(true)

  const load = useCallback(async () => {
    try {
      setPeople(await fetchPeople())
      setStatus('ok')
    } catch {
      setStatus((s) => (s === 'ok' ? 'ok' : 'error')) // se já tinha dados, mantém na tela
    }
  }, [])

  useEffect(() => {
    load()
    if (PREVIEW) return
    // só pergunta de novo com a aba visível e a seção por perto
    const io = new IntersectionObserver(([e]) => (near.current = e.isIntersecting), { rootMargin: '600px 0px' })
    if (watchRef?.current) io.observe(watchRef.current)
    const id = setInterval(() => document.visibilityState === 'visible' && near.current && load(), POLL)
    const onVis = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [load, watchRef])

  const vote = useCallback(async (entry) => {
    store.set(ME, entry.name)
    setMyName(entry.name)
    // otimista: já aparece na tela; se falhar, volta
    const before = people
    setPeople((list) => [...list.filter((p) => keyOf(p.name) !== keyOf(entry.name)), entry])
    try {
      setPeople(await sendVote(entry))
      return true
    } catch {
      setPeople(before)
      return false
    }
  }, [people])

  const mine = people.find((p) => myName && keyOf(p.name) === keyOf(myName))
  return { people, status, vote, myName, mine }
}
