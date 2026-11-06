// Gera a versão leve (640px, sufixo -640.webp) de cada foto em public/img.
// Uso: npm run thumbs   (só cria as que ainda não existem; --force refaz todas)
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const dir = new URL('../public/img/', import.meta.url)
const force = process.argv.includes('--force')
const files = (await readdir(dir)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f) && !/-640\.webp$/i.test(f))

let made = 0
for (const f of files) {
  const base = f.replace(/\.[^.]+$/, '')
  const out = join(dir.pathname.replace(/^\/(\w:)/, '$1'), `${base}-640.webp`)
  const exists = await stat(out).then(() => true, () => false)
  if (exists && !force) continue
  await sharp(join(dir.pathname.replace(/^\/(\w:)/, '$1'), f))
    .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out)
  made++
  console.log('ok', `${base}-640.webp`)
}
console.log(made ? `${made} versão(ões) leve(s) criada(s).` : 'Nada novo: todas as fotos já têm versão leve.')
