/* ------------------------------------------------------------------
   FOTOS QUE ENTRAM SOZINHAS NA JORNADA
   Joga as fotos (jpg, png ou webp) numa destas pastas e pronto:
     src/assets/jornada/itacolomi   -> parada "Família em Novo Itacolomi"
     src/assets/jornada/estrada     -> "Pé na estrada" / descida
     src/assets/jornada/sarau       -> "Chegada e sarau" (ex.: as fotos de IA)
     src/assets/jornada/van         -> "Saída da van" (Ody)
     src/assets/jornada/volta       -> "Volta pra casa" (Ody)
   Pra valer só numa vibe, crie a pasta com o sufixo: ex. "sarau-chacara".
   - A legenda vem do nome do arquivo: "02-almoco-na-casa-da-vo.jpg" -> "almoco na casa da vo"
     (o número no começo só serve pra ordenar)
   - Pode ser foto direto do celular: no build ela é reduzida e convertida pra webp.
------------------------------------------------------------------- */
const srcsets = import.meta.glob('../assets/jornada/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?w=640;1280&format=webp&quality=78&as=srcset',
  import: 'default',
})
const srcs = import.meta.glob('../assets/jornada/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?w=1280&format=webp&quality=78',
  import: 'default',
})

const caption = (file) =>
  file
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_ .]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim()

export const FOLDER_PHOTOS = {}
Object.keys(srcs)
  .sort()
  .forEach((path) => {
    const m = path.match(/jornada\/([^/]+)\/([^/]+)$/)
    if (!m) return
    const [, folder, file] = m
    ;(FOLDER_PHOTOS[folder] ||= []).push({ src: srcs[path], srcSet: srcsets[path], note: caption(file) })
  })
