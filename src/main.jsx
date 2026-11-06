import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import App from './App.jsx'

// Tela de carregamento (fica no index.html): sai quando fontes e página carregaram,
// com um tempo mínimo pra não piscar e um teto pra nunca prender ninguém.
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const pageLoaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))
window.__appReady = Promise.race([Promise.all([wait(650), pageLoaded, document.fonts?.ready]), wait(4000)]).then(() => {
  const el = document.getElementById('loader')
  if (!el) return
  el.classList.add('is-done')
  setTimeout(() => el.remove(), 800)
})

createRoot(document.getElementById('root')).render(<App />)
