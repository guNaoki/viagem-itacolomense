import { useEffect, useState } from 'react'
import { useTrip } from '../lib/trip-context'
import { scrollToEl } from '../lib/scroll'
import Icon from './Icons'
import './TopBar.css'

export default function TopBar() {
  const { mode, setMode, v } = useTrip()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(scrollY > innerHeight * 0.5)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`top ${scrolled ? 'is-scrolled' : ''}`}>
      <a
        href="#topo"
        className="top__mark"
        onClick={(e) => {
          e.preventDefault()
          scrollToEl('#topo', { offset: 0 })
        }}
      >
        jan<i>/</i>27
      </a>
      <div className={`toggle ${v.dayOnly ? 'is-hidden' : ''}`} role="group" aria-label="Clima do site" data-on={mode} aria-hidden={v.dayOnly || undefined}>
        <span className="toggle__knob" aria-hidden="true" />
        <button type="button" aria-pressed={mode === 'day'} onClick={() => setMode('day')}>
          <Icon name="sun" size={18} />
          <span><b className="toggle__pre">Vibe </b>Dia</span>
        </button>
        <button type="button" aria-pressed={mode === 'night'} onClick={() => setMode('night')}>
          <Icon name="fire" size={18} />
          <span><b className="toggle__pre">Vibe </b>Sarau</span>
        </button>
      </div>
    </header>
  )
}
