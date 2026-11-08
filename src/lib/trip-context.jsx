import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { VIBES, CHOSEN } from '../data/trip'
import { sky } from '../gl/sky-state'
import { gsap, reduceMotion } from './gsap'

const Ctx = createContext(null)

const readVibe = () => CHOSEN

function tweenSky(v, instant) {
  const s = VIBES[v].sky
  const d = instant ? 0 : 1.6
  const o = { duration: d, ease: 'power2.inOut', overwrite: true }
  gsap.to(sky.accent, { r: s.accent[0], g: s.accent[1], b: s.accent[2], ...o })
  gsap.to(sky.accent2, { r: s.accent2[0], g: s.accent2[1], b: s.accent2[2], ...o })
  gsap.to(sky.shape, { a: s.shape[0], b: s.shape[1], c: s.shape[2], ...o })
  gsap.to(sky, { fire: s.fire, ...o, overwrite: false })
}

export function TripProvider({ children }) {
  const [vibe, setVibe] = useState(readVibe)
  const [mode, setModeRaw] = useState('day')
  // a vibe do Ody não tem noite: qualquer pedido de noite vira dia
  const setMode = useCallback((m) => setModeRaw(VIBES[vibe].dayOnly ? 'day' : m), [vibe])
  const [flood, setFlood] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.vibe = vibe
    if (VIBES[vibe].dayOnly) setModeRaw('day')
    tweenSky(vibe, false)
    const url = new URL(location.href)
    url.searchParams.set('vibe', vibe)
    history.replaceState(null, '', url)
  }, [vibe])

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    gsap.to(sky, { night: mode === 'night' ? 1 : 0, duration: reduceMotion() ? 0 : 2.4, ease: 'sine.inOut' })
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'night' ? '#14110F' : '#FFF8E7')
  }, [mode])

  // troca de vibe com a "inundação" de cor; origin = {x, y, scrollTo}
  const chooseVibe = useCallback(
    (id, origin = {}) => {
      if (id === vibe) return
      if (reduceMotion()) return setVibe(id)
      setFlood({ to: id, x: origin.x ?? innerWidth / 2, y: origin.y ?? innerHeight / 2, scrollTo: origin.scrollTo, key: Date.now() })
    },
    [vibe],
  )

  const value = useMemo(
    () => ({ vibe, v: VIBES[vibe], setVibe, chooseVibe, mode, setMode, flood, setFlood }),
    [vibe, mode, flood, chooseVibe, setMode],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTrip = () => useContext(Ctx)
