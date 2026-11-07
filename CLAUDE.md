# CLAUDE.md — Janeiro 2027 (viagem-itacolomense)

Site de uma página pra um grupo de 9–15 amigos escolher a viagem de janeiro. Público: celular, via WhatsApp.
Produção: https://viagem-itacolomense.vercel.app (Vercel publica sozinha a cada push na `main`).
Instruções de uso pra humanos estão no README.md; este arquivo é o contexto técnico pra continuar o trabalho.

## Comandos
- `npm run dev` — Vite na porta 5178 com `--host` (dá pra abrir no celular pela rede local)
- `npm run build` — sempre rodar antes de commitar; precisa terminar em "✓ built"
- `npm run thumbs` — gera `public/img/*-640.webp` (versões leves) das fotos novas
- Não há testes automatizados nem lint configurado.

## Idioma e tom
- Todo texto do site em **pt-BR informal**, voz de amigo ("bora", "a galera"). Comentários de código também em pt-BR.
- O site é **pra todo mundo**: não citar nomes dos organizadores. **Não mostrar que alguém paga mais**: uma pessoa
  entra com R$ 600 (`TRIP.extraPeople`/`extraPrice`), mas isso só entra na conta do `caixa()`, nunca aparece na tela.
- Visual sem "cara de IA": nada de emoji como ícone, cards de vidro em grade, gradientes genéricos.
  A linguagem é pôster/zine de verão: Fraunces (títulos), Bricolage Grotesque (texto), Caveat (anotações à mão),
  polaroids com fita crepe, rabiscos que se desenham, passagens picotadas.

## Arquitetura
- **Conteúdo:** tudo em `src/data/trip.js` (VIBES, ITINERARIES, ROUTES, TRANSPORT, TRIP). Componentes não devem
  ter texto de conteúdo fixo que dependa da vibe — vai pro `trip.js`.
- **Fotos da jornada:** `src/data/photos.js` usa `import.meta.glob` + `vite-imagetools` em `src/assets/jornada/<cena>/`
  (e `<cena>-<vibe>/`). `scenePhotos(v, scene)` em `trip.js` junta pasta da vibe > pasta geral > `SHARED_PHOTOS` > `v.scenes`.
- **Estado global** (`src/lib/trip-context.jsx`): `vibe` e `mode` ('day' | 'night'). `chooseVibe(id, {x, y, scrollTo})`
  dispara a transição de cor (`VibeFlood`), troca a vibe por baixo e rola até `scrollTo` (padrão: `#vibe`).
  Vibe `ody` tem `dayOnly: true` → `setMode` sempre força dia.
- **Dia/noite é automático**: quem muda é a jornada (`time` de cada parada). Não existe mais botão Dia/Sarau.
- **Céu** (`src/gl/Sky.jsx`): WebGL puro, um triângulo em tela cheia. Lê o objeto mutável `sky` de
  `src/gl/sky-state.js` a cada quadro (fora do React). Cores/forma do horizonte por vibe vêm de `VIBES[x].sky`
  e são interpoladas com GSAP. O grão de papel é feito no shader.
- **Seções** (ordem em `App.jsx`): Hero → Marquee → VibePicker → Journey → RouteSection → Money → Outro; Dock (navbar) e
  TopBar fixos. Seções que dependem da vibe usam `key={vibe}` no miolo pra remontar e reanimar.
- **Jornada** (`Journey.jsx`): **rolagem normal, nada trava a tela** (decisão do dono do site — a versão com tela
  travada foi descartada por causar problemas). As paradas são blocos `.chap` um embaixo do outro; só o trajeto em
  miniatura (`.trip__bar`) é `position: sticky` no topo — compacto, **sem faixa de fundo**, na mesma linha da marca
  "jan/27" (só contorno da cor do papel em volta do traço, nós e textos). O topo (`TopBar`) também não tem fundo. Um ScrollTrigger por parada (`top 60%` → `bottom 60%`)
  empurra o carrinho (`quickTo`) do meio do caminho anterior ao meio do próximo, acende o nó e chama
  `setMode(step.time)`. Os rótulos do trajeto são botões que rolam até a parada. Fotos: 1 foto = polaroid,
  várias = mural (`Mural`, layout `grid`), nenhuma = espaço reservado "em breve".
