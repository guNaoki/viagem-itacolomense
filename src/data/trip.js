/* ------------------------------------------------------------------
   TUDO QUE É CONTEÚDO MORA AQUI.
   Pra trocar foto, texto, preço ou link, mexe só neste arquivo.
   Fotos: coloque o arquivo em /public/img e aponte o caminho "/img/...".
   Também dá pra usar URL externa (ex.: CDN do Airbnb).
------------------------------------------------------------------- */

import { FOLDER_PHOTOS } from './photos'
import { withSrcSet } from '../lib/img'

export const TRIP = {
  // Contagem regressiva: até quando? (fuso de Brasília)
  // data da viagem: sábado 30/01 a segunda 01/02 (a única data livre da chácara)
  dates: '30/01 a 01/02',
  countdownTarget: '2027-01-30T08:00:00-03:00',
  countdownLabel: 'pro dia 30 chegar',
  // alerta no topo do site
  alert: 'As datas tão acabando: na chácara só sobrou 30/01 a 01/02. A gente já vai deixar reservado pra não perder (dá pra cancelar se a galera escolher outra), então responde logo!',
  // frases que deixam explícito o que pode gerar dúvida
  notes: {
    // embaixo do "R$ 300 por pessoa"
    covers: 'É tudo: lugar, transporte, futsabão e o que sobrar vira comida e bebida. Ninguém paga nada à parte.',
    // embaixo dos jeitos de ir (o transporte sai do caixa)
    transport: 'O transporte já tá dentro dos R$ 300: sai do caixa, ninguém paga gasolina por fora.',
    // na votação, embaixo do "vai?"
    confirm: '"Tô dentro" conta pros 12: quer dizer que tu vai e entra com os R$ 300. Teu nome e teu voto aparecem pra galera.',
  },
  people: { min: 9, base: 12, max: 15, scenarios: [9, 12, 15] },
  // Votação: endereço do web app do Google Apps Script (ver scripts/votacao.gs).
  // Vazio = modo prévia (votos de exemplo, guardados só no aparelho).
  voteUrl: 'https://script.google.com/macros/s/AKfycbwOtQ4RyF0jugQMA412m098wZVTgQQEGFZBfqDVvG47lS8h7v9Smm-0j7prZxewQiIs/exec',
  price: 300,
  // uma pessoa entra com R$ 600 (não aparece no site, só entra na conta do caixa)
  extraPrice: 600,
  extraPeople: 1,
}

/* Quanto entra no caixa com N pessoas. */
export const caixa = (n) =>
  (n - TRIP.extraPeople) * TRIP.price + TRIP.extraPeople * TRIP.extraPrice

/* ------------------------------------------------------------------
   FOTOS DA JORNADA (valem pra todas as vibes)
   Jeito mais fácil: jogar os arquivos em src/assets/jornada/<parada>/ (ver src/data/photos.js).
   Também dá pra listar aqui à mão: { src: '/img/itacolomi/1.webp', note: 'a primeira vez lá' }
   Enquanto não houver foto nenhuma, aparece um espaço reservado.
------------------------------------------------------------------- */
export const SHARED_PHOTOS = {
  // fotos da primeira ida a Novo Itacolomi
  itacolomi: [],
  // fotos de estrada / do caminho
  estrada: [],
}

// texto do espaço reservado de cada cena sem foto
export const PLACEHOLDERS = {
  itacolomi: 'fotos da primeira ida a Itacolomi',
  estrada: 'fotos da estrada',
  sarau: 'foto do nosso sarau',
  dia: 'foto do dia livre',
  ritmo: 'foto da despedida',
  van: 'foto da van',
  ody: 'fotos do Ody Park',
  volta: 'foto da volta',
}

export const VIBE_ORDER = ['chacara', 'cabanas', 'ody']

