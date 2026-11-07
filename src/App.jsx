import { useEffect } from 'react'
import { TripProvider, useTrip } from './lib/trip-context'
import { initScroll } from './lib/scroll'
import { ScrollTrigger } from './lib/gsap'
import Sky from './gl/Sky'
import TopBar from './components/TopBar'
import Dock from './components/Dock'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import VibePicker from './components/VibePicker'
import Journey from './components/Journey'
import RouteSection from './components/RouteSection'
import Money from './components/Money'
import Outro from './components/Outro'
import VibeFlood from './components/VibeFlood'

function Page() {
  const { vibe } = useTrip()

  useEffect(() => {
    initScroll()
  }, [])

  // conteúdo muda de tamanho quando a vibe muda -> recalcula tudo
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [vibe])

  return (
    <>
      <Sky />
      <TopBar />
      <main>
        <Hero />
        <Marquee />
        <VibePicker />
        <Journey />
        <RouteSection />
        <Money />
        <Outro />
      </main>
      <Dock />
      <VibeFlood />
    </>
  )
}

export default function App() {
  return (
    <TripProvider>
      <Page />
    </TripProvider>
  )
}
