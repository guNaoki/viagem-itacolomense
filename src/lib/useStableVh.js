import { useEffect, useState } from 'react'

// Altura da tela "estável": ignora a barra de endereço do celular aparecendo/sumindo
// (só atualiza quando a largura muda ou a altura varia de verdade, ex.: girar o celular).
export function useStableVh() {
  const [vh, setVh] = useState(() => (typeof window === 'undefined' ? 800 : innerHeight))
  useEffect(() => {
    let w = innerWidth
    const on = () => {
      if (innerWidth !== w) {
        w = innerWidth
        setVh(innerHeight)
      } else setVh((h) => (Math.abs(innerHeight - h) > 160 ? innerHeight : h))
    }
    addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])
  return vh
}