export const VIBES = {
  chacara: {
    id: 'chacara',
    n: '01',
    name: 'Chácara Alta Vista',
    short: 'Chácara',
    place: 'Warta · Londrina',
    kicker: 'a casa do esporte & churrasco',
    dest: 'chácara',
    heroLine: 'futebol, piscina, futsabão & sarau',
    heroSub:
      'Família reunida em Novo Itacolomi, estrada com a galera, futebol de sabão, piscina e sarau até tarde. Escolha como vamos viver esses dias.',
    marquee: ['futebol na grama', 'piscina com cascata', 'futsabão', 'sinuca', 'fogão a lenha', 'sarau', 'violão'],
    pitch:
      '3.000 m² só pra gente. Campeonato de futebol na grama, mergulho na piscina com cascata, futebol de sabão escorregando à tarde, sinuca no salão e churrasco no fogão a lenha.',
    // "o que rola": cada item vira um desenho (nomes em src/components/Sketch.jsx)
    doing: [
      { t: 'campeonato na grama', art: 'futebol' },
      { t: 'piscina com cascata', art: 'cascata' },
      { t: 'futsabão inflável', art: 'futsabao' },
      { t: 'sinuca', art: 'sinuca' },
      { t: 'churrasco no fogão a lenha', art: 'churrasco' },
      { t: 'ping-pong', art: 'pingpong' },
    ],
    stay: 'Cabe até 15 com folga: 3 quartos, 8 camas + colchões extras e 3 banheiros.',
    // o detalhe que só ela tem (desenho do fogão aceso + foto)
    unique: {
      art: 'fogao',
      kicker: 'só a chácara tem',
      title: 'Fogão a lenha de verdade',
      text: 'A panela fica no fogo enquanto a galera conversa em volta, o cheiro de lenha toma a casa e de manhã o café sai dali mesmo.',
      photo: { src: '/img/chacara-3.webp', note: 'ele mesmo, esperando a gente' },
    },
    // "antes e depois": foto antiga da galera (src/assets/antes/) ao lado do lugar vazio
    story: {
      kicker: 'a gente já tem história',
      title: 'Falta escrever esse capítulo',
      before: 'foto antiga da galera',
      after: { src: '/img/chacara-1.webp', note: 'a próxima foto é aqui' },
    },
    link: 'https://www.airbnb.com.br/rooms/804996807567433942',
    linkLabel: 'Ver o anúncio no Airbnb',
    photos: [
      { src: '/img/chacara-1.webp', note: 'a piscina com cascata' },
      { src: '/img/chacara-4.webp', note: 'o campo (e a quadra do futsabão)' },
      { src: '/img/chacara-6.webp', note: 'área do churrasco' },
      { src: '/img/chacara-3.webp', note: 'fogão a lenha' },
      { src: '/img/chacara-5.webp', note: 'sinuca' },
      { src: '/img/chacara-2.webp', note: 'mais piscina, sim' },
      { src: '/img/chacara-9.webp', note: 'quarto' },
      { src: '/img/chacara-8.webp', note: 'cozinha' },
    ],
    // fotos de cada cena da jornada
    scenes: {
      // coloque aqui as fotos geradas por IA do sarau
      sarau: [],
      dia: [
        { src: '/img/chacara-4.webp', note: 'futebol + futsabão aqui' },
        { src: '/img/chacara-1.webp', note: 'mergulho na cascata' },
        { src: '/img/chacara-6.webp', note: 'churrasco' },
        { src: '/img/chacara-5.webp', note: 'sinuca valendo nada' },
      ],
      ritmo: [{ src: '/img/chacara-9.webp', note: 'quem fica, dorme mais uma' }],
    },
    // cores do céu em WebGL (r,g,b de 0 a 1) + formato do horizonte
    sky: { accent: [0.06, 0.62, 0.42], accent2: [0.96, 0.62, 0.04], shape: [1, 0, 0], fire: 0.85 },
    itineraries: ['r1'],
    route: 'londrina',
    transport: ['comboio', 'carro', 'onibus'],
    budget: {
      label: 'Chácara Alta Vista (30/01 a 01/02)',
      items: [
        { key: 'host', label: 'Hospedagem', min: 2330, max: 2330 },
        { key: 'trans', label: 'Transporte', min: 400, max: 400 },
        { key: 'fun', label: 'Futsabão', min: 450, max: 450 },
      ],
      restLabel: 'comida e bebida',
    },
  },

  cabanas: {
    id: 'cabanas',
    n: '02',
    name: 'Cabanas Bosque Encantado',
    short: 'Cabanas',
    place: 'Bratislava · Cambé',
    kicker: 'o refúgio do sarau & fogueira',
    dest: 'cabanas',
    heroLine: 'fogueira, violão & cinema no mato',
    heroSub:
      'Família reunida em Novo Itacolomi, estrada com a galera e um acampamento chique no meio da mata: fogueira, violão e sarau até tarde. Escolha como vamos viver esses dias.',
    marquee: ['fogueira', 'violão & ukulele', 'cinema no telão', 'ping-pong', 'céu estrelado', 'futsabão', 'sarau'],
    pitch:
      'Acampamento chique no meio da mata: 5 cabanas de madeira, roda de fogueira debaixo das estrelas, cinema ao ar livre no telão e mesa de ping-pong.',
    // "o que rola": cada item vira um desenho (nomes em src/components/Sketch.jsx)
    doing: [
      { t: 'roda de fogueira', art: 'fogueira' },
      { t: 'sarau com violão', art: 'violao' },
      { t: 'cinema no telão', art: 'telao' },
      { t: 'ping-pong', art: 'pingpong' },
      { t: 'noite estrelada', art: 'estrelas' },
      { t: 'futsabão', art: 'futsabao' },
    ],
    stay: '5 cabanas com colchão de casal — até 10 nas cabanas, acima disso a gente combina colchão extra. Cozinha e banheiros compartilhados. Não tem piscina nem campo.',
    unique: {
      art: 'telao',
      kicker: 'só as cabanas têm',
      title: 'Cinema no meio do mato',
      text: 'Um telão entre as árvores, cada um com seu cobertor, o filme passando e o céu cheio de estrela por cima. Nem precisa ser filme bom.',
      photo: { src: '/img/cabanas-6.webp', note: 'a sessão das 22h' },
    },
    story: {
      kicker: 'a gente já tem história',
      title: 'Falta escrever esse capítulo',
      before: 'foto antiga da galera',
      after: { src: '/img/cabanas-3.webp', note: 'a próxima foto é aqui' },
    },
    link: 'https://www.airbnb.com.br/rooms/1726935758701641036',
    linkLabel: 'Ver o anúncio no Airbnb',
    photos: [
      { src: '/img/cabanas-1.webp', note: 'de noite fica assim' },
      { src: '/img/cabanas-11.webp', note: 'as cabanas' },
      { src: '/img/cabanas-3.webp', note: 'a roda da fogueira' },
      { src: '/img/cabanas-2.webp', note: 'cabana por dentro' },
      { src: '/img/cabanas-6.webp', note: 'o telão no meio do mato' },
      { src: '/img/cabanas-4.webp', note: 'teto de madeira' },
      { src: '/img/cabanas-5.webp', note: 'céu de verdade' },
    ],
    scenes: {
      sarau: [
        { src: '/img/cabanas-1.webp', note: 'o varal aceso' },
        { src: '/img/cabanas-3.webp', note: 'nossa roda' },
        { src: '/img/cabanas-6.webp', note: 'filme no telão' },
      ],
      dia: [
        { src: '/img/cabanas-11.webp', note: 'as cabanas de dia' },
        { src: '/img/cabanas-2.webp', note: 'pausa entre um jogo e outro' },
      ],
      ritmo: [{ src: '/img/cabanas-4.webp', note: 'mais uma noite?' }],
    },
    sky: { accent: [0.18, 0.42, 0.25], accent2: [0.92, 0.35, 0.05], shape: [0, 1, 0], fire: 1 },
    itineraries: ['r1', 'r2'],
    route: 'londrina',
    transport: ['comboio', 'carro', 'onibus'],
    budget: {
      label: 'Cabanas Bosque Encantado (30/01 a 01/02)',
      items: [
        { key: 'host', label: 'Hospedagem', min: 1440, max: 2160 },
        { key: 'trans', label: 'Transporte', min: 400, max: 400 },
        { key: 'fun', label: 'Futsabão', min: 450, max: 450 },
      ],
      restLabel: 'comida e bebida',
    },
  },

  ody: {
    id: 'ody',
    n: '03',
    name: 'Ody Park Aquático',
    short: 'Ody Park',
    place: 'Iguaraçu · Maringá',
    kicker: 'adrenalina na água',
    dest: 'Ody Park',
    dayOnly: true, // sem noite/sarau nessa vibe
    heroLine: 'ondas de 3 metros, toboágua & churrasco',
    heroSub:
      'Família reunida em Novo Itacolomi o fim de semana inteiro e, no domingo, uma van só nossa rumo ao Ody Park. Escolha como vamos viver esses dias.',
    marquee: ['piscina de ondas', 'tsunami de 3 m', 'toboágua', 'rio lento', 'quiosque reservado', 'van da galera'],
    pitch:
      'Fim de semana inteiro com a família em Novo Itacolomi e domingo de excursão numa van fechada só nossa: piscina de ondas de 3 metros (a Tsunami), toboáguas radicais, rio lento e quiosque de churrasco reservado.',
    // "o que rola": cada item vira um desenho (nomes em src/components/Sketch.jsx)
    doing: [
      { t: 'piscina de ondas Tsunami', art: 'onda' },
      { t: 'toboáguas radicais', art: 'tobogua' },
      { t: 'rio lento', art: 'boia' },
      { t: 'quiosque reservado', art: 'quiosque' },
      { t: 'van só nossa', art: 'van' },
    ],
    stay: 'Sem hospedagem: a base é Novo Itacolomi, com a família. É bate-volta de domingo.',
    story: {
      kicker: 'a gente já tem história',
      title: 'Falta escrever esse capítulo',
      before: 'foto antiga da galera',
      after: { src: '/img/ody-2.webp', note: 'a próxima foto é aqui' },
    },
    link: 'https://odypark.com.br/',
    linkLabel: 'Ver o site do Ody Park',
    photos: [
      { src: '/img/ody-2.webp', note: 'a piscina de ondas' },
      { src: '/img/ody-8.webp', note: 'toboáguas' },
      { src: '/img/ody-3.webp', note: 'descida de boia' },
      { src: '/img/ody-4.webp', note: 'rio lento' },
      { src: '/img/ody-7.webp', note: 'o tobogã amarelo' },
      { src: '/img/ody-5.webp', note: 'quiosque do churrasco' },
    ],
    scenes: {
      // mesma foto do "Pé na estrada" (pasta jornada/estrada), com outra legenda
      van: (FOLDER_PHOTOS.estrada || []).slice(0, 1).map((p) => ({ ...p, note: 'van lotada e ninguém acordou direito' })),
      ody: [
        { src: '/img/ody-2.webp', note: 'a Tsunami: 3 metros' },
        { src: '/img/ody-8.webp', note: 'toboáguas' },
        { src: '/img/ody-3.webp', note: 'descida de boia' },
        { src: '/img/ody-4.webp', note: 'rio lento' },
        { src: '/img/ody-5.webp', note: 'nosso quiosque' },
      ],
    },
    sky: { accent: [0.05, 0.6, 0.86], accent2: [0.98, 0.57, 0.24], shape: [0, 0, 1], fire: 0 },
    itineraries: ['r3'],
    route: 'iguaracu',
    transport: ['van'],
    budget: {
      label: 'Ody Park no domingo',
      items: [
        // ingresso é por pessoa: o valor acompanha o número de pessoas
        { key: 'host', label: 'Ingressos', perPerson: 110 },
        { key: 'trans', label: 'Van', min: 1600, max: 1600 },
        { key: 'fun', label: 'Quiosque', min: 350, max: 350 },
      ],
      restLabel: 'alimentação',
    },
  },
}

