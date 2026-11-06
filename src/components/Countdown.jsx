import { useEffect, useState } from 'react'
import { TRIP } from '../data/trip'

const pad = (n) => String(n).padStart(2, '0')

function Digits({ value }) {
  return (
    <span className="cd__digits">
      {value.split('').map((d, i) => (
        <span className="cd__slot" key={i}>
          <span className="cd__d" key={d + '-' + i}>{d}</span>
        </span>
      ))}
    </span>
  )
}

export default function Countdown() {
  const target = new Date(TRIP.countdownTarget).getTime()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, target - now)
  if (diff === 0) {
    return (
      <div className="cd cd--done">
        <p className="display">chegou janeiro.</p>
      </div>
    )
  }
  const s = Math.floor(diff / 1000)
  const parts = [
    { v: String(Math.floor(s / 86400)), l: 'dias' },
    { v: pad(Math.floor((s % 86400) / 3600)), l: 'horas' },
    { v: pad(Math.floor((s % 3600) / 60)), l: 'min' },
    { v: pad(s % 60), l: 'seg' },
  ]
  return (
    <div className="cd" role="timer" aria-label={`Faltam ${parts[0].v} dias ${TRIP.countdownLabel}`}>
      <p className="cd__label hand">faltam</p>
      <div className="cd__row">
        {parts.map((p, i) => (
          <div className={`cd__cell ${i === 0 ? 'cd__cell--big' : ''}`} key={p.l}>
            <Digits value={p.v} />
            <span className="cd__unit">{p.l}</span>
          </div>
        ))}
      </div>
      <p className="cd__label cd__label--end hand">{TRIP.countdownLabel}</p>
    </div>
  )
}
