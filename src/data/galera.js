/* ------------------------------------------------------------------
   MEMES E FOTOS DA GALERA
   Joga os arquivos em src/assets/galera/ e a seção "A gente" aparece sozinha
   (antes do "Bora?"). Sem nenhum arquivo, a seção some.
   - A legenda vem do nome: "03-o-dia-que-o-carro-atolou.jpg" -> "o dia que o carro atolou"
     (o número no começo só serve pra ordenar; sem legenda: "05.jpg")
   - Meme não é cortado: aparece inteiro, no formato original.
   - GIF entra como está (animado).
------------------------------------------------------------------- */
const pics = import.meta.glob('../assets/galera/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?w=900&format=webp&quality=80',
  import: 'default',
})
const sets = import.meta.glob('../assets/galera/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?w=480;900&format=webp&quality=80&as=srcset',
  import: 'default',
})
const gifs = import.meta.glob('../assets/galera/*.{gif,GIF}', { eager: true, query: '?url', import: 'default' })

const caption = (file) =>
  file
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_ .]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim()

export const GALERA_PHOTOS = Object.keys({ ...pics, ...gifs })
  .sort()
  .map((path) => {
    const file = path.split('/').pop()
    return { src: pics[path] || gifs[path], srcSet: sets[path], note: caption(file) }
  })