/* ------------------------------ ROTEIROS ------------------------------
   Cada parada vira uma "cena" da jornada:
   - scene: de onde vêm as fotos (SHARED_PHOTOS ou VIBES[x].scenes)
   - time:  'day' ou 'night' — o céu do site acompanha
----------------------------------------------------------------------- */
const isCab = (v) => v.id === 'cabanas'
const lugar = (v) => (isCab(v) ? 'nas cabanas' : 'na chácara')
// dia livre nas cabanas: o dia é cheio (os desenhos aparecem no meio da parada)
const CAB_DIA = 'Futsabão no gramado, vôlei, ping-pong valendo a honra, baralho na mesa, churrasco no meio da tarde. A rede é só pra quem cansar.'
const CAB_DOING = [
  { t: 'futsabão', art: 'futsabao' },
  { t: 'vôlei', art: 'volei' },
  { t: 'ping-pong', art: 'pingpong' },
  { t: 'baralho', art: 'baralho' },
]

export const ITINERARIES = {
  r1: {
    id: 'r1',
    tab: 'Roteiro 1',
    tabNote: 'sábado em família primeiro',
    steps: (v) => [
      { short: 'Itacolomi', when: 'sáb 30/01 · de dia', title: 'Família em Novo Itacolomi', text: 'Encontro e almoço com as famílias e as crianças. Onde tudo começa.', icon: 'home', scene: 'itacolomi', time: 'day' },
      { short: 'Estrada', when: 'sáb 30/01 · 18h', title: 'Pé na estrada', text: 'A galera pega a estrada junta rumo a Londrina/Cambé. 75 km, ~1h15 de playlist.', icon: 'car', scene: 'estrada', time: 'day' },
      { short: 'Sarau', when: 'sábado · noite', title: isCab(v) ? 'Fogueira acesa' : 'Chegada e sarau', text: isCab(v) ? 'Chegada nas cabanas, jantar, roda de fogueira, violão e filme no telão.' : 'Chegada na chácara, jantar, jogos e sarau com violão e ukulele até cansar.', icon: 'fire', scene: 'sarau', time: 'night' },
      { short: 'Dia livre', when: 'dom 31/01 · o dia todo', title: 'Dia livre só nosso', text: isCab(v) ? CAB_DIA : 'Futebol na grama, piscina, churrasco e a tarde de futebol de sabão.', icon: 'sun', scene: 'dia', time: 'day', doing: isCab(v) ? CAB_DOING : undefined },
      { short: 'Volta', when: 'dom à noite ou seg 01/02 · 10h', title: 'Cada um no seu ritmo', text: `Quem trabalha segunda cedo volta domingo à noite; quem puder emendar dorme ${lugar(v)} e sai segunda às 10h.`, icon: 'moon', scene: 'ritmo', time: 'day' },
    ],
  },
  r2: {
    id: 'r2',
    tab: 'Roteiro 2',
    tabNote: 'invertido: festa primeiro',
    steps: (v) => [
      { short: 'Estrada', when: 'sáb 30/01 · cedo', title: `Direto pra${isCab(v) ? 's cabanas' : ' chácara'}`, text: `Entrada direto ${lugar(v)} em Londrina/Cambé.`, icon: 'car', scene: 'estrada', time: 'day' },
      { short: 'Dia livre', when: 'sábado · o dia todo', title: 'O dia é nosso', text: isCab(v) ? CAB_DIA : 'Futebol na grama, piscina, churrasco e futebol de sabão.', icon: 'sun', scene: 'dia', time: 'day', doing: isCab(v) ? CAB_DOING : undefined },
      { short: 'Sarau', when: 'sábado · noite', title: isCab(v) ? 'Fogueira e pernoite' : 'Sarau e pernoite', text: isCab(v) ? 'Roda de fogueira, sarau, filme no telão e pernoite nas cabanas.' : 'Sarau, resenha e pernoite na chácara.', icon: 'fire', scene: 'sarau', time: 'night' },
      { short: 'Descida', when: 'dom 31/01 · até 10h', title: 'Descida pra Itacolomi', text: 'Check-out e a galera desce pra Novo Itacolomi (1h15).', icon: 'car', scene: 'estrada', time: 'day' },
      { short: 'Itacolomi', when: 'domingo · almoço e tarde', title: 'Almoço de domingo', text: 'Almoço e tarde com a família em Novo Itacolomi.', icon: 'home', scene: 'itacolomi', time: 'day' },
    ],
  },
  r3: {
    id: 'r3',
    tab: 'Roteiro 3',
    tabNote: 'base em Itacolomi + van no domingo',
    steps: () => [
      { short: 'Itacolomi', when: 'sáb 30/01', title: 'Todo mundo em Itacolomi', text: 'Reunidos com a família em Novo Itacolomi.', icon: 'home', scene: 'itacolomi', time: 'day' },
      { short: 'Van', when: 'dom 31/01 · 07h', title: 'Saída da van', text: 'A nossa van sai de Novo Itacolomi rumo a Iguaraçu. 95 km, 1h25.', icon: 'van', scene: 'van', time: 'day' },
      { short: 'Ody Park', when: 'dom 31/01 · 09h às 18h', title: 'Dia inteiro no Ody Park', text: 'Piscina de ondas de 3 metros, toboágua, rio lento e quiosque de churrasco reservado.', icon: 'wave', scene: 'ody', time: 'day' },
      { short: 'Volta', when: 'dom 31/01 · 18h30–20h', title: 'Volta pra casa', text: 'Retorno da van pra Novo Itacolomi e Apucarana, todo mundo queimado de sol.', icon: 'van', scene: 'volta', time: 'day', photo: false },
    ],
  },
}

