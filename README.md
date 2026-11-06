# Janeiro 2027 — o nosso fim de semana

Site pra galera escolher a viagem de janeiro: 3 "vibes" (Chácara Alta Vista, Cabanas Bosque Encantado, Ody Park),
o fim de semana contado parada por parada, a estrada e a conta do caixa. Feito pra abrir no celular, pelo WhatsApp.

**No ar:** https://viagem-itacolomense.vercel.app
**Repositório:** https://github.com/guNaoki/viagem-itacolomense

Stack: React 18 + Vite 6, GSAP 3.13 (ScrollTrigger, SplitText, MotionPath, DrawSVG — todos gratuitos desde a 3.13),
Lenis (rolagem suave no mouse), um céu em WebGL puro e `vite-imagetools` + `sharp` pras fotos.

---

## Começar em outro PC

Precisa de **Node 20 ou mais novo** e **Git**.

```bash
git clone https://github.com/guNaoki/viagem-itacolomense.git
cd viagem-itacolomense
npm install
npm run dev
```

Abre em http://localhost:5178. O `--host` já vem ligado: o terminal mostra também um endereço `http://192.168.x.x:5178`
pra abrir **no celular** (mesmo Wi-Fi) e testar de verdade.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (recarrega sozinho) |
| `npm run build` | gera a versão final em `dist/` |
| `npm run preview` | serve o `dist/` pra conferir o build |
| `npm run thumbs` | cria a versão leve (640px) das fotos novas em `public/img` |

Se o `npm install` avisar sobre "allow-scripts" do `sharp`/`esbuild`, pode ignorar: os dois usam binários prontos.

## Publicar

A Vercel está ligada ao GitHub: **todo push na `main` publica sozinho** em ~1 minuto.
Não tem configuração especial (a Vercel detecta Vite: build `npm run build`, saída `dist`).

```bash
git add -A
git commit -m "o que mudou"
git push
```

---

## Onde mexer

### Textos, preços, links e roteiros → `src/data/trip.js`
Tudo que é conteúdo mora nesse arquivo:
- `TRIP` — data da contagem regressiva, número de pessoas (9/12/15), R$ 300 por pessoa, R$ 600 dos organizadores
- `VIBES` — cada vibe: nome, textos, fotos da galeria, link do anúncio, cores do céu, roteiros, transportes e orçamento
- `ITINERARIES` — as paradas de cada roteiro (`time: 'day' | 'night'` controla o céu)
- `ROUTES` e `TRANSPORT` — mapa da estrada e as "passagens"

### Fotos da jornada (Itacolomi, estrada, sarau…) → só jogar na pasta
```
src/assets/jornada/itacolomi/   -> parada "Família em Novo Itacolomi"
src/assets/jornada/estrada/     -> "Pé na estrada" / "Descida"
src/assets/jornada/sarau/       -> "Chegada e sarau" (ex.: fotos de IA)
src/assets/jornada/van/         -> "Saída da van" (Ody)
src/assets/jornada/volta/       -> "Volta pra casa" (Ody)
```
- Aceita jpg, png e webp, **pode ser foto direto do celular**: no build ela é reduzida e convertida pra webp.
- A **legenda vem do nome do arquivo**: `02-almoco-na-casa-da-vo.jpg` vira "almoco na casa da vo".
  O número no começo só serve pra ordenar.
- Pra uma foto valer só numa vibe, crie a pasta com sufixo: `sarau-chacara/`, `estrada-ody/`…
- Com o `npm run dev` rodando, no Windows a pasta fica "presa": pra **apagar** uma foto, pare o servidor antes.

### Fotos das galerias das vibes → `public/img/`
Coloque o arquivo `.webp` (até ~1200px) em `public/img`, rode `npm run thumbs` (cria a versão `-640.webp`
que o celular baixa) e aponte em `trip.js` como `'/img/arquivo.webp'`.

### Prévia do link no WhatsApp
Imagem em `public/og.jpg` (1200×630) e as tags em `index.html`. O WhatsApp guarda a prévia em cache por um tempo:
pra ver uma prévia nova, mande o link com algo no fim (ex.: `?v=2`).

### Link direto pra uma vibe
`https://viagem-itacolomense.vercel.app/?vibe=cabanas` (ou `chacara`, `ody`).

---

## Estrutura

```
index.html              fontes, meta tags e prévia do link
public/img/             fotos das vibes (+ versões -640)
public/og.jpg           imagem da prévia
scripts/thumbs.mjs      gera as versões leves
src/
  App.jsx               ordem das seções
  data/trip.js          TODO o conteúdo
  data/photos.js        lê as pastas de src/assets/jornada
  assets/jornada/       fotos que entram sozinhas na jornada
  gl/Sky.jsx            céu em WebGL (sol, pôr do sol, estrelas, fogueira, horizonte por vibe)
  lib/                  GSAP, rolagem, estado (vibe + dia/noite), utilitários
  components/           Hero, VibePicker, Journey, RouteSection, Money, Outro, Dock (navbar), etc.
  styles/base.css       cores, fontes e peças comuns (polaroid, fita, botões)
```

Mais detalhes técnicos (decisões, armadilhas, como testar) estão no [CLAUDE.md](CLAUDE.md).
