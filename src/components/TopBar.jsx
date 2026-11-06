import { useEffect, useState } from 'react'
import { scrollToEl, onScrollY } from '../lib/scroll'
import './TopBar.css'

// Topo enxuto: só a marca. O dia/noite é automático (acompanha a jornada).
export default function TopBar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = innerHeight * 0.5
    return onScrollY((y) => setScrolled(y > h))
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
