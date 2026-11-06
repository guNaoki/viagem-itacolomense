// Fotos de /public/img têm uma versão de 640px (sufixo -640): o celular baixa a leve,
// telas grandes baixam a de 1200px.
export const srcSetOf = (src) =>
  /^\/img\/[^/]+\.webp$/.test(src) && !src.endsWith('-640.webp') ? `${src.replace(/\.webp$/, '-640.webp')} 640w, ${src} 1200w` : undefined

export const small = (src) => (/^\/img\/[^/]+\.webp$/.test(src) ? src.replace(/\.webp$/, '-640.webp') : src)

export const withSrcSet = (p) => (p.srcSet ? p : { ...p, srcSet: srcSetOf(p.src) })