// fotos de uma parada: pasta da vibe > pasta geral > lista compartilhada > fotos da vibe
export const scenePhotos = (v, scene) => [
  ...(FOLDER_PHOTOS[`${scene}-${v.id}`] || []),
  ...(FOLDER_PHOTOS[scene] || []),
  ...(SHARED_PHOTOS[scene] || []),
  ...(v.scenes?.[scene] || []),
].map(withSrcSet)

/* ------------------------------ ROTAS ------------------------------ */
export const ROUTES = {
  londrina: {
    stops: [
      { name: 'Novo Itacolomi', note: 'família' },
      { name: 'Apucarana', leg: '28 km · 25 min' },
      { name: 'Londrina / Cambé', leg: '47 km · 50 min', dest: true },
    ],
    total: '75 km · 1h15',
  },
  iguaracu: {
    stops: [
      { name: 'Novo Itacolomi', note: 'família' },
      { name: 'Iguaraçu', leg: '95 km · 1h25', dest: true },
    ],
    total: '95 km · 1h25',
    back: 'na volta, deixa a galera em Novo Itacolomi e Apucarana',
  },
}

export const TRANSPORT = {
  comboio: {
    icon: 'car',
    name: 'Comboio da galera',
    text: '3 a 4 carros indo juntos, um atrás do outro.',
    price: 'R$ 350–400',
    priceNote: 'de gasolina no total, dividido',
  },
  carro: {
    icon: 'key',
    name: '1 carro extra alugado',
    text: 'Se faltar vaga nos carros, alugamos um de 5 lugares por 2 diárias e todo mundo vai junto, porta a porta.',
    price: '~R$ 400',
    priceNote: 'já com gasolina',
  },
  onibus: {
    icon: 'bus',
    name: 'Carona + ônibus + Uber',
    text: 'Carona até a rodoviária de Apucarana, ônibus até Londrina e Uber até o lugar.',
    price: 'R$ 30–37',
    priceNote: 'por pessoa no ônibus + ~R$ 45 por carro no Uber',
  },
  van: {
    icon: 'van',
    name: 'Van fretada · 15 lugares',
    text: 'Todo mundo dentro da mesma van, com motorista. Sai 07h de Novo Itacolomi e volta no fim da tarde.',
    price: 'R$ 1.400–1.800',
    priceNote: 'bate-volta do Ody Park',
  },
}
