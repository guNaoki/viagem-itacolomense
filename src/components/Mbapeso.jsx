// Kylian Mbapeso, o mascote do grupo do zap, boiando devagar (CSS @keyframes)
export default function Mbapeso({ caption, className = '' }) {
  return (
    <figure className={`mbapeso ${className}`} aria-hidden="true">
      <img src="/img/mbapeso.webp" alt="" decoding="async" width="640" height="640" />
      <figcaption className="hand">{caption}</figcaption>
    </figure>
  )
}
