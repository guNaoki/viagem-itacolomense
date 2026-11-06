# Janeiro 2027 — o nosso fim de semana

React + Vite, GSAP (ScrollTrigger, SplitText, MotionPath, DrawSVG), Lenis e um céu em WebGL puro.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5178 (abre na rede local também, pra testar no celular)
npm run build    # gera /dist pra subir em Vercel, Netlify, etc.
```

## Onde mexer

- **Todo o conteúdo** (textos, preços, links, fotos, roteiros, data da contagem): `src/data/trip.js`
- **Fotos**: coloque em `public/img/` e aponte como `/img/arquivo.webp`
- **Fotos do sarau (IA)**: `VIBES.chacara.dayNight.night.photos` — enquanto estiver vazio, aparecem dois espaços reservados
- **Link direto pra uma vibe**: `?vibe=chacara`, `?vibe=cabanas` ou `?vibe=ody`

## Como funciona

- `src/gl/Sky.jsx` — shader do céu: sol com listras de calor, pôr do sol, lua, estrelas, brasa e fagulhas; o horizonte muda com a vibe (morros, tendas A-frame, ondas)
- `src/lib/trip-context.jsx` — estado global (vibe + dia/noite); trocar a vibe re-renderiza todas as seções
- `src/components/Timeline.jsx` — trilha tracejada calculada a partir da posição dos passos; vertical no celular, onda horizontal no desktop