- **Fotos em mural** (`Mural.jsx`): nada de faixa pra arrastar (decisão do dono). Layouts `feature` (VibePicker: 1 grande +
  até 5, "+N" no último), `grid` (Jornada) e `masonry` (Galera, sem cortar). Tocar abre a foto grande (`Lightbox`,
  trava a rolagem com `lockScroll` de `scroll.js`).
- **"O que rola"** (`Sketch.jsx`): cada item de `VIBES[x].doing` (`{ t, art }`) vira um desenho SVG à mão — mancha de
  cor fora do registro (risografia) + traço que se desenha (`pathLength="1"` + `drawIn`). Desenho novo = entrada no `ART`.
  (Bilhete "imagina o sábado", carta na manga e seção de memes foram testados e descartados pelo dono.)
- **Romance da vibe** (`Romance.jsx`, aparece se a vibe tiver os dados no `trip.js`): `unique` = "só a X tem" (desenho
  animado escolhido por `art`: `fogao` na Chácara, `telao` nas Cabanas — fogo/vapor/feixe/luzinhas em CSS `@keyframes`,
  ligados só com o desenho na tela via IntersectionObserver — + polaroid); `story` = "antes e depois" nas 3 vibes (foto
  antiga da galera em `src/assets/antes/`, via `ANTES_PHOTOS` em `photos.js`, ao lado do lugar vazio "a próxima foto é
  aqui"). Sem foto antiga, mostra um espaço reservado.
- **"Por que não só o Ody Park?"**: rascunho (linha + botão com motivos acima das vibes) guardado na branch
  `claude/por-que-chacara`, fora da `main` até o dono revisar.
- **Kylian Mbapeso** (`Mbapeso.jsx`, `/img/mbapeso.webp`): avatar/meme do grupo do zap, figurinha redonda boiando
  (CSS `@keyframes boia` em `base.css`) ao lado do botão do Hero e acima do "Bora?". Não pode cobrir texto.
- **Rota** (`RouteSection.jsx`): mesmo esquema — `.route__pin` sticky dentro de `.route__track` + `.route__runway`,
  timeline com `scrub` dirige estrada (DrawSVG) e carro (MotionPath).
- **Caixa** (`Money.jsx`): recalcula com N pessoas; itens com `perPerson` escalam. A barra não tem legenda: cada pedaço
  tem nome e valor escritos em cima/embaixo (faixas `up`/`down`/`up2`/`down2`, distribuídas medindo as etiquetas só quando
  muda tamanho/número). A conta usa o valor **mais alto** de cada item; a frase do topo diz quanto sobra (e por pessoa).
  Se faltar dinheiro, mostra o limite tracejado e o texto em laranja.

- **Votação** (`Votacao.jsx` dentro do `Outro`, `src/lib/votes.js`): contador "quem vai" (meta 12, mínimo 9, teto 15),
  cédula (nome, se vai, topo/pode ser/não curto pra cada vibe) e placar (topo 1, pode ser ½). Dados numa planilha do
  Google via Apps Script (`scripts/votacao.gs`, passo a passo no README): POST em `text/plain` (sem checagem de CORS),
  `LockService` no script, leitura a cada 12 s só com aba visível e seção por perto. Ligada na planilha do dono (`TRIP.voteUrl`). Sem `voteUrl` = modo prévia
  (votos de exemplo no `localStorage`). Sem login: a pessoa digita o nome; o nome normalizado é a chave.

- **Data e alerta**: a viagem é sáb 30/01 a seg 01/02/2027 (`TRIP.dates`, contagem em `countdownTarget`); `TRIP.alert`
  aparece numa tira amarela no Hero, abaixo do botão "Bora votar" e do Mbapeso ("as datas tão acabando..."). Chácara fechou em R$ 2.330.
- **Desenhos dentro da parada**: um passo do roteiro pode ter `doing` (`{ t, art }`), que vira uma fileira de desenhos do
  `Sketch` no meio da parada (hoje: dia livre nas Cabanas — futsabão, vôlei, ping-pong, baralho).
- **Foto única na jornada**: se for deitada (paisagem), a polaroid fica larga e sem corte (`.chap__one.is-wide`, decidido
  no `onLoad` da imagem).

- **Tela de carregamento**: HTML+CSS inline no `index.html` (`#loader`, aparece antes do JS). `main.jsx` cria
  `window.__appReady` (fontes + `load`, mínimo 650 ms, teto 4 s) e remove o loader; a entrada do Hero espera essa promessa.

## Regras de desempenho (o site já travou no celular por cada um destes)
- **Não usar `pin` do ScrollTrigger** nem travar a tela. Se algo precisa ficar parado, `position: sticky`
  + ScrollTrigger só pra ler progresso. (Pin no celular treme com a barra de endereço e o pin-spacer briga com o React.)
- **Faixa horizontal dentro de grid precisa de `minmax(0, 1fr)`** (e `min-width: 0` no item). Senão a faixa estica a
  coluna, o celular "abre" a página na horizontal e tudo que é `position: fixed` (navbar) some da tela.
  `main` tem `overflow-x: clip` (clip, não hidden — hidden quebraria o sticky).
- Rolagem: Lenis só suaviza **mouse/trackpad** (`syncTouch: false`); no toque a rolagem é a nativa.
  `ScrollTrigger.config({ ignoreMobileResize: true })` ignora a barra de endereço.
- **Nada de ler layout em handler de rolagem** (`scrollHeight`, `getBoundingClientRect`, `getBBox`…).
  Use `onScrollY(cb)` de `src/lib/scroll.js` (um único ouvinte, valores em cache).
- **Não animar DrawSVG/`gsap.set({drawSVG})` por quadro**: ele mede o caminho (`getBBox`) a cada chamada.
  Pra progresso contínuo use `pathLength="1"` + `strokeDasharray` direto no estilo.
- Sem `backdrop-filter` no celular (só em `@media (hover:hover) and (pointer:fine)`); sem camadas fixas
  com `mix-blend-mode` sobre o canvas.
- Céu: no celular renderiza em ~0,42×DPR e a 30 fps; estrelas/fogueira só calculam com `uNight` alto.
  Não recriar o canvas quando só a altura muda.
- Transições de cor na raiz (`@property --paper/--ink/--ink-2`) são curtas (0,7 s) e só nessas 3 variáveis:
  cada quadro recalcula o estilo da página inteira.
- Animação de entrada/saída frequente → CSS `@keyframes` (compositor), não tween por evento.

## Armadilhas conhecidas
- **SplitText + `mask`**: a classe da máscara vira `<classe>-mask`, mas o regex do GSAP quebra nome com hífen
  (`split-char` → `split-mask-char-mask`). Use nomes **sem hífen**: `sline`, `schar` (CSS em `base.css`
  dá folga pra não cortar itálico/acento/perna do "g"). O título do Hero desfaz o split ao fim da entrada.
- **Rabiscos** (`Doodle.jsx`): o caminho é recalculado no tamanho real do SVG (ResizeObserver). Não voltar a usar
  `preserveAspectRatio="none"` + `vector-effect` com dash — o traço quebra em pedaços.
- "Janeiro" do Hero usa `useFitText` (ajusta o font-size à largura) — não trocar por `vw` fixo.
- `vite-imagetools` está com `cache: { enabled: false }` porque no Windows o cache dava "Input file is missing".
- No Windows o `npm run dev` segura arquivos em `src/assets`: pare o servidor pra apagar fotos.
- Prévia do link: `og:image` precisa de URL **absoluta** (`https://viagem-itacolomense.vercel.app/og.jpg`).
  Se o domínio mudar, atualizar `index.html`.

## Como testar visualmente
Não há Playwright no projeto. O que funcionou: `puppeteer-core` (fora do repo) apontando pro Chrome instalado,
com `--enable-unsafe-swiftshader` pro WebGL, viewport 390×844 `isMobile/hasTouch` e 1440/1850 no desktop,
rolando com `scrollTo` em passos e tirando screenshots. Medição de quadros em Chrome sem GPU oscila muito:
confirmar fluidez num celular de verdade (`npm run dev` + IP da rede).

## Git
- Branch `main`; autor `GUSTAVO NAOKI IDA <gunaoki.ida@gmail.com>`.
- Commits em pt-BR, descrevendo o que mudou pra quem usa o site.
