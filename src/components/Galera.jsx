import { useRef } from 'react'
import { GALERA } from '../data/trip'
import { GALERA_PHOTOS } from '../data/galera'
import { useReveal } from '../lib/useReveal'
import Mural from './Mural'
import './Galera.css'

// "A gente": memes e fotos do grupo. Só aparece se tiver arquivo em src/assets/galera/.
export default function Galera() {
  const scope = useRef(null)
  useReveal(scope)
  if (!GALERA_PHOTOS.length) return null
  return (
    <section className="sec galera" id="galera" ref={scope}>
      <div className="wrap">
        <p className="eyebrow">{GALERA.eyebrow}</p>
        <h2 className="display h2" data-split>{GALERA.title}</h2>
        <p className="lede galera__lede" data-rise>{GALERA.text}</p>
        <div data-rise>
          <Mural photos={GALERA_PHOTOS} layout="masonry" />
        </div>
        <p className="galera__end hand" data-rise>{GALERA.end}</p>
      </div>
    </section>
  )
}
