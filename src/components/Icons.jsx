// Ícones desenhados à mão (traço irregular de propósito).
const P = {
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M5.2 18.8l1.7-1.7M17.1 6.9l1.7-1.7" /></>,
  fire: <path d="M12 21.5c-4 0-6.5-2.6-6.5-6.1 0-3.4 2.6-5 3.3-8.4 1.9 1.2 2.5 3 2.6 4.4 1-1.2 1.6-3.4 1.2-6.9 3.6 2.2 6 6.1 6 10.6 0 3.6-2.6 6.4-6.6 6.4Z M12 21.5c-1.7 0-2.8-1.1-2.8-2.7 0-1.8 1.6-2.6 2.3-4.3 1.6 1.2 3.3 2.4 3.3 4.4 0 1.6-1.1 2.6-2.8 2.6Z" />,
  moon: <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />,
  home: <path d="M3.5 11 12 3.8l8.5 7.2M5.8 9.4v10.8h12.4V9.4M10 20.2v-5.6h4v5.6" />,
  car: <><path d="M3 15.5v-3.2l2.2-4.8c.3-.7 1-1.1 1.7-1.1h10.2c.7 0 1.4.4 1.7 1.1l2.2 4.8v3.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1ZM3.4 12.2h17.2" /><circle cx="7.3" cy="16.6" r="1.9" /><circle cx="16.7" cy="16.6" r="1.9" /></>,
  van: <><path d="M2.5 16.5V7.3c0-.8.7-1.5 1.5-1.5h11.6c.5 0 1 .2 1.3.6l4 4.6c.3.3.4.7.4 1.1v4.4M2.5 11h18.6M9 5.8V11" /><circle cx="6.8" cy="17" r="2" /><circle cx="17.2" cy="17" r="2" /></>,
  bus: <><rect x="4" y="3.5" width="16" height="14" rx="2.5" /><path d="M4 10.5h16M7 20.5v-3M17 20.5v-3M8 14h.01M16 14h.01" /></>,
  key: <><circle cx="8" cy="15" r="4.3" /><path d="m11.2 12 8.3-8.3M16.5 6.7l2.4 2.4M14.3 8.9l1.8 1.8" /></>,
  wave: <path d="M2.5 9c2.2-2 4.1-2 6.3 0s4.1 2 6.3 0 4.1-2 6.4 0M2.5 15c2.2-2 4.1-2 6.3 0s4.1 2 6.3 0 4.1-2 6.4 0" />,
  arrow: <path d="M5 12.2h13.5M13 6.5l5.6 5.7-5.6 5.6" />,
  arrowDown: <path d="M12 4.5v14.5M6.3 13.4 12 19l5.7-5.6" />,
  out: <path d="M7 17 17.2 6.8M8.6 6.4h9v9" />,
  share: <><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" /></>,
}

export default function Icon({ name, size = 22, stroke = 1.8, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  )
}
