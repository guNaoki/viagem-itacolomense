import { useEffect, useState } from 'react'
import { scrollToEl } from '../lib/scroll'
import './TopBar.css'

// Topo enxuto: só a marca. O dia/noite é automático (acompanha a jornada).
export default function TopBar() {
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
    </header>
  )
}
