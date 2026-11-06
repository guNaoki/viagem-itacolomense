import { scrollToEl } from '../lib/scroll'
import './TopBar.css'

// Topo enxuto: só a marca. O dia/noite é automático (acompanha a jornada)
// e o trajeto da jornada gruda na mesma linha, à direita da marca.
export default function TopBar() {
  return (
    <header className="top">
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
